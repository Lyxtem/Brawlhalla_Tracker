import { appRouter } from "@/server"
import { httpBatchLink } from "@trpc/client"

export function getBaseUrl() {
  if (typeof window !== "undefined")
    // browser should use relative path
    return ""
  if (process.env.DOMAIN) return `https://${process.env.DOMAIN}`
  if (process.env.CYCLIC_URL)
    // reference for cyclic.sh
    return `https://${process.env.CYCLIC_URL}`
  if (process.env.RENDER_EXTERNAL_HOSTNAME)
    // reference for render.com
    return `https://${process.env.RENDER_EXTERNAL_HOSTNAME}`

  if (process.env.NEXT_PUBLIC_VERCEL_URL)
    // reference for vercel.com
    return `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`
  if (process.env.RENDER_INTERNAL_HOSTNAME)
    // reference for render.com
    return `http://${process.env.RENDER_INTERNAL_HOSTNAME}:${process.env.PORT}`
  // assume localhost
  return `http://localhost:${process.env.PORT ?? 3000}`
}

export const server = appRouter.createCaller({
  //@ts-ignore
  links: [
    httpBatchLink({
      url: `${getBaseUrl()}/api/trpc`,
    }),
  ],
})
