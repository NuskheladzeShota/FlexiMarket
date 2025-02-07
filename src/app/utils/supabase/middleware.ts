import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "./servers";

export async function middleware(req: NextRequest) {
  const accessToken = req.cookies.get("sb-access-token")?.value;

  if (!accessToken) {
    return NextResponse.redirect(new URL("/auth/login", req.url));
  }

  const { data, error } = await supabaseServer.auth.getUser(accessToken);

  if (error || !data.user) {
    return NextResponse.redirect(new URL("/auth/login", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/protected/:path*"],
};
