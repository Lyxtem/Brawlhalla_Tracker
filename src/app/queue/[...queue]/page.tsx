"use client"

import { trpc } from "@/app/_trpc/client"
import { Ranked, Ranked1V1, Ranked2V2, RankedRotating, Ranking, Region } from "@/lib/brawlAPI"
import util from "@/lib/util"
import { ArrowDownward, ArrowUpward, SwapVert } from "@mui/icons-material"
import {
  ColumnDef,
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  SortDirection,
  useReactTable,
} from "@tanstack/react-table"
import moment from "moment"
import Link from "next/link"
import { notFound } from "next/navigation"
import * as React from "react"
import { v4 } from "uuid"

export interface QueuePageProps {}

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

const ranking2v2Columns: ColumnDef<Ranked2V2, any>[] = [
  { accessorKey: "rank", header: "Rank", cell: (x) => <p>{x.getValue()}</p> },
  { accessorKey: "tier", header: "Tier", cell: (x) => <p>{x.getValue()}</p> },
  { accessorKey: "region", header: "Region", cell: (x) => <p>{x.getValue()}</p> },
  { accessorKey: "peak_one", header: "(Personal peak elo) Player 1", cell: (x) => <p>{x.getValue()}</p> },
  { accessorKey: "peak_two", header: "(Personal peak elo) Player 2", cell: (x) => <p>{x.getValue()}</p> },
  { accessorKey: "games", header: "Games", cell: (x) => <p>{x.getValue()}</p> },
  { accessorKey: "rank", header: "W/L", cell: (x) => <p>{x.getValue()}</p> },
  { accessorKey: "rank", header: "Winrate", cell: (x) => <p>{x.getValue()}</p> },
  { accessorFn: (x) => `${x.rating}/${x.peak_rating}`, header: "Elo", cell: (x) => <p>{x.getValue()}</p> },
  { accessorKey: "last_active", header: "Last Active", cell: (x) => <p>{x.getValue()}</p> },
]
const ranking1v1Columns: ColumnDef<Ranked1V1, any>[] = [
  { accessorKey: "rank", header: "Rank", cell: (x) => <p>{x.getValue()}</p> },
  { accessorKey: "tier", header: "Tier", cell: (x) => <p>{x.getValue()}</p> },
  { accessorKey: "region", header: "Region", cell: (x) => <p>{x.getValue()}</p> },
  { accessorKey: "name", header: "Name", cell: (x) => <p>{x.getValue()}</p> },
  { accessorKey: "games", header: "Games", cell: (x) => <p>{x.getValue()}</p> },
  { accessorFn: (x) => `${x.wins}/${x.games - x.wins}`, header: "W/L", cell: (x) => <p>{x.getValue()}</p> },
  {
    accessorFn: (x) => util.calculateWinrate(x.wins, x.games).toFixed(2),
    header: "Winrate",
    cell: (x) => <p>{x.getValue()}%</p>,
  },
  {
    accessorFn: (x) => [x.rating, x.peak_rating],
    header: "Elo",
    cell: (x) => {
      const [rating, peak_rating] = x.getValue()
      return (
        <p>
          <b>{rating}</b>/{peak_rating}
        </p>
      )
    },
  },
  { accessorKey: "last_active", header: "Last Active", cell: (x) => <p>{moment(x.getValue()).fromNow()}</p> },
]
const brackets = ["1v1", "2v2"]
const regions = ["sea"]
function TableQueue({ ranking, region }: { ranking: Ranking; region: Region }) {
  const queueData = trpc.queue.useQuery({ ranking, region })

  const columns: any = ranking == "2v2" ? ranking2v2Columns : ranking1v1Columns
  const table = useReactTable({
    columns: columns,
    data: queueData.data || [],
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })
  return (
    <div className="center">
      <div className="">
        <div className="flex justify-center space-x-2">
          {brackets &&
            brackets.map((x) => (
              <Link
                key={x}
                href={`/queue/${x}/${region}`}
                className={`btn btn-outline btn-sm ${ranking == x && "btn-primary"}`}
              >
                {x}
              </Link>
            ))}
        </div>
        <div className="mt-3 flex justify-center">
          {regions &&
            regions.map((x) => (
              <Link
                key={x}
                href={`/queue/${ranking}/${x}`}
                className={`btn btn-outline btn-sm ${region == x && "btn-primary"}`}
              >
                {x.toUpperCase()}
              </Link>
            ))}
        </div>
      </div>
      <table className={`table mx-auto`}>
        {/* head */}
        <thead>
          <tr>
            {table.getHeaderGroups().map((headerGroup) =>
              headerGroup.headers.map((header) => (
                <td key={header.id} width={header.getSize()}>
                  {header.column.columnDef.header?.toString()}
                  {header.column.getCanSort() && (
                    <span className="cursor-pointer" onClick={header.column.getToggleSortingHandler()}>
                      {header.column.getIsSorted() ? (
                        {
                          asc: <ArrowUpward width={3} fontSize="small"></ArrowUpward>,
                          desc: <ArrowDownward width={3} fontSize="small"></ArrowDownward>,
                        }[header.column.getIsSorted() as SortDirection]
                      ) : (
                        <SwapVert width={3} fontSize="small"></SwapVert>
                      )}
                    </span>
                  )}
                </td>
              ))
            )}
          </tr>
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id}>
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
              ))}
            </tr>
          ))}
        </tbody>
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
