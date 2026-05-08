import { apiFetch } from "@/services/apiFetch";

export async function deleteMilestone(milestoneId: number): Promise<void> {
  const response = await apiFetch(`/api/milestones/${milestoneId}`, {
    method: "DELETE",
    credentials: "include",
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData?.detail || errorData?.error || "Erro ao excluir milestone"
    );
  }
}
