import { NextResponse } from "next/server";
import { getWsTicket } from "@/actions/getWsTicket";

export async function GET() {
  try {
    const ticket = await getWsTicket();

    if (!ticket) {
      return NextResponse.json(
        { authorized: false, error: "Não autorizado" },
        { status: 401 },
      );
    }

    return NextResponse.json({ authorized: true, ticket });
  } catch {
    return NextResponse.json(
      { authorized: false, error: "Erro interno do servidor" },
      { status },
    );
  }
}
