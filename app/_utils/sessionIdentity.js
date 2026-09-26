if (process.env.KINDE_CLIENT_SECRET) {
  process.env.KINDE_CLIENT_SECRET = process.env.KINDE_CLIENT_SECRET.trim();
}
if (process.env.KINDE_CLIENT_ID) {
  process.env.KINDE_CLIENT_ID = process.env.KINDE_CLIENT_ID.trim();
}
if (process.env.KINDE_ISSUER_URL) {
  process.env.KINDE_ISSUER_URL = process.env.KINDE_ISSUER_URL.trim();
}
if (process.env.KINDE_SITE_URL) {
  process.env.KINDE_SITE_URL = process.env.KINDE_SITE_URL.trim();
}

import { NextResponse } from 'next/server';
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";

// Returns the signed-in patient's identity from the Kinde session, or null.
export async function getSessionIdentity() {
  const { isAuthenticated, getUser } = getKindeServerSession();
  if (!(await isAuthenticated())) return null;

  const user = await getUser();
  if (!user?.email) return null;

  const name = [user.given_name, user.family_name].filter(Boolean).join(' ').trim();
  return { email: user.email, name: name || user.email };
}

export const unauthorized = () =>
  NextResponse.json({ error: 'Please log in to continue' }, { status: 401 });
