import { setTimeout } from "timers/promises"
import brawlAPI, { Ranked, Ranking, Region } from "@/lib/brawlAPI"
import brawlQueueWorker from "@/lib/brawlQueueWorker"
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

      return await brawlQueueWorker.updateQueue(ranking, region, pageNum)
    }),
  queue: publicProcedure

    .input(z.object({ ranking: z.custom<Ranking>(), region: z.custom<Region>() }))
    .query(async ({ input }) => {
      const { ranking, region } = input
      return brawlQueueWorker.getActivePlayers(ranking, region)
    }),
  test: publicProcedure.query(async () => {
    if (process.env.NODE_ENV != "development") return
    return []
  }),
  prisma: cronProcedure.query(async () => {
    //return await prisma.brawler.create({ data: { brawlhallaId: 1234 } })
  }),
})

export type AppRouter = typeof appRouter
