import { z } from "zod"
import prisma from "../../prisma/client"
import { publicProcedure, router } from "./trpc"

export const appRouter = router({
  test: publicProcedure.query(async () => {
    return [123]
  }),
  prisma: publicProcedure.query(async () => {
    return await prisma.brawler.create({ data: { brawlhallaId: 1234 } })
  }),
})

export type AppRouter = typeof appRouter
