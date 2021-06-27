import { youtube } from "@googleapis/youtube"
import { execSync } from "child_process"
import { copy, read, write } from "fs-jetpack"
import auth from "./auth"
import { p } from "./util"

const defaultData = {
  current: [] as any[],
  planned: [] as any[],
}
const SAVED_DATA = p("data.json")
// const saved: typeof defaultData = read(SAVED_DATA, "json") ?? defaultData
const saved: typeof defaultData = defaultData

const PLAYLIST_ID = process.env.PLAYLIST_ID ?? ""

!(async () => {
  const o2c = await auth()
  const yt = youtube("v3")
  // const yt = google.youtube("v3")

  if (!PLAYLIST_ID) {
    console.log("please provide a PLAYLIST_ID in .env")
    copy(p(".env.example"), p(".env"))
    execSync(`code ${p(".env")}`)
    process.exit(1)
  }

  const list = {
    auth: o2c,
    part: ["snippet"],
    maxResults: 50,
    playlistId: PLAYLIST_ID,
  }
  const { data } = await yt.playlistItems.list(list)
  let nextToken = data.nextPageToken

  if (data.items) saved.current.push(...data.items)

  while (nextToken) {
    console.log("getting next 50")
    const { data: next } = await yt.playlistItems.list({
      ...list,
      pageToken: nextToken,
    })
    nextToken = next.nextPageToken
    if (next.items) saved.current.push(...next.items)
  }

  // console.log(data)
  write(SAVED_DATA, saved)
})()
