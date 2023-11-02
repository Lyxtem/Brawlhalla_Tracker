import { Metadata } from "next"
import "./globals.css"
import TRPCProvider from "@/app/_trpc/Provider"
import { getBaseUrl } from "./_trpc/server"

export const metadata: Metadata = {
  title: "NextBot — Next.js Discord Bot Template",
  description:
    "A Discord bot template built with Next.js that runs in the edge runtime. Lightning-fast responses, zero cold starts, no servers to manage.",
  authors: [{ name: "Rot4tion" }],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-base-100">
        <TRPCProvider baseUrl={getBaseUrl()}>{children}</TRPCProvider>
      </body>
    </html>
  )
}
