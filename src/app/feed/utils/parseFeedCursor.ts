export function parseFeedCursor(nextPage: string | null | undefined): string | null {
  if (!nextPage) return null;

  try {
    const url = nextPage.startsWith("http")
      ? new URL(nextPage)
      : new URL(
          `http://dummy${nextPage.startsWith("?") ? "/" : ""}${nextPage}`,
        );
    return url.searchParams.get("cursor");
  } catch {
    return null;
  }
}
