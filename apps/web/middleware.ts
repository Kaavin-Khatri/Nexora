import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// Redirect matrix:
//   logged-out  + /candidate/* or /recruiter/*  -> /login?next=<path>
//   logged-in   + /login or /signup             -> /<role>/dashboard
//   candidate   + /recruiter/*                  -> /candidate/dashboard
//   recruiter   + /candidate/*                  -> /recruiter/dashboard
//   everything else                             -> pass through (with refreshed session cookies)
export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // getUser() verifies the token with the auth server and refreshes expired
  // sessions — the canonical @supabase/ssr middleware pattern. (getClaims'
  // local JWKS verification silently returns no session in the dev edge
  // runtime, so we deliberately use getUser here.)
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const role = (user?.user_metadata?.role as string | undefined) ?? "candidate";
  const path = request.nextUrl.pathname;

  // Any redirect must carry the refreshed session cookies or the refresh is lost.
  const redirectTo = (pathname: string, search = "") => {
    const url = request.nextUrl.clone();
    url.pathname = pathname;
    url.search = search;
    const res = NextResponse.redirect(url);
    supabaseResponse.cookies.getAll().forEach((c) => res.cookies.set(c));
    return res;
  };

  const isProtected =
    path.startsWith("/candidate") || path.startsWith("/recruiter");

  if (!user && isProtected) {
    return redirectTo("/login", `?next=${encodeURIComponent(path)}`);
  }
  if (user) {
    if (path === "/login" || path === "/signup")
      return redirectTo(`/${role}/dashboard`);
    if (path.startsWith("/candidate") && role !== "candidate")
      return redirectTo(`/${role}/dashboard`);
    if (path.startsWith("/recruiter") && role !== "recruiter")
      return redirectTo(`/${role}/dashboard`);
  }

  return supabaseResponse;
}

export const config = {
  // Node runtime: @supabase/ssr fails to read the session cookie in the edge
  // runtime ("Auth session missing!") — verified working in Node.
  runtime: "nodejs",
  // Skip Next internals and static assets entirely.
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
