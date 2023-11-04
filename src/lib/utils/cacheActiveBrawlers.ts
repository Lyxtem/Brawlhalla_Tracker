import { cache } from "react"
import prisma from "../../../prisma/client"
import { Ranking, Region } from "../brawlAPI"

export const revalidate = 3600 // revalidate the data at most every hour

export const getActiveBrawlers = cache(async (ranking: Ranking, region: Region) => {
  const item = await prisma.activeBrawler.findMany({
    where: { ranking, region: region.toUpperCase(), last_active: { gt: Date.now() - 24 * 60 * 60 * 1000 } },
  })
  return item
})
