import { getBrowseCategoryForVideo, type VideoItem } from "@/lib/site-data";
import { buildExploreNowSections, flattenExploreNowSections } from "@/lib/explore-now";
import { getTopicsForVideo } from "@/lib/video-curation";
import { buildTopicCollections } from "@/lib/topic-collections";

export function buildHomepageViewModel(videos: VideoItem[]) {
  const topicCollections = buildTopicCollections(videos, 3);

  const homepageTrendingItems = flattenExploreNowSections(buildExploreNowSections(videos), 3).map(
    (entry) => {
      const item = entry.video;
      const category = getBrowseCategoryForVideo(item);

      return {
        id: `homepage-trend-${item.youtubeVideoId ?? item.id}`,
        slug: item.slug,
        label: entry.label,
        reason: entry.reason,
        title: item.title,
        category,
        channel: item.channel,
        publishedAt: item.publishedAt,
        shortDescription: item.description,
        thumbnail: item.thumbnail,
        youtubeVideoId: item.youtubeVideoId,
        thumbnailWidth: item.thumbnailWidth,
        thumbnailHeight: item.thumbnailHeight,
        isShortForm: item.isShortForm,
        topics: getTopicsForVideo(item, category).slice(0, 2),
      };
    },
  );

  return {
    topicCollections,
    homepageTrendingItems,
  };
}
