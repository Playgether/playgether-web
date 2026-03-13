// app/api/likes/route.ts
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { api } from "@/services/api";
import { handleApiError } from "../utils/handleApiError";

export async function POST(request: NextRequest) {
  const accessToken = (await cookies()).get("accessToken")?.value;

  try {
    const data = await request.json();
    const response = await api.post("/api/v1/likes/", data, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    return NextResponse.json(response.data);
  } catch (error) {
    return handleApiError(error, "Erro ao curtir");
  }
}

export async function DELETE(request: NextRequest) {
  const accessToken = (await cookies()).get("accessToken")?.value;

  try {
    const { searchParams } = new URL(request.url);
    const objectId = searchParams.get("object_id");
    const contentType = searchParams.get("content_type");

    if (!objectId) {
      return NextResponse.json(
        { error: "object_id é obrigatório" },
        { status: 400 }
      );
    }

    const response = await api.delete(
      `/api/v1/likes/${contentType}/${objectId}/`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    return NextResponse.json({ status: response.status });
  } catch (error) {
    return handleApiError(error, "Erro ao remover curtida");
  }
}
