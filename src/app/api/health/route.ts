import { NextResponse } from "next/server";
import { connectMongo } from "@/lib/mongodb";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  const headers = { "Cache-Control": "no-store" };
  if (!process.env.NEXTAUTH_SECRET || !process.env.MONGODB_URI) {
    return NextResponse.json({ status: "unhealthy" }, { status: 503, headers });
  }

  try {
    const mongoose = await connectMongo();
    await mongoose.connection.db!.command({ ping: 1 });
    return NextResponse.json({ status: "healthy" }, { headers });
  } catch {
    return NextResponse.json({ status: "unhealthy" }, { status: 503, headers });
  }
}
