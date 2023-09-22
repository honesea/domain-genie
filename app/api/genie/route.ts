import OpenAI from "openai";
import { OpenAIStream, StreamingTextResponse } from "ai";
import { ChatCompletionMessageParam } from "openai/resources/chat/index.mjs";
import { Ratelimit } from "@upstash/ratelimit";
import { kv } from "@vercel/kv";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

const ratelimit = new Ratelimit({
  redis: kv,
  limiter: Ratelimit.slidingWindow(50, "60 s"),
});

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: NextRequest) {
  const ip = req.ip ?? "127.0.0.1";
  const { success } = await ratelimit.limit(ip);

  if (!success) {
    return NextResponse.json(
      { error: "You have reached your request limit." },
      { status: 429 },
    );
  }

  const { description } = await req.json();

  const messages: ChatCompletionMessageParam[] = [
    {
      role: "system",
      content: `
      You are a domain name generating expert. Your goal is to generate a domain name ideas for a new startup.
      You are given a description of the startup and you have to generate 12 domain name ideas.
      The domain name should be easy to read. It should be between 5 and 15 characters long. 
      You must output the domains in a comma seperated list. 
      The domain must end in '.com' or '.io' or '.ai'. Each item in the list must end in '.com' or '.io' or '.ai'.
      Do not output any other text. Do not output any exlplanations.
      `,
    },
    {
      role: "user",
      content: `description: ${description}}`,
    },
  ];

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      stream: true,
      messages,
    });

    const stream = OpenAIStream(response);
    return new StreamingTextResponse(stream);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: error.status || 500 },
    );
  }
}
