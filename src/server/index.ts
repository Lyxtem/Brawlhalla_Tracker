import fs from "fs"
import brawlAPI, { BrawlhallaAPI, Ranked } from "@/lib/brawlAPI"
import util from "@/lib/util"
import { publicProcedure, router } from "./trpc"

export const appRouter = router({
  queue: publicProcedure.query(async () => {
    const path = `public/dynamic/oldRankedData.json`
    const newRankedData: Ranked[] = await brawlAPI.getRankings("1v1", "sea", 1, 20)

    let oldRankedData: Ranked[] | undefined

    oldRankedData = util.readFileJson<Ranked[]>(path)
    if (!oldRankedData) {
      return []
    }
    return BrawlhallaAPI.trackPlayersInRank(newRankedData, oldRankedData)
  }),
  test: publicProcedure.query(async () => {
    return brawlAPI.getLegend()
  }),
})

export type AppRouter = typeof appRouter
