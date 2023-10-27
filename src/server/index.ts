import brawlAPI from "@/lib/brawlAPI"
import { publicProcedure, router } from "./trpc"

export const appRouter = router({
  queue: publicProcedure.query(async () => {
    return  brawlAPI.getLegend()
  }),
})

export type AppRouter = typeof appRouter
