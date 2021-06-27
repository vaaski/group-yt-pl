import type { youtube_v3 } from "@googleapis/youtube"

type Video = youtube_v3.Schema$PlaylistItem

export interface SortMove {
  id: string
  video_id: string
  to: number
  title: string
}

export default (unsorted: Video[]): SortMove[] => {
  const preSorted: Video[] = []

  // establish order of channels
  const channels = new Set(unsorted.map(i => i.snippet?.videoOwnerChannelId))

  // pre-sort the playlist
  for (const channel of channels) {
    const videos = unsorted.filter(i => i.snippet?.videoOwnerChannelId === channel)
    videos.sort(
      (a, b) => +new Date(a.snippet?.publishedAt ?? 0) - +new Date(b.snippet?.publishedAt ?? 0)
    )
    preSorted.push(...videos)
  }

  const localSort: Video[] = [...unsorted]

  // re-orders the unsorted playlist locally and records the necessary moves
  const moves: SortMove[] = []
  const reorder = (video: Video, to: number) => {
    const { id, snippet } = video
    if (!id) throw Error("video has no id")
    if (!snippet) throw Error("video has no snippet")

    moves.push({
      video_id: snippet.resourceId?.videoId ?? "",
      title: snippet.title ?? "",
      id,
      to,
    })

    const fromIndex = localSort.findIndex(i => i.id === id)
    const [item] = localSort.splice(fromIndex, 1)
    localSort.splice(to, 0, item)
  }

  // re-order the local list
  reorder: for (let i = 0; i < preSorted.length; i++) {
    const sortedVideo = preSorted[i]
    const sortedVideoId = sortedVideo.id
    const unsortedVideoId = localSort[i].id

    if (!sortedVideoId) break reorder

    if (sortedVideoId !== unsortedVideoId) reorder(sortedVideo, i)
    else localSort.push(sortedVideo)
  }

  return moves
}
