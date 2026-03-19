// app/api/route.js
import { NextRequest } from "next/server";

const baseUrl = process.env.NEXT_API_BASE!;

const getHeaders = (r: NextRequest) => {
  const origin = r.headers.get("origin");
  const allowedOrigins = ["https://minesweeper.online"];

  const headers: Record<string, string> = {
    "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
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
  const path = request.nextUrl.pathname.substring(4);
  return fetch(baseUrl + path, {
    method: request.method,
    headers: request.headers,
  }).then((r) => relayResponse(r, request));
}

export async function GET(request: NextRequest) {
  const path = request.nextUrl.pathname.substring(4);
  return fetch(baseUrl + path).then((r) => relayResponse(r, request));
}

const relayResponse = async (res: Response, req: NextRequest) => {
  const body = await res.text();
  const headers = { ...Object.fromEntries(res.headers), ...getHeaders(req) };
  return new Response(body, {
    status: res.status,
    headers,
  });
};
