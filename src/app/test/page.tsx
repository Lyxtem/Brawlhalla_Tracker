"use client"

import * as React from "react"
import { trpc } from "../_trpc/client"

export interface ITestProps {}

export default function Test(props: ITestProps) {
  const queue = trpc.queue.useQuery({ ranking: "1v1", region: "sea" })
  console.log("🚀 ~ file: page.tsx:10 ~ Test ~ queue:", queue)
  return <div></div>
}
