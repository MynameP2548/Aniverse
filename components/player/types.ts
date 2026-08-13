export type PlayerProps = {
  episodeId: string;

  src: string;

  poster?: string;

  title?: string;

  episode?: number;

  autoPlay?: boolean;

  onEnded?: () => void;

  onTimeUpdate?: (
    currentTime: number
  ) => void;

  onNextEpisode?: () => void;

  introStart?: number | null;

  introEnd?: number | null;

  nextEpisodeTime?: number | null;

  nextEpisode?: {
    slug: string;
    seasonId: string;
    episodeNumber: number;
    title: string;
  };
};