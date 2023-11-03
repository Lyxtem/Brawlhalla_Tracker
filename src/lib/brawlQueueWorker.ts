import fs from "fs"
import path from "path"
import prisma from "../../prisma/client"
import brawlAPI, { BrawlhallaAPI, Ranked, Ranked1V1, Ranked2V2, Ranking, Region } from "./brawlAPI"

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
    console.time("getRankings")
    const newRankedData = await this.brawlAPI.getRankings(ranking, region, 1, pageNum)
    console.timeEnd("getRankings")

    if (!newRankedData) return []

    const oldRankedData = this.getOldData(ranking, region)

    this.setOldData(ranking, region, newRankedData)

    const activePlayers = this.trackPlayersInRank(newRankedData, oldRankedData)

    if (activePlayers) {
      console.time("add activePlayers to db")
      const activeBrawlers = activePlayers
        .map((x) => {
          const brawlers: any[] = []
          if ("brawlhalla_id" in x) {
            const { brawlhalla_id, name, rating, region, last_active } = x as Ranked1V1
            return brawlers.push({ brawlhalla_id, ranking, name, rating, region, last_active })
          }
          if ("teamname" in x) {
            x = x as Ranked2V2
            const [p1Name, p2Name] = x.teamname.split("+")
            brawlers.push({
              brawlhalla_id: x.brawlhalla_id_one,
              name: p1Name,
              ranking,
              rating: x.peak_one,
              region: x.region,
              last_active: x.last_active,
            })
            brawlers.push({
              brawlhalla_id: x.brawlhalla_id_two,
              ranking,
              name: p2Name,
              rating: x.peak_two,
              region: x.region,
              last_active: x.last_active,
            })
          }
          return brawlers
        })
        .flat()
      await prisma.activeBrawler.createMany({ data: activeBrawlers })
      console.timeEnd("add activePlayers to db")
    }

    if (activePlayers) {
      const oldActivePlayers = this.getActivePlayers(ranking, region)

      if (!oldActivePlayers) {
        this.setActivePlayers(ranking, region, activePlayers)
        return activePlayers
      }
      const mergeActivePlayers = this.mergeRankedData(oldActivePlayers, activePlayers)
      this.setActivePlayers(ranking, region, mergeActivePlayers)
      return mergeActivePlayers
    }

    return activePlayers
  }
  public mergeRankedData(oldData: Ranked[], newData: Ranked[]) {
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
    let activePlayers: any[] = newRankedData.filter((newPlayer) => {
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
    }) as Ranked[]
    // peak personal elo
    if ("teamname" in newRankedData[0]) {
      console.log("test")

      activePlayers = (activePlayers as Ranked2V2[]).map((activePlayer) => {
        console.time(activePlayer.teamname)
        const peak_one = Math.max(
          ...(newRankedData as Ranked2V2[])
            .filter(
              (x) =>
                x.brawlhalla_id_one == activePlayer.brawlhalla_id_one ||
                x.brawlhalla_id_two == activePlayer.brawlhalla_id_one
            )
            .map((x) => x.peak_rating)
        )
        const peak_two = Math.max(
          ...(newRankedData as Ranked2V2[])
            .filter(
              (x) =>
                x.brawlhalla_id_one == activePlayer.brawlhalla_id_two ||
                x.brawlhalla_id_two == activePlayer.brawlhalla_id_two
            )
            .map((x) => x.peak_rating)
        )
        console.timeEnd(activePlayer.teamname)
        return { ...activePlayer, peak_one: peak_one, peak_two: peak_two }
      })
    }
    return activePlayers.map((x) => {
      return { ...x, last_active: Date.now() }
    }) as Ranked[]
  }
}

const brawlQueueWorker = new BrawlQueueWorker(brawlAPI, "tmp/Data/Brawl/")

export default brawlQueueWorker
