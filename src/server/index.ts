import { setTimeout } from "timers/promises"
import brawlAPI, { Ranked, Ranking, Region } from "@/lib/brawlAPI"
import brawlQueueWorker from "@/lib/brawlQueueWorker"
import { getActiveBrawlers } from "@/lib/utils/cacheActiveBrawlers"
import { Prisma } from "@prisma/client"
import axios from "axios"
import ky from "ky"
import { z } from "zod"
import prisma from "../../prisma/client"
import { cronProcedure, publicProcedure, router } from "./trpc"

export const appRouter = router({
  queue_worker: cronProcedure
    .input(z.object({ ranking: z.custom<Ranking>(), region: z.custom<Region>(), pageNum: z.number() }))
    .query(async ({ input }) => {
      const { ranking, region, pageNum } = input
      await brawlQueueWorker.updateQueue(ranking, region, pageNum)
      return []
    }),
  queue: publicProcedure

    .input(z.object({ ranking: z.custom<Ranking>(), region: z.custom<Region>() }))
    .query(async ({ input }) => {
      const { ranking, region } = input
      return brawlQueueWorker.getActivePlayers(ranking, region) || []
    }),
  active: publicProcedure
    .input(z.object({ ranking: z.custom<Ranking>(), region: z.custom<Region>() }))
    .query(async ({ input }) => {
      const { ranking, region } = input

      // get data before 48h from now
      return await getActiveBrawlers(ranking, region)
    }),
  test: publicProcedure.query(async () => {
    return brawlQueueWorker.getOldData("1v1", "sea")
  }),
  health: publicProcedure.query(async () => {
    return { status: "OK" }
  }),
  prisma: cronProcedure.query(async () => {
    //return await prisma.brawler.create({ data: { brawlhallaId: 1234 } })
  }),
})

export type AppRouter = typeof appRouter
