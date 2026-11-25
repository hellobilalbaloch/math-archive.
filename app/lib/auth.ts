export const AUTHOR_NAME = "Bilal Baloch";

export function isAuthorizedOwner(email?: string | null): boolean {
  const allowedEmail = process.env.NEXT_PUBLIC_AUTHOR_EMAIL;
  if (!email || !allowedEmail) return false;
  return email.toLowerCase() === allowedEmail.toLowerCase();
}