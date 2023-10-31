"use client"

import { trpc } from "@/app/_trpc/client"
import { Ranked, Ranked1V1, Ranked2V2, RankedRotating, Ranking, Region } from "@/lib/brawlAPI"
import util from "@/lib/util"
import moment from "moment"
import { notFound } from "next/navigation"
import * as React from "react"
import { v4 } from "uuid"

export interface QueuePageProps {}
const ranking1v1Columns = ["Rank", "Tier", "Region", "Name", "Game", "W/L", "Winrate", "Elo", "Last Active"]
const ranking2v2Columns = [
  "Rank",
  "Tier",
  "Region",
  "(Personal peak elo) Player 1",
  "(Personal peak elo) Player 2",
  "Game",
  "W/L",
  "Winrate",
  "Elo",
  "Last Active",
]
function RowQueue({ ranked }: { ranked: Ranked }) {
  if (!ranked) return
  let row: any
  if ("brawlhalla_id" in ranked) {
    ranked = ranked as Ranked1V1 | RankedRotating
    row = (
      <tr>
        <td>{ranked.rank}</td>
        <td>{ranked.tier}</td>
        <td>{ranked.region}</td>
        <td>{ranked.name}</td>
        <td>{ranked.games}</td>
        <td>
          {ranked.wins}/{ranked.games - ranked.wins}
        </td>
        <td>{util.calculateWinrate(ranked.wins, ranked.games).toFixed(2)}</td>
        <td>
          <b className="text-lg font-bold">{ranked.rating}</b>/{ranked.peak_rating}
        </td>
        <td>{moment(ranked.last_active).fromNow()}</td>
      </tr>
    )
  } else if ("teamname" in ranked) {
    ranked = ranked as Ranked2V2
    const [player1, player2] = ranked.teamname.split("+")
    row = (
      <tr>
        <td>{ranked.rank}</td>
        <td>{ranked.tier}</td>
        <td>{ranked.region}</td>
        <td>
          <b
            className={`text-md ${ranked.peak_one != ranked.peak_rating && "text-primary"}`}
          >{`(${ranked.peak_one}) `}</b>
          {player1}
        </td>
        <td>
          <b
            className={`text-md ${ranked.peak_two != ranked.peak_rating && "text-primary"}`}
          >{`(${ranked.peak_two}) `}</b>
          {player2}
        </td>
        <td>{ranked.games}</td>
        <td>
          {ranked.wins}/{ranked.games - ranked.wins}
        </td>
        <td>{util.calculateWinrate(ranked.wins, ranked.games).toFixed(2)}</td>
        <td>
          <b className="text-lg font-bold">{ranked.rating}</b>/{ranked.peak_rating}
        </td>
        <td>{moment(ranked.last_active).fromNow()}</td>
      </tr>
    )
  }

  return row
}
function TableQueue({ ranking, region }: { ranking: Ranking; region: Region }) {
  const queueData = trpc.queue.useQuery<Ranked[]>({ ranking, region })
  const columns = ranking == "2v2" ? ranking2v2Columns : ranking1v1Columns
  return (
    <div className="overflow-x-auto">
      <table className="table">
        {/* head */}
        <thead>
          <tr>
            {columns.map((x) => (
              <td key={x}>{x}</td>
            ))}
          </tr>
        </thead>
        <tbody>
          {queueData.data &&
            queueData.data
              .sort((a, b) => b.last_active - a.last_active)
              .map((x) => <RowQueue key={v4()} ranked={x}></RowQueue>)}
        </tbody>
        {/* foot */}
        <tfoot>
          <tr>
            {columns.map((x) => (
              <td key={x}>{x}</td>
            ))}
          </tr>
        </tfoot>
      </table>
    </div>
  )
}

export default function QueuePage({ params }: { params: { queue: string[] } }) {
  if (params.queue.length < 2) return notFound()

  const ranking = params.queue[0] as Ranking
  const region = params.queue[1] as Region

  return (
    <div>
      <TableQueue ranking={ranking} region={region}></TableQueue>
    </div>
  )
}
