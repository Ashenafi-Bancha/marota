import { useRef, useState } from "react";
import { Clock3, Pause, Play, Sparkles } from "lucide-react";

const showcaseVideos = [
  {
    src: "/videos/marota-hero.mp4",
    title: "Campus & Creative Culture",
    description:
      "Experience the energy of Marota classrooms, labs, and collaborative learning spaces.",
  },
  {
    src: "/videos/marota-hero1.mp4",
    title: "Hands-On Film Production",
    description:
      "See real filming, editing, and storytelling workflows guided by experienced mentors.",
  },
  {
    src: "/videos/marota-hero2.mp4",
    title: "Software & Digital Skills",
    description:
      "Discover practical coding and design practice that prepares learners for real careers.",
  },
];

export default function VideoShowcase() {
  const videoRefs = useRef([]);
  const [activeVideoIndex, setActiveVideoIndex] = useState(null);
  const [videoDurations, setVideoDurations] = useState(() => showcaseVideos.map(() => null));

  const formatVideoDuration = (durationInSeconds) => {
    if (!Number.isFinite(durationInSeconds) || durationInSeconds <= 0) {
      return null;
    }

    const minutes = Math.floor(durationInSeconds / 60);
    const seconds = Math.floor(durationInSeconds % 60);
    return `${minutes}:${String(seconds).padStart(2, "0")}`;
  };

  const toggleVideoPlayback = async (index) => {
    const targetVideo = videoRefs.current[index];
    if (!targetVideo) {
      return;
    }

    if (targetVideo.paused) {
      videoRefs.current.forEach((video, currentIndex) => {
        if (video && currentIndex !== index && !video.paused) {
          video.pause();
        }
      });

      try {
        await targetVideo.play();
        setActiveVideoIndex(index);
      } catch {
        setActiveVideoIndex(null);
      }

      return;
    }

    targetVideo.pause();
    setActiveVideoIndex(null);
  };

  const handleVideoPlay = (index) => {
    videoRefs.current.forEach((video, currentIndex) => {
      if (video && currentIndex !== index && !video.paused) {
        video.pause();
      }
    });

    setActiveVideoIndex(index);
  };

  const handleVideoPause = () => {
    const hasPlayingVideo = videoRefs.current.some((video) => video && !video.paused);
    if (!hasPlayingVideo) {
      setActiveVideoIndex(null);
    }
  };

  const handleVideoMetadataLoaded = (index, event) => {
    const durationLabel = formatVideoDuration(event.currentTarget.duration);
    if (!durationLabel) {
      return;
    }

    setVideoDurations((previousDurations) => {
      if (previousDurations[index] === durationLabel) {
        return previousDurations;
      }

      const updatedDurations = [...previousDurations];
      updatedDurations[index] = durationLabel;
      return updatedDurations;
    });
  };

  return (
    <section className="relative overflow-hidden bg-[#0a192f] py-16 md:py-20">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(100,255,218,0.12),transparent_48%)]" />

      <div className="relative mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-cyan-300/45 bg-cyan-400/10 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.16em] text-cyan-100">
            <Sparkles size={14} />
            Marota In Motion
          </span>
          <h2 className="mt-4 text-3xl font-black leading-tight text-[var(--hero-main-heading)] sm:text-4xl md:text-5xl">
            Explore Marota Through Real Video Highlights
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-slate-300 sm:text-base md:text-lg">
            Click any video below to watch our learning environment, production practice, and digital skill-building journey.
            Each story shows how students turn creativity into career-ready results.
          </p>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-3">
          {showcaseVideos.map((video, index) => (
            <article
              key={video.src}
              className={`overflow-hidden rounded-2xl border bg-[#112240]/85 shadow-[0_14px_34px_rgba(2,8,23,0.35)] backdrop-blur-sm transition duration-300 hover:-translate-y-1 ${
                activeVideoIndex === index
                  ? "border-cyan-300/70"
                  : "border-slate-500/45 hover:border-cyan-300/55"
              }`}
            >
              <div className="relative aspect-video bg-black/40">
                <video
                  ref={(element) => {
                    videoRefs.current[index] = element;
                  }}
                  src={video.src}
                  className="h-full w-full cursor-pointer object-cover"
                  preload="metadata"
                  controls
                  playsInline
                  onClick={() => toggleVideoPlayback(index)}
                  onPlay={() => handleVideoPlay(index)}
                  onPause={handleVideoPause}
                  onLoadedMetadata={(event) => handleVideoMetadataLoaded(index, event)}
                />
              </div>

              <div className="space-y-3 p-5 text-left">
                <div className="flex items-center justify-between gap-3">
                  <span className="inline-flex rounded-full border border-cyan-300/40 bg-cyan-400/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-cyan-100">
                    Video {index + 1}
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-400/50 bg-white/5 px-3 py-1 text-[11px] font-semibold tracking-wide text-slate-200">
                    <Clock3 size={13} />
                    {videoDurations[index] ?? "Loading..."}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-slate-100 md:text-xl">{video.title}</h3>
                <p className="text-sm leading-relaxed text-slate-300 md:text-base">{video.description}</p>

                <button
                  type="button"
                  onClick={() => toggleVideoPlayback(index)}
                  className="inline-flex items-center gap-2 rounded-full border border-cyan-300/45 bg-cyan-400/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.12em] text-cyan-100 transition hover:-translate-y-0.5 hover:border-cyan-200"
                >
                  {activeVideoIndex === index ? <Pause size={14} /> : <Play size={14} />}
                  {activeVideoIndex === index ? "Pause Video" : "Play Video"}
                </button>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
