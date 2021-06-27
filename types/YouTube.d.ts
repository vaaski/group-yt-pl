export interface Video {
  kind: string
  etag: string
  id: string
  snippet: Snippet
}

export interface Snippet {
  publishedAt: string
  channelId: string
  title: string
  description: string
  thumbnails: Thumbnails
  channelTitle: string
  playlistId: string
  position: number
  resourceId: ResourceID
  videoOwnerChannelTitle: string
  videoOwnerChannelId: string
}

export interface ResourceID {
  kind: string
  videoId: string
}

export interface Thumbnails {
  default: Thumbnail
  medium: Thumbnail
  high: Thumbnail
  standard: Thumbnail
  maxres?: Thumbnail
}

export interface Thumbnail {
  url: string
  width: number
  height: number
}
