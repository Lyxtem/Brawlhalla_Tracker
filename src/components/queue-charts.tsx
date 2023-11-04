"use client"

import { trpc } from "@/app/_trpc/client"
import { Ranking, Region } from "@/lib/brawlAPI"
import { ActiveBrawler } from "@prisma/client"
import { ActiveElement } from "chart.js"
import _, { Dictionary } from "lodash"
import React from "react"
import { Line } from "react-chartjs-2"

export function QueueCharts({ ranking, region }: { ranking: Ranking; region: Region }) {
  const activeData = trpc.active.useQuery<ActiveBrawler[]>(
    { ranking, region },
    {
      //@ts-ignore
      staleTime: 24 * 60 * 60 * 1000,
      refetchInterval: false,
      refetchOnReconnect: false,
      refetchOnWindowFocus: false,
    }
  )
  const [activeTime, setActiveTime] = React.useState<Dictionary<ActiveBrawler[]>>()
  const multiChartsRef = [React.useRef<any>(), React.useRef<any>()]
  const [refLineActiveElo, refLineActivePlayers] = multiChartsRef
  const [isLocalTime, setIsLocalTime] = React.useState(true)
  const tooltipMultiCharts = (refs: React.MutableRefObject<any>[], elements?: ActiveElement[]) => {
    for (const ref of refs) {
      if (!ref.current) {
        continue
      }
      if (!elements) {
        ref.current.tooltip.setActiveElements([], { x: 0, y: 0 })
        ref.current.setActiveElements([], { x: 0, y: 0 })
        ref.current.update()
        continue
      } else if (ref.current.data.datasets) {
        const dataIndex = ref.current.data.datasets.map((x: any, idx: number) => ({
          datasetIndex: idx,
          index: elements[0].index,
        }))

        ref.current.tooltip.setActiveElements(dataIndex)

        ref.current.setActiveElements(dataIndex)
        ref.current.update()
      }
    }
  }
  React.useEffect(() => {
    if (activeData.data) {
      setActiveTime(
        _.groupBy(activeData.data, (x) =>
          isLocalTime ? new Date(x.last_active).getHours() : new Date(x.last_active).getUTCHours()
        )
      )
    }
  }, [activeData.data, isLocalTime])
  return (
    <>
      <div>
        <div className="label-text">{isLocalTime ? "Local time" : "UTC time"}</div>
        <input
          type="checkbox"
          className="toggle toggle-primary"
          defaultChecked={isLocalTime}
          onChange={(e) => setIsLocalTime(e.target.checked)}
        />
      </div>
      <div className="flex h-44">
        <div className="flex-1">
          {activeTime && (
            <Line
              ref={refLineActivePlayers}
              onMouseLeave={() => {
                tooltipMultiCharts(multiChartsRef, undefined)
              }}
              data={{
                labels: Object.keys(activeTime).map((k) => `${k}h`),
                datasets: [
                  {
                    label: "Active players",
                    data: Object.values(activeTime).map(
                      (x) =>
                        x.filter(
                          (value, index, self) =>
                            index === self.findIndex((t) => t.brawlhalla_id === value.brawlhalla_id)
                        ).length
                    ),
                    tension: 0.4,
                    borderColor: "#6419e6",
                  },
                ],
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                scales: { x: { grid: { display: false } }, y: { grid: { display: false } } },
                interaction: {
                  mode: "index",
                  intersect: false,
                },
                onHover(event, elements, chart) {
                  tooltipMultiCharts(multiChartsRef, elements)
                },
                plugins: {
                  title: {
                    display: true,
                    text: `Active Players last 24h (${
                      activeData.data.filter(
                        (value: any, index: any, self: any) =>
                          index === self.findIndex((t: any) => t.brawlhalla_id === value.brawlhalla_id)
                      ).length
                    })`,
                  },
                },
              }}
            ></Line>
          )}
        </div>
        <div className="flex-1">
          {activeTime && (
            <Line
              ref={refLineActiveElo}
              onMouseLeave={() => {
                tooltipMultiCharts(multiChartsRef, undefined)
              }}
              data={{
                labels: Object.keys(activeTime).map((k) => `${k}h`),
                datasets: [
                  {
                    label: "Max elo",
                    data: Object.values(activeTime).map((x) => Math.max(...x.map((b) => b.rating))),
                    tension: 0.4,
                    borderColor: "#6419e6",
                  },
                  {
                    label: "Min elo",
                    data: Object.values(activeTime).map((x) => Math.min(...x.map((b) => b.rating))),
                    tension: 0.4,
                    borderColor: "blue",
                  },
                ],
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                scales: { x: { grid: { display: false } }, y: { grid: { display: false } } },
                interaction: {
                  mode: "index",
                  intersect: false,
                },
                onHover(event, elements, chart) {
                  tooltipMultiCharts(multiChartsRef, elements)
                },
              }}
            ></Line>
          )}
        </div>
      </div>
    </>
  )
}
