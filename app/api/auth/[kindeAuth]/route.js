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

import {handleAuth} from "@kinde-oss/kinde-auth-nextjs/server";
export const GET = handleAuth();