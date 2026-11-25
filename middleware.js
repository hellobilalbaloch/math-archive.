

import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";

const OWNER_EMAIL = "bilalbalochwork@gmail.com";

export async function middleware(request) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isOwner =
    user?.email?.trim().toLowerCase() === OWNER_EMAIL.toLowerCase();

  if (isOwner && request.nextUrl.pathname === "/") {
    return NextResponse.redirect(new URL("/studio", request.url));
  }

  return response;
}

export const config = {
  matcher: ["/"],
};