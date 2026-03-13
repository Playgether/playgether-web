import { NextResponse } from "next/server";

/**
 * Extrai status e corpo de erro do Axios para repassar ao cliente.
 * Caso seja 403 com TERMS_NOT_ACCEPTED, o frontend pode exibir o modal.
 */
export function handleApiError(
  error: unknown,
  fallbackMessage = "Request failed"
): NextResponse {
  const err = error as {
    response?: { status: number; data?: Record<string, unknown> };
  };
  const status = err.response?.status ?? 500;
  const data = err.response?.data ?? { error: fallbackMessage };

  if (status === 403 && data?.detail === "TERMS_NOT_ACCEPTED") {
    return NextResponse.json(data, { status });
  }

  return NextResponse.json(
    typeof data === "object" ? data : { error: fallbackMessage },
    { status }
  );
}
