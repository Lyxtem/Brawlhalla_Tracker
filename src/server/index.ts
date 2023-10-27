import brawlAPI, { BrawlhallaAPI, Ranked } from "@/lib/brawlAPI"
import { publicProcedure, router } from "./trpc"

export const appRouter = router({
  queue: publicProcedure.query(async () => {
    const oldRankedData: Ranked[] = [
      {
        rank: 1,
        name: "Trick Or Moni Treat",
        brawlhalla_id: 104002853,
        rating: 1774,
        tier: "Platinum 2",
        games: 80,
        wins: 80,
        region: "US-E",
        peak_rating: 1774,
      },
      {
        rank: 2,
        name: "Star D. Champion",
        brawlhalla_id: 47545173,
        rating: 1726,
        tier: "Platinum 1",
        games: 96,
        wins: 87,
        region: "US-E",
        peak_rating: 1726,
      },
      {
        rank: 3,
        name: "prplexity",
        brawlhalla_id: 8477095,
        rating: 1685,
        tier: "Platinum 1",
        games: 63,
        wins: 60,
        region: "US-E",
        peak_rating: 1685,
      },
    ]

    const newRankedData: Ranked[] = [
      {
        rank: 1,
        name: "Trick Or Moni Treat",
        brawlhalla_id: 104002853,
        rating: 1774,
        tier: "Platinum 2",
        games: 80,
        wins: 80,
        region: "US-E",
        peak_rating: 1774,
      },
      {
        rank: 2,
        name: "Star D. Champion",
        brawlhalla_id: 47545173,
        rating: 1726,
        tier: "Platinum 1",
        games: 96,
        wins: 87,
        region: "US-E",
        peak_rating: 1726,
      },
      {
        rank: 3,
        name: "prplexity",
        brawlhalla_id: 8477095,
        rating: 1685,
        tier: "Platinum 1",
        games: 65,
        wins: 60,
        region: "US-E",
        peak_rating: 1685,
      },
    ]
    return BrawlhallaAPI.trackPlayersInRank(newRankedData, oldRankedData)
  }),
})

export type AppRouter = typeof appRouter
