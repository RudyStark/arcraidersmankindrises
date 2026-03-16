import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!
);

export async function GET() {
  const [countRes, votesRes] = await Promise.all([
    supabase.from("hype_counter").select("count").eq("id", 1).single(),
    supabase.from("hype_votes").select("lat, lng"),
  ]);

  return NextResponse.json({
    count: countRes.data?.count ?? 0,
    votes: votesRes.data ?? [],
  });
}

export async function POST(request: Request) {
  // Increment counter
  const { data: newCount, error } = await supabase.rpc("increment_hype_count");
  if (error) return NextResponse.json({ count: 0 }, { status: 500 });

  // Store vote location from Vercel geo headers (automatic on Vercel)
  const lat = request.headers.get("x-vercel-ip-latitude");
  const lng = request.headers.get("x-vercel-ip-longitude");

  if (lat && lng) {
    await supabase.from("hype_votes").insert({
      lat: parseFloat(lat),
      lng: parseFloat(lng),
    });
  }

  return NextResponse.json({ count: newCount });
}
