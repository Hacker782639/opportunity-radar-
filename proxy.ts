import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

const protectedRoutes = new Set([
  "/dashboard",
  "/discover",
  "/for-you",
  "/saved",
  "/applications",
  "/deadlines",
  "/profile",
  "/notifications",
  "/settings",
  "/cv",
  "/cv/review",
  "/onboarding",
]);

const authRoutes = new Set(["/login", "/signup"]);

function redirectWithCookies(response: NextResponse, destination: URL) {
  const redirect = NextResponse.redirect(destination);

  for (const cookie of response.headers.getSetCookie()) {
    redirect.headers.append("set-cookie", cookie);
  }

  return redirect;
}

export default async function proxy(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
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
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value);
          });

          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });

          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();
  const pathname = request.nextUrl.pathname;

  if (
    !user &&
    (protectedRoutes.has(pathname) || pathname.startsWith("/opportunities/"))
  ) {
    return redirectWithCookies(response, new URL("/login", request.url));
  }

  if (user && authRoutes.has(pathname)) {
    const destination =
      pathname === "/signup" ? "/onboarding" : "/dashboard";

    return redirectWithCookies(response, new URL(destination, request.url));
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
