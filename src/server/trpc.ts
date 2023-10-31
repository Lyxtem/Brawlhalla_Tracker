import { initTRPC, TRPCError } from "@trpc/server"
import { FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch"
import type { CreateNextContextOptions } from "@trpc/server/adapters/next"

export const createContext = async (opts: FetchCreateContextFnOptions) => {
  return { ...opts }
}
const t = initTRPC.context<typeof createContext>().create()

export const router = t.router
export const publicProcedure = t.procedure
const isCronAuth = t.middleware(({ ctx, next }) => {
  const { req, resHeaders } = ctx

  if (req.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`) {
    throw new TRPCError({ code: "UNAUTHORIZED" })
  }
  return next()
})
export const cronProcedure = t.procedure.use(isCronAuth)
