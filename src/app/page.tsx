import { redirect } from "next/navigation"
import { GlobalCommands } from "../components/global-commands"

export default async function Page() {
  redirect("/queue/2v2/sea")
  return (
   <div>Home page</div>
  )
}
