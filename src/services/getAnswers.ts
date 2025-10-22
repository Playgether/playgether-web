export async function getAnswers(id: number, pageParam: string | null = null) {
  try {
    const response = await fetch(
      `/api/replies/${id}?cursor=${pageParam || ""}`
    );
    if (!response.ok) throw new Error("Request failed");
    return await response.json();
  } catch (error) {
    console.error("Error fetching comments:", error);
    return {
      data: [],
      next_page: null,
      previous_page: null,
    };
  }
}
