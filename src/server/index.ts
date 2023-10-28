import { Ranking, Region } from "@/lib/brawlAPI"
import { z } from "zod"
import { publicProcedure, router } from "./trpc"

export const appRouter = router({
  queue: publicProcedure
    .input(z.object({ ranking: z.custom<Ranking>(), region: z.custom<Region>() }))
    .query(async () => {
      return [1, 2, 3, 5]
    }),
})

export type AppRouter = typeof appRouter
