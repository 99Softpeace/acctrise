import { NextRequest, NextResponse } from "next/server";
import { getRequestUser } from "@/lib/auth/request";
import { connectMongo } from "@/lib/mongodb";
import { LoginHistory } from "@/models/login-history";

export async function GET(request: NextRequest) {
  const user = await getRequestUser(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectMongo();
  const history = await LoginHistory.find({ userId: user.id })
    .sort({ createdAt: -1 })
    .limit(20)
    .select("ipAddress userAgent device location isSuccessful failureReason createdAt");

  return NextResponse.json({
    success: true,
    devices: history.map((entry) => ({
      id: entry._id.toString(),
      ipAddress: entry.ipAddress,
      userAgent: entry.userAgent,
      device: entry.device,
      location: entry.location,
      isSuccessful: entry.isSuccessful,
      failureReason: entry.failureReason,
      createdAt: entry.createdAt
    }))
  });
}
