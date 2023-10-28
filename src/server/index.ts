import { z } from "zod"
import { publicProcedure, router } from "./trpc"

export const appRouter = router({
  test: publicProcedure.query(async () => {
    return [123]
  }),
})

export type AppRouter = typeof appRouter
