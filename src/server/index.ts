import { Ranking, Region } from "@/lib/brawlAPI"
import { z } from "zod"
import prisma from "../../prisma/client"
import { publicProcedure, router } from "./trpc"

export const appRouter = router({
  queue: publicProcedure
    .input(z.object({ ranking: z.custom<Ranking>(), region: z.custom<Region>() }))
    .query(async () => {
      return [1, 2, 3, 5]
    }),

  prisma: publicProcedure.query(async () => {
    //const user = await prisma.user.create({ data: { brawlhalla_id: 123, name: "test" } })
    const update = await prisma.user.update({ where: { brawlhalla_id: 123 }, data: { name: "testupdate" } })
    return update
  }),
})

export type AppRouter = typeof appRouter
