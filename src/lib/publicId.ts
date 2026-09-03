export const PUBLIC_ID_LENGTH = 12;
export const PUBLIC_ID_PATTERN = /^[A-Za-z0-9]{12}$/;

export type PublicId = string;

export function isPublicId(value: string): boolean {
  return PUBLIC_ID_PATTERN.test(value);
}
