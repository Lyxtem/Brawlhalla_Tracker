import { publicProcedure, router } from "./trpc"

export const appRouter = router({
  test: publicProcedure.query(async () => {
    return [1, 2, 3]
  }),
})

export type AppRouter = typeof appRouter
