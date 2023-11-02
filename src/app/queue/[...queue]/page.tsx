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
function CorehallaStats({ children, brawlhalla_id }: { brawlhalla_id: number } & React.PropsWithChildren) {
  return (
    <Link target="_blank" href={`https://corehalla.com/stats/player/${brawlhalla_id}`} className="cursor-pointer">
      {children}
    </Link>
  )
}
const ranking2v2Columns: ColumnDef<Ranked2V2, any>[] = [
  { accessorKey: "rank", header: "Rank", cell: (x) => <p>{x.getValue()}</p> },
  { accessorKey: "tier", header: "Tier", cell: (x) => <p>{x.getValue()}</p> },
  { accessorKey: "region", header: "Region", cell: (x) => <p>{x.getValue()}</p> },

  {
    accessorFn: (x) => [x.teamname.split("+")[0], x.peak_one, x.peak_one != x.peak_rating],
    header: "(Personal peak elo) Player 1",
    cell: (x) => {
      const [name, peak_elo, highlight] = x.getValue()
      return (
        <CorehallaStats brawlhalla_id={x.row.original.brawlhalla_id_one}>
          <span className={`badge badge-outline ${highlight && "badge-primary"}`}>{peak_elo}</span> {name}
        </CorehallaStats>
      )
    },
  },

  {
    accessorFn: (x) => [x.teamname.split("+")[1], x.peak_two, x.peak_two != x.peak_rating],
    header: "(Personal peak elo) Player 2",
    cell: (x) => {
      const [name, peak_elo, highlight] = x.getValue()
      return (
        <CorehallaStats brawlhalla_id={x.row.original.brawlhalla_id_two}>
          <span className={`badge badge-outline ${highlight && "badge-primary"}`}>{peak_elo}</span> {name}
        </CorehallaStats>
      )
    },
  },

  { accessorKey: "games", header: "Games", cell: (x) => <p>{x.getValue()}</p> },
  { accessorKey: "wins", header: "W/L", cell: (x) => <p>{x.getValue()}</p> },
  {
    accessorFn: (x) => util.calculateWinrate(x.wins, x.games).toFixed(2),
    header: "Winrate",
    cell: (x) => <p>{x.getValue()}</p>,
  },
  {
    accessorFn: (x) => [x.rating, x.peak_rating],
    header: "Elo",
    cell: (x) => {
      const [rating, peak_rating] = x.getValue()
      return (
        <p>
          <b className="text-lg">{rating}</b>/{peak_rating}
        </p>
      )
    },
  },
  { accessorKey: "last_active", header: "Last Active", cell: (x) => <p>{moment(x.getValue()).fromNow()}</p> },
]

const ranking1v1Columns: ColumnDef<Ranked1V1, any>[] = [
  { accessorKey: "rank", header: "Rank", cell: (x) => <p>{x.getValue()}</p> },
  { accessorKey: "tier", header: "Tier", cell: (x) => <p>{x.getValue()}</p> },
  { accessorKey: "region", header: "Region", cell: (x) => <p>{x.getValue()}</p> },
  {
    accessorKey: "name",
    header: "Name",
    cell: (x) => <CorehallaStats brawlhalla_id={x.row.original.brawlhalla_id}>{x.getValue()}</CorehallaStats>,
  },
  { accessorKey: "games", header: "Games", cell: (x) => <p>{x.getValue()}</p> },
  {
    accessorKey: "wins",
    header: "W/L",
    cell: (x) => {
      const obj = x.row.original
      return (
        <div className="w-32">
          <progress
            className="progress progress-primary"
            value={util.calculateWinrate(obj.wins, obj.games).toFixed(0)}
            max="100"
          ></progress>
          <div className="flex justify-between text-xs">
            <span>{obj.wins}W</span>
            <span>{obj.games - obj.wins}L</span>
          </div>
        </div>
      )
    },
  },
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
          <b className="text-lg">{rating}</b>/{peak_rating}
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
    <div className="center mx-52 space-y-2">
      <div className="">
        <p>
          This website was created with the goal of easily finding matches at the appropriate rank without having to
          wait long in the dead queue.
        </p>
        <b className="text-primary">Created by Rot4tion</b>
      </div>

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
