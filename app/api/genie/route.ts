import OpenAI from "openai";
import { OpenAIStream, StreamingTextResponse } from "ai";
import { ChatCompletionMessageParam } from "openai/resources/chat/index.mjs";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const runtime = "edge";

export async function POST(req: Request) {
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
    return Response.json(
      { error: error.message || "Internal Server Error" },
      { status: error.status || 500 },
    );
  }
}
