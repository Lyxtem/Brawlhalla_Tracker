import fs from "fs"
import path from "path"
import brawlAPI, { BrawlhallaAPI, Ranked, Ranking, Region } from "./brawlAPI"

export class BrawlQueueWorker {
  private brawlAPI: BrawlhallaAPI

  public pathOldData: string
  public pathActiveData: string
  constructor(brawlAPI: BrawlhallaAPI, pathData: string) {
    this.brawlAPI = brawlAPI

    this.pathOldData = pathData + "queue/"
    this.pathActiveData = pathData + "active/"
    this.init()
  }
  public init() {
    this.createDirNotExist(this.pathOldData)
    this.createDirNotExist(this.pathActiveData)
  }
  public createDirNotExist(dir: string) {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }
  }
  public writeData(writePath: string, data: object) {
    const dataText = JSON.stringify(data)
    if (!fs.existsSync(writePath)) {
      fs.appendFileSync(writePath, dataText)
      return true
    }
    fs.writeFileSync(writePath, dataText)
    return true
  }
  public readData<T>(readPath: string) {
    if (!fs.existsSync(readPath)) {
      return null
    }
    const data = JSON.parse(fs.readFileSync(readPath, { encoding: "utf-8" })) as T
    return data
  }
  private getDataNameFormat(ranking: Ranking, region: Region) {
    return `${ranking}-${region}.json`
  }

  public setOldData(ranking: Ranking, region: Region, data: Ranked[]) {
    return this.writeData(this.pathOldData + this.getDataNameFormat(ranking, region), data)
  }
  public getOldData(ranking: Ranking, region: Region) {
    return this.readData<Ranked[]>(this.pathOldData + this.getDataNameFormat(ranking, region)) || []
  }
  public setActivePlayers(ranking: Ranking, region: Region, data: Ranked[]) {
    return this.writeData(this.pathActiveData + this.getDataNameFormat(ranking, region), data)
  }
  public getActivePlayers(ranking: Ranking, region: Region) {
    return this.readData<Ranked[]>(this.pathActiveData + this.getDataNameFormat(ranking, region)) || []
  }

  public async updateQueue(ranking: Ranking, region: Region, pageNum: number) {
    console.log("🚀 ~ file: brawlQueueWorker.ts:60 ~ BrawlQueueWorker ~ updateQueue ~ updateQueue:")
    const newRankedData = await this.brawlAPI.getRankings(ranking, region, 1, pageNum)
    console.log("🚀 ~ file: brawlQueueWorker.ts:61 ~ BrawlQueueWorker ~ updateQueue ~ newRankedData:", newRankedData)
    if (!newRankedData) return []
    const oldRankedData = this.getOldData(ranking, region)
    this.setOldData(ranking, region, newRankedData)

    const activePlayers = this.trackPlayersInRank(newRankedData, oldRankedData)
    console.log("🚀 ~ file: brawlQueueWorker.ts:67 ~ BrawlQueueWorker ~ updateQueue ~ activePlayers:", activePlayers)
    if (activePlayers) {
      const oldActivePlayers = this.getActivePlayers(ranking, region)

      if (!oldActivePlayers) {
        this.setActivePlayers(ranking, region, activePlayers)
        return activePlayers
      }
      const mergeActivePlayers = this.mergeRankedData(oldActivePlayers, activePlayers)
      this.setActivePlayers(ranking, region, mergeActivePlayers)
    }

    return activePlayers
  }
  public mergeRankedData(oldData: Ranked[], newData: Ranked[]): Ranked[] {
    if (!oldData || !newData) {
      return []
    }

    const combinedData: Ranked[] = [...oldData]

    for (const newPlayer of newData) {
      const key =
        "brawlhalla_id" in newPlayer
          ? String(newPlayer.brawlhalla_id)
          : `${newPlayer.brawlhalla_id_one}-${newPlayer.brawlhalla_id_two}`

      const existingIndex = combinedData.findIndex((player) =>
        "brawlhalla_id" in player
          ? String(player.brawlhalla_id) === key
          : `${player.brawlhalla_id_one}-${player.brawlhalla_id_two}` === key
      )

      if (existingIndex !== -1) {
        combinedData.splice(existingIndex, 1)
      }

      combinedData.push(newPlayer)
    }

    return combinedData
  }
  public trackPlayersInRank(newRankedData: Ranked[], oldRankedData: Ranked[]): Ranked[] {
    if (!oldRankedData || !newRankedData) {
      return []
    }
    const oldPlayersSet = new Set(
      oldRankedData.map((player) => {
        if ("brawlhalla_id" in player) {
          return String(player.brawlhalla_id)
        } else {
          return `${player.brawlhalla_id_one}-${player.brawlhalla_id_two}`
        }
      })
    )
    // return Active players
    return newRankedData.filter((newPlayer) => {
      const key =
        "brawlhalla_id" in newPlayer
          ? String(newPlayer.brawlhalla_id)
          : `${newPlayer.brawlhalla_id_one}-${newPlayer.brawlhalla_id_two}`
      return (
        oldPlayersSet.has(key) &&
        newPlayer.games >
          (oldRankedData.find((oldPlayer) => {
            if ("brawlhalla_id" in oldPlayer) {
              return String(oldPlayer.brawlhalla_id) === key
            } else {
              const [one, two] = key.split("-")
              return oldPlayer.brawlhalla_id_one === Number(one) && oldPlayer.brawlhalla_id_two === Number(two)
            }
          })?.games || 0)
      )
    })
  }
}

const brawlQueueWorker = new BrawlQueueWorker(brawlAPI, "Data/Brawl/")

export default brawlQueueWorker
