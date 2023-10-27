import fs from "fs"
import brawlAPI, { BrawlhallaAPI, Ranked } from "@/lib/brawlAPI"
import { publicProcedure, router } from "./trpc"

export const appRouter = router({
  queue: publicProcedure.query(async () => {
    // const pathOldRankedData = `public/oldRankedData.json`
    // const newRankedData: Ranked[] = await brawlAPI.getRankings("1v1", "sea", 1, 10)
    // let oldRankedData: Ranked[] | undefined
    // if (!fs.existsSync(pathOldRankedData)) {
    //   fs.appendFileSync(`public/oldRankedData.json`, JSON.stringify(newRankedData))
    //   return []
    // }
    // oldRankedData = JSON.parse(fs.readFileSync(pathOldRankedData, { encoding: "utf-8" })) as Ranked[]
    // fs.writeFileSync(pathOldRankedData, JSON.stringify(newRankedData))
    // return BrawlhallaAPI.trackPlayersInRank(newRankedData, oldRankedData)
  }),
  test: publicProcedure.query(async () => {
    return brawlAPI.getRanking("1v1", "sea", 1)
  }),
})

export type AppRouter = typeof appRouter
