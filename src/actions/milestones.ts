"use server";

import { api } from "@/services/api";
import { cookies } from "next/headers";

function getErrorMessage(data: unknown): string {
  const fallback = "Ocorreu um erro. Tente novamente.";
  const clean = (s: string) =>
    s.startsWith("<") || s.length > 200 ? fallback : s;
  if (typeof data === "string") return clean(data);
  if (data && typeof data === "object") {
    const d = data as Record<string, unknown>;
    if (typeof d.detail === "string") return clean(d.detail);
    if (Array.isArray(d.detail))
      return clean(d.detail.map((x: unknown) => String(x)).join(". "));
    const vals = Object.values(d).flatMap((v) =>
      Array.isArray(v) ? v.map(String) : [String(v)]
    );
    if (vals.length) return clean(vals.join(". "));
  }
  return fallback;
}

export interface MilestoneMediaInput {
  media_url: string;
  media_type: "image" | "video";
  public_id: string;
}

export async function createMilestone(
  profileId: number,
  data: {
    title: string;
    description?: string;
    date: string;
    medias?: MilestoneMediaInput[];
  }
) {
  try {
    const accessToken = (await cookies()).get("accessToken")?.value;

    if (!accessToken) {
      return { status: 401, error: "Não autorizado" };
    }

    const response = await api.post(
      `/api/v1/profiles/${profileId}/milestones/`,
      {
        title: data.title,
        description: data.description || "",
        date: data.date,
        medias: data.medias || [],
      },
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );

    return { status: response.status, data: response.data };
  } catch (error: any) {
    return {
      status: error.response?.status || 500,
      error: getErrorMessage(error.response?.data) || "Erro ao criar marco.",
    };
  }
}

export async function updateMilestone(
  milestoneId: number,
  data: {
    title?: string;
    description?: string;
    date?: string;
    medias?: MilestoneMediaInput[];
  }
) {
  try {
    const accessToken = (await cookies()).get("accessToken")?.value;

    if (!accessToken) {
      return { status: 401, error: "Não autorizado" };
    }

    const response = await api.patch(
      `/api/v1/milestones/${milestoneId}/`,
      data,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );

    return { status: response.status, data: response.data };
  } catch (error: any) {
    return {
      status: error.response?.status || 500,
      error: getErrorMessage(error.response?.data) || "Erro ao atualizar marco.",
    };
  }
}
