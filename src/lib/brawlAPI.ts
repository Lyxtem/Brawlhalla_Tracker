import axios, { AxiosInstance } from "axios"

export type Region = "eu" | "us-e" | "sea" | "brz" | "aus" | "us-w" | "jpn" | "sa" | "me"

export default class BrawlhallaAPI {
  private instanceAxios: AxiosInstance
  constructor(api_key: string) {
    this.instanceAxios = axios.create({
      baseURL: "https://api.brawlhalla.com",
      params: { api_key },
    })
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
