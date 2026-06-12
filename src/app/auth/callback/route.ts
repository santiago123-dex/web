import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

const allowedEmails = (process.env.ALLOWED_EMAILS ?? "").split(",").map((e) => e.trim()).filter(Boolean)

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get("code")
  const next = searchParams.get("next") ?? "/dashboard"

  if (code) {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error && data.user?.email) {
      if (!allowedEmails.includes(data.user.email)) {
        await supabase.auth.signOut()
        return NextResponse.redirect(`${origin}/auth/login?error=not_authorized`)
      }
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  return NextResponse.redirect(`${origin}/auth/login?error=auth_error`)
}
