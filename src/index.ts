import { youtube } from "@googleapis/youtube"
import { execSync } from "child_process"
import { copy } from "fs-jetpack"
import auth from "./auth"
import sort from "./sort"
import { p } from "./util"

const PLAYLIST_ID = process.env.PLAYLIST_ID ?? ""

const current = []

!(async () => {
  if (!PLAYLIST_ID) {
    console.log("please provide a PLAYLIST_ID in .env")
    copy(p(".env.example"), p(".env"))
    execSync(`code ${p(".env")}`)
    process.exit(1)
  }

  const OAuth2Client = await auth()
  const yt = youtube("v3")

  const listOptions = {
    auth: OAuth2Client,
    part: ["snippet"],
    maxResults: 50,
    playlistId: PLAYLIST_ID,
  }

  // get the first 50 items
  const { data } = await yt.playlistItems.list(listOptions)
  let nextToken = data.nextPageToken

  if (data.items) current.push(...data.items)

  // keep getting 50 items until there is no more nextToken
  while (nextToken) {
    console.log("getting 50 more items")
    const { data: next } = await yt.playlistItems.list({
      ...listOptions,
      pageToken: nextToken,
    })
    nextToken = next.nextPageToken
    if (next.items) current.push(...next.items)
  }

  console.log(`got ${current.length} items\n`)

  // get the required moves and execute them
  const moves = sort(current)
  for (const move of moves) {
    console.log(`moving to pos ${move.to}: ${move.title}`)
    await yt.playlistItems.update({
      auth: OAuth2Client,
      part: ["snippet"],
      requestBody: {
        id: move.id,
        snippet: {
          playlistId: PLAYLIST_ID,
          position: move.to,
          resourceId: {
            kind: "youtube#video",
            videoId: move.video_id,
          },
        },
      },
    })
  }

  if (!moves.length) console.log("nothing needs to be moved.")
})()
