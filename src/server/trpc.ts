import { initTRPC, TRPCError } from "@trpc/server"
import type { CreateNextContextOptions } from "@trpc/server/adapters/next"

export const createContext = async (opts: CreateNextContextOptions) => {
  return { ...opts }
}
const t = initTRPC.context<typeof createContext>().create()

export const router = t.router
export const publicProcedure = t.procedure
const isCronAuth = t.middleware(({ ctx, next }) => {
  const { req, res } = ctx
  if (req?.headers?.authorization !== `Bearer ${process.env.CRON_SECRET}` && process.env.NODE_ENV != "development") {
    throw new TRPCError({ code: "UNAUTHORIZED" })
  }
  return next()
})
export const cronProcedure = t.procedure.use(isCronAuth)
