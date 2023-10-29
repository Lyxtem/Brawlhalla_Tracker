"use client"

import axios from "axios"
import * as React from "react"
import { trpc } from "../_trpc/client"

export interface ITestProps {}

export default function Test(props: ITestProps) {
  React.useEffect(() => {
    ;(async () => {
      const data = (await axios.get("https://api.brawlhalla.com/player/54205093/stats/?api_key=5OYDW48WZT3SMOY8HZHB"))
        .data
      console.log("🚀 ~ file: page.tsx:12 ~ React.useEffect ~ data:", data)
    })()
  }, [])
  //const data = trpc.queue_worker.useQuery({ cron_key: "Rot4tion", ranking: "1v1", region: "sea", pageNum: 20 })
  return <div></div>
}
