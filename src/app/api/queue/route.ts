import brawlAPI from "@/lib/brawlAPI"
import { trpc } from "@/lib/trpc/client"
import { serverClient } from "@/lib/trpc/serverClient"
import util from "@/lib/util"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  return NextResponse.json(await serverClient.test())
}
