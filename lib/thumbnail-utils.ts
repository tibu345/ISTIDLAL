export function getStableYouTubeThumbnailUrl(youtubeVideoId: string) {
  return `https://i.ytimg.com/vi/${youtubeVideoId}/hqdefault.jpg`;
}

export function getPreferredThumbnailUrl(src: string, youtubeVideoId?: string) {
  if (youtubeVideoId) {
    return getStableYouTubeThumbnailUrl(youtubeVideoId);
  }

  return src;
}
