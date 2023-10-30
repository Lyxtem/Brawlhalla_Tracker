import { setTimeout } from "timers/promises"
import brawlAPI, { Ranked, Ranking, Region } from "@/lib/brawlAPI"
import brawlQueueWorker from "@/lib/brawlQueueWorker"
import axios from "axios"
import ky from "ky"
import { z } from "zod"
import prisma from "../../prisma/client"
import { publicProcedure, router } from "./trpc"

export const appRouter = router({
  queue_worker: publicProcedure
    .input(
      z.object({ ranking: z.custom<Ranking>(), region: z.custom<Region>(), pageNum: z.number(), cron_key: z.string() })
    )
    .query(async ({ input }) => {
      const { ranking, region, pageNum, cron_key } = input

      return await brawlQueueWorker.updateQueue(ranking, region, pageNum)
    }),
  test: publicProcedure.query(async () => {
    const arr: any[] = []
    for (let i = 1; i <= 10; i++) {
      arr.push(await brawlAPI.getRanking("1v1", "sea", i))
      await setTimeout(130)
    }
    return arr.flat()
  }),
  prisma: publicProcedure.query(async () => {
    return await prisma.brawler.create({ data: { brawlhallaId: 1234 } })
  }),
})

export type AppRouter = typeof appRouter
        