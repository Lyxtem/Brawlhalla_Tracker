import { Metadata } from "next"
import "./globals.css"
import TRPCProvider from "@/app/_trpc/Provider"
import { getBaseUrl } from "./_trpc/server"

export const metadata: Metadata = {
  title: "Brawlhalla tracker",
  description:
    "Brawlhalla Tracker is a web-based project designed to keep tabs on Brawlhalla players currently engaged in ranked matches. Its primary goal is to display this information on a website and provide support display on Discord through a bot.",
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
