import brawlAPI from "@/lib/brawlAPI"
import util from "@/lib/util"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  return NextResponse.json(await brawlAPI.getLegend())
}
