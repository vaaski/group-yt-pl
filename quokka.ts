import { Video } from "./types/YouTube"
import data from "./data.json"

const unsorted = data.current
const sorted: Video[] = []

const channels = new Set(unsorted.map(i => i.snippet.videoOwnerChannelId))

for (const channel of channels) {
  const videos = unsorted.filter(i => i.snippet.videoOwnerChannelId === channel)
  videos.sort(
    (a, b) =>
      new Date(a.snippet.publishedAt).getTime() - new Date(b.snippet.publishedAt).getTime()
  )
  sorted.push(...videos)
}

const final: Video[] = [...unsorted]
let moves = 0
const reorder = (id: string, to: number) => {
  moves++
  const fromIndex = final.findIndex(i => i.snippet.resourceId.videoId === id)
  const [item] = final.splice(fromIndex, 1)
  final.splice(to, 0, item)
}

for (let i = 0; i < sorted.length; i++) {
  const sortedVideo = sorted[i]
  const unsortedVideo = final[i]

  if (sortedVideo.snippet.videoOwnerChannelId !== unsortedVideo.snippet.videoOwnerChannelId) {
    reorder(sortedVideo.snippet.resourceId.videoId, i)
  } else final.push(sortedVideo)
}

console.log(final.map(v => v.snippet.title))
console.log(moves)
