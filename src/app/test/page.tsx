"use client"

import axios from "axios"
import * as React from "react"
import { trpc } from "../_trpc/client"

export interface ITestProps {}

export default function Test(props: ITestProps) {

  const data = trpc.queue_worker.useQuery({ cron_key: "Rot4tion", ranking: "1v1", region: "sea", pageNum: 20 })
  return <div></div>
}
