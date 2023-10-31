import { appRouter } from "@/server"
import { createContext } from "@/server/trpc"
import { fetchRequestHandler } from "@trpc/server/adapters/fetch"

const handler = (req: Request) =>
  fetchRequestHandler({
    endpoint: "/api/trpc",
    req,
    router: appRouter,
    createContext: ({ req, resHeaders }) => createContext({ req, resHeaders }),
  })

export { handler as GET, handler as POST }
