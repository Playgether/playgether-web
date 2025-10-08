export async function getFeedClient(pageParam: string | null = null) {
  try {
    const response = await fetch(`/api/feed?cursor=${pageParam || ""}`);
    if (!response.ok) throw new Error("Request failed");
    return await response.json();
  } catch (error) {
    console.error("Error fetching feed:", error);
    return {
      data: [],
      next_page: null,
    };
  }
}
