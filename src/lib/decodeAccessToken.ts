import jwt_decode from "jwt-decode";

export type AccessTokenPayload = {
  username?: string;
  user_id?: number | string;
};

/** Decodifica o access JWT (mesmo padrão de `decodeUser`); a assinatura é validada na API Django. */
export function decodeAccessToken(token: string): AccessTokenPayload | null {
  try {
    return jwt_decode<AccessTokenPayload>(token);
  } catch {
    return null;
  }
}
