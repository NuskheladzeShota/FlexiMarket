import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/app/utils/supabase/servers";

export async function GET(req: NextRequest) {
  try {
    const accessToken = req.cookies.get("sb-access-token")?.value;

    if (!accessToken) {
      return NextResponse.json(
        { error: "Access token is missing" },
        { status: 401 }
      );
    }

    const { data, error } = await supabaseServer.auth.getUser(accessToken);

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 401 }
      );
    }

    return NextResponse.json({ user: data.user }, { status: 200 });
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: "Unknown error occurred" },
      { status: 500 }
    );
  }
}
