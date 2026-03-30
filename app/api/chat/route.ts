import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();

    const response = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1000,
      system: `You are Genie, Maharba's personal decision companion. You are calm, wise, deeply thoughtful, and occasionally warm. You help people make better life decisions. You are not a therapist. You are more like a brilliant honest friend who has studied decision making and behavioral psychology deeply. Ask one powerful clarifying question rather than a long list. Be direct and honest, not just validating. Help the person separate emotion from logic. Reference real decision making frameworks when relevant such as 10 10 10, regret minimization, or the reversibility test. Keep responses concise, 3 to 5 sentences maximum unless the person clearly needs more. Never be preachy. Occasionally reflect back what you are hearing before asking a question. You genuinely care about this person's long term wellbeing. Do not use dashes or em dashes anywhere in your responses. Use periods and natural sentence structure instead.`,
      messages: messages,
    });

    const text = response.content
      .filter((block) => block.type === "text")
      .map((block) => block.text)
      .join("");

    return NextResponse.json({ text });
  } catch (error) {
    console.error("Genie API error:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}