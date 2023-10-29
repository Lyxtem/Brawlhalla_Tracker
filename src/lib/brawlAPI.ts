import axios, { AxiosInstance } from "axios"
import ky from "ky"
import util from "./util"

//=======Clan===========
export type Clan = {
  clan_id: number
  clan_name: string
  clan_create_date: number
  clan_xp: string
  clan: ClanMember[]
}

export type ClanMember = {
  brawlhalla_id: number
  name: string
  rank: ClanRank
  join_date: number
  xp: number
}

export enum ClanRank {
  Leader = "Leader",
  Member = "Member",
  Officer = "Officer",
  Recruit = "Recruit",
}

//=======Ranking 1v1===========
export type Ranked1V1 = {
  rank: number
  name: string
  brawlhalla_id: number
  best_legend: number
  best_legend_games: number
  best_legend_wins: number
  rating: number
  tier: string
  games: number
  wins: number
  region: string
  peak_rating: number
}

//=======Ranking 2v2===========
export type Ranked2V2 = {
  rank: number
  teamname: string
  brawlhalla_id_one: number
  brawlhalla_id_two: number
  rating: number
  tier: string
  wins: number
  games: number
  region: string
  peak_rating: number
}
//=======Player Ranked===========
export type PlayerRanked = {
  name: string
  brawlhalla_id: number
  rating: number
  peak_rating: number
  tier: string
  wins: number
  games: number
  region: string
  global_rank: number
  region_rank: number
  legends: LegendRanked[]
  "2v2"?: The2V2[]
  rotating_ranked?: RankedRotating
}

export type The2V2 = {
  brawlhalla_id_one: number
  brawlhalla_id_two: number
  rating: number
  peak_rating: number
  tier: string
  wins: number
  games: number
  teamname: string
  region: number
  global_rank: number
}

export type LegendRanked = {
  legend_id: number
  legend_name_key: string
  rating: number
  peak_rating: number
  tier: string
  wins: number
  games: number
}

export type RankedRotating = {
  rank?: number
  name: string
  brawlhalla_id: number
  rating: number
  peak_rating: number
  tier: string
  wins: number
  games: number
  region: string
}

//=======Player Stats===========
export type PlayerStats = {
  brawlhalla_id: number
  name: string
  xp: number
  level: number
  xp_percentage: number
  games: number
  wins: number
  damagebomb: string
  damagemine: string
  damagespikeball: string
  damagesidekick: string
  hitsnowball: number
  kobomb: number
  komine: number
  kospikeball: number
  kosidekick: number
  kosnowball: number
  legends: LegendStats[]
  clan?: ClanStats
}

export type ClanStats = {
  clan_name: string
  clan_id: number
  clan_xp: string
  personal_xp: number
}

export type LegendStats = {
  legend_id: number
  legend_name_key: string
  damagedealt: string
  damagetaken: string
  kos: number
  falls: number
  suicides: number
  teamkos: number
  matchtime: number
  games: number
  wins: number
  damageunarmed: string
  damagethrownitem: string
  damageweaponone: string
  damageweapontwo: string
  damagegadgets: string
  kounarmed: number
  kothrownitem: number
  koweaponone: number
  koweapontwo: number
  kogadgets: number
  timeheldweaponone: number
  timeheldweapontwo: number
  xp: number
  level: number
  xp_percentage: number
}

//=======Player Legend===========
export type LegendFull = {
  legend_id: number
  legend_name_key: string
  bio_name: string
  bio_aka: string
  bio_quote: string
  bio_quote_about_attrib: string
  bio_quote_from: string
  bio_quote_from_attrib: string
  bio_text: string
  bot_name: string
  weapon_one: string
  weapon_two: string
  strength: string
  dexterity: string
  defense: string
  speed: string
}

export type Legend = {
  legend_id: number
  legend_name_key: string
  bio_name: string
  bio_aka: string
  weapon_one: string
  weapon_two: string
  strength: string
  dexterity: string
  defense: string
  speed: string
}
//=======Other===========
export type Region = "eu" | "us-e" | "sea" | "brz" | "aus" | "us-w" | "jpn" | "sa" | "me" | "all"
export type Ranking = "1v1" | "2v2" | "rotating"
export type Ranked = (Ranked1V1 | Ranked2V2 | RankedRotating) & { last_active?: Date }

export class BrawlhallaAPI {
  private kyInstance: typeof ky
  private api_key: string
  constructor(api_key: string) {
    this.api_key = api_key
    const searchParams = new URLSearchParams()
    searchParams.set("api_key", api_key)
    this.kyInstance = ky.create({
      prefixUrl: "https://api.brawlhalla.com",
      searchParams: searchParams,
      retry: { limit: 10, delay: (attemptCount) => 0.3 * 2 ** (attemptCount - 1) * 1000 },
    })
  }
  public async getLegend(legend: "all" | number = "all") {
    return BrawlhallaAPI.fixBrawlhallaAPIString<LegendStats[]>(await this.kyInstance.get(`legend/${legend}`).text())
  }
  public async getRanking(ranking: Ranking = "1v1", region: Region = "sea", page: number = 1, playerName?: string) {
    console.log("🚀 ~ file: brawlAPI.ts:223 ~ BrawlhallaAPI ~ getRanking ~ page:", page)
    if (playerName) {
      const searchParams = new URLSearchParams()
      console.log("🚀 ~ file: brawlAPI.ts:226 ~ BrawlhallaAPI ~ getRanking ~ searchParams:", searchParams)
      searchParams.set("name", playerName)
      searchParams.set("api_key", this.api_key)
      return BrawlhallaAPI.fixBrawlhallaAPIString<Ranked[]>(
        await ky.get(`rankings/${ranking}/${region}/${page}`, { searchParams }).text()
      )
    }

    return BrawlhallaAPI.fixBrawlhallaAPIString<Ranked[]>(
      await this.kyInstance.get(`rankings/${ranking}/${region}/${page}`).text()
    )
  }
  public async getRankings(ranking: Ranking = "1v1", region: Region = "sea", fromPage: number, toPage: number) {
    const pageNumbers = Array.from({ length: toPage - fromPage + 1 }, (_, index) => fromPage + index)
    console.log("🚀 ~ file: brawlAPI.ts:240 ~ BrawlhallaAPI ~ getRankings ~ pageNumbers:", pageNumbers)

    const results: Ranked[] = []

    for (const page of pageNumbers) {
      try {
        const rankedData = await this.getRanking(ranking, region, page)
        if (rankedData) {
          results.push(...rankedData)
        }
      } catch (error) {
        console.error("Error fetching data:", error)
        throw error
      }
    }

    return results
  }
  public async getPlayerRanked(brawlhalla_id: number) {
    return BrawlhallaAPI.fixBrawlhallaAPIString<PlayerRanked>(
      await this.kyInstance.get(`player/${brawlhalla_id}/ranked`).text()
    )
  }
  public async getPlayerStats(brawlhalla_id: number) {
    return BrawlhallaAPI.fixBrawlhallaAPIString<PlayerStats>(
      await this.kyInstance.get(`player/${brawlhalla_id}/stats`).text()
    )
  }
  public async getClan(clan_id: number) {
    return BrawlhallaAPI.fixBrawlhallaAPIString<Clan>(await this.kyInstance.get(`clan/${clan_id}`).text())
  }

  static fixBrawlhallaAPIString<T>(str: string) {
    if (str && typeof str == "string") {
      try {
        str = decodeURIComponent(util.escape(str))
      } catch (error) {}
    }
    return JSON.parse(str) as T
  }

  static async gloryFromWins(totalWins: number) {
    if (totalWins <= 150) return 20 * totalWins

    return Math.floor(10 * (45 * Math.pow(Math.log10(totalWins * 2), 2)) + 245)
  }

  static async gloryFromBestRating(bestRating: number) {
    let retval = 0

    if (bestRating < 1200) retval = 250

    if (bestRating >= 1200 && bestRating < 1286) retval = 10 * (25 + 0.872093023 * (86 - (1286 - bestRating)))

    if (bestRating >= 1286 && bestRating < 1390) retval = 10 * (100 + 0.721153846 * (104 - (1390 - bestRating)))

    if (bestRating >= 1390 && bestRating < 1680) retval = 10 * (187 + 0.389655172 * (290 - (1680 - bestRating)))

    if (bestRating >= 1680 && bestRating < 2000) retval = 10 * (300 + 0.428125 * (320 - (2000 - bestRating)))

    if (bestRating >= 2000 && bestRating < 2300) retval = 10 * (437 + 0.143333333 * (300 - (2300 - bestRating)))

    if (bestRating >= 2300) retval = 10 * (480 + 0.05 * (400 - (2700 - bestRating)))

    return Math.floor(retval)
  }
}

const brawlAPI = new BrawlhallaAPI(process.env.BRAWLHALLA_API_KEY as string)
export default brawlAPI
