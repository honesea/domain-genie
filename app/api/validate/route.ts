import { Ratelimit } from "@upstash/ratelimit";
import { kv } from "@vercel/kv";
import { NextRequest, NextResponse } from "next/server";

const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY || "";

const ratelimit = new Ratelimit({
  redis: kv,
  limiter: Ratelimit.slidingWindow(50, "60 s"),
});

export async function POST(req: NextRequest) {
  const ip = req.ip ?? "127.0.0.1";
  const { success } = await ratelimit.limit(ip);

  if (!success) {
    return NextResponse.json(
      { error: "You have reached your request limit" },
      { status: 429 },
    );
  }

  const { domain } = await req.json();

  try {
    const options = {
      headers: {
        "X-RapidAPI-Key": RAPIDAPI_KEY,
        "X-RapidAPI-Host": "domainr.p.rapidapi.com",
      },
    };

    const params = new URLSearchParams({
      "mashape-key": RAPIDAPI_KEY,
      domain,
    });

    const response = await fetch(
      "https://domainr.p.rapidapi.com/v2/status?" + params.toString(),
      options,
    );

    let domainStatus = "";
    try {
      const result = await response.json();
      const statusString = result.status[0].status;
      const statusList = statusString.split(" ");
      domainStatus = statusList.includes("inactive")
        ? "AVAILABLE"
        : "UNAVAILABLE";
    } catch (error) {
      domainStatus = "UNAVAILABLE";
    }

    return NextResponse.json({ domain_status: domainStatus }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: error.status || 500 },
    );
  }
}
