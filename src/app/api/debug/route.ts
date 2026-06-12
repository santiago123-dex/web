import { NextResponse } from "next/server"

export async function GET() {
  return NextResponse.json({
    siteUrl: process.env.NEXT_PUBLIC_SITE_URL,
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL?.slice(0, 20),
    nodeEnv: process.env.NODE_ENV,
  })
}
