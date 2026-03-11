import { NextResponse } from "next/server";

const allow = "GET,POST,PUT,PATCH,DELETE,HEAD,OPTIONS";

function notFound() {
  return NextResponse.json(
    { error: "Not found" },
    { status: 404, headers: { Allow: allow } },
  );
}

export function GET() {
  return notFound();
}

export function POST() {
  return notFound();
}

export function PUT() {
  return notFound();
}

export function PATCH() {
  return notFound();
}

export function DELETE() {
  return notFound();
}

export function HEAD() {
  return new NextResponse(null, { status: 404, headers: { Allow: allow } });
}

export function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: { Allow: allow } });
}

