// app/api/route.js
import { NextRequest } from "next/server";

const getHeaders = (r: NextRequest) => {
  const origin = r.headers.get("origin");
  const allowedOrigins = ["https://minesweeper.online"];

  const headers: Record<string, string> = {
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Max-Age": "86400",
  };

  if (origin && allowedOrigins.includes(origin)) {
    headers["Access-Control-Allow-Origin"] = origin;
  }
  return headers;
};

export async function OPTIONS(request: NextRequest) {
  const headers = getHeaders(request);
  return new Response(null, {
    status: 204,
    headers,
  });
}

export async function POST(request: NextRequest) {
  const headers = getHeaders(request);
  return new Response(null, {
    status: 204,
    headers,
  });
}
