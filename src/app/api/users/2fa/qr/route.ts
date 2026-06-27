import { NextRequest, NextResponse } from "next/server";
import QRCode from "qrcode";

export async function GET(request: NextRequest) {
  const uri = request.nextUrl.searchParams.get("uri");
  if (!uri) return NextResponse.json({ detail: "uri obrigatório" }, { status: 400 });

  try {
    const dataUrl = await QRCode.toDataURL(uri, { width: 200, margin: 1 });
    // Convert base64 data URL to buffer
    const base64 = dataUrl.replace(/^data:image\/png;base64,/, "");
    const buffer = Buffer.from(base64, "base64");
    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "no-store",
      },
    });
  } catch {
    return NextResponse.json({ detail: "Erro ao gerar QR code" }, { status: 500 });
  }
}
