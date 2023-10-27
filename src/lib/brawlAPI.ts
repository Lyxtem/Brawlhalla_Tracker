import axios, { AxiosInstance } from "axios"
import ky from "ky"

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

export type Region = "eu" | "us-e" | "sea" | "brz" | "aus" | "us-w" | "jpn" | "sa" | "me"

export class BrawlhallaAPI {
  private kyInstance: typeof ky
  constructor(api_key: string) {
    const searchParams = new URLSearchParams()
    searchParams.set("api_key", api_key)
    this.kyInstance = ky.create({
      prefixUrl: "https://api.brawlhalla.com",
      searchParams: searchParams,
      retry: { delay: (attemptCount) => 0.1 * 2 ** (attemptCount - 1) * 1000 },
    })
  }
  public async getLegend(legend: "all" | number = "all") {
    return this.kyInstance.get(`legend/${legend}`).json<Legend[]>()
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
