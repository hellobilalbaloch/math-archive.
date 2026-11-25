import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { isAuthorizedOwner } from "@/app/lib/auth";

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({
            request,
          });
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

  const pathname = request.nextUrl.pathname;
  const isOwner = Boolean(user && isAuthorizedOwner(user.email));

  // Block /studio for anyone who is not the authorized owner
  if (pathname.startsWith("/studio") && !isOwner) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Keep the signed-in owner on /studio instead of showing the public home or login page
  if (isOwner && (pathname === "/" || pathname === "/login")) {
    return NextResponse.redirect(new URL("/studio", request.url));
  }

  return response;
}