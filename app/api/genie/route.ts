import { OpenAIStream, StreamingTextResponse } from "ai";
import {
  ChatCompletionRequestMessage,
  Configuration,
  OpenAIApi,
} from "openai-edge";

// Create an OpenAI API client (that's edge friendly!)
const config = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(config);

// IMPORTANT! Set the runtime to edge
export const runtime = "edge";

export async function POST(req: Request) {
  // Extract the `messages` from the body of the request
  const { description } = await req.json();

  // Create a prompt for the OpenAI API
  const messages: ChatCompletionRequestMessage[] = [
    {
      role: "system",
      content: `
      You are a domain name generating expert. Your goal is to generate a domain name ideas for a new startup.
      You are given a description of the startup and you have to generate 12 domain name ideas.
      The domain name should be easy to read. It should be between 5 and 15 characters long. 
      You must output the domains in a comma seperated list. The domain must end in '.com'. Each item in the list must end in '.com'.
      Do not output any other text. Do not output any exlplanations.
      `,
    },
    {
      role: "user",
      content: `description: ${description}}`,
    },
  ];

  // Ask OpenAI for a streaming chat completion given the prompt
  const response = await openai.createChatCompletion({
    model: "gpt-3.5-turbo",
    stream: true,
    messages,
  });

  // Convert the response into a friendly text-stream
  const stream = OpenAIStream(response);

  // Respond with the stream
  return new StreamingTextResponse(stream);
}
