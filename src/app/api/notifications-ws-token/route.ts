import { NextResponse } from "next/server";
import { getWsTicket } from "@/actions/getWsTicket";

export async function GET() {
  const ticket = await getWsTicket();

  if (!ticket) {
    return NextResponse.json({ ticket: null }, { status: 401 });
  }

  return NextResponse.json({ ticket });
}
