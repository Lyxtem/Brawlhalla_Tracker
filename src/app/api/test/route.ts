import brawlAPI from "@/lib/brawlAPI"
import { NextResponse } from "next/server"

export async function GET() {
  return NextResponse.json(await brawlAPI.getLegend())
}
