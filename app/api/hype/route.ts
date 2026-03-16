import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!
);

export async function GET() {
  const { data, error } = await supabase
    .from("hype_counter")
    .select("count")
    .eq("id", 1)
    .single();

  if (error) return NextResponse.json({ count: 0 });
  return NextResponse.json({ count: data.count });
}

export async function POST() {
  const { data, error } = await supabase.rpc("increment_hype_count");

  if (error) return NextResponse.json({ count: 0 }, { status: 500 });
  return NextResponse.json({ count: data });
}
