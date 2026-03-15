import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  BookOpen,
  BookmarkCheck,
  BookmarkPlus,
  CalendarDays,
  Clock3,
  Flame,
  Heart,
  Newspaper,
  Search,
  Sparkles,
  Tag,
  TrendingUp,
  UserRound,
} from "lucide-react";
import { blogPosts } from "../features/blog/data/blogPosts";

const SAVED_POSTS_KEY = "marota_saved_blog_posts";

const formatDate = (date) =>
  new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

const sorters = {
  latest: (a, b) => new Date(b.date) - new Date(a.date),
  popular: (a, b) => b.popularity - a.popularity,
  quick: (a, b) => a.readTime - b.readTime,
};

const getTopTags = (posts, limit = 5) => {
  const counts = posts.reduce((accumulator, post) => {
    (post.tags || []).forEach((tag) => {
      accumulator[tag] = (accumulator[tag] || 0) + 1;
    });
    return accumulator;
  }, {});

  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([name, count]) => ({ name, count }));
};

export default function BlogSection({ preview = false }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortBy, setSortBy] = useState("latest");
  const [likedPosts, setLikedPosts] = useState({});
  const [savedPosts, setSavedPosts] = useState(() => {
    try {
      const parsed = JSON.parse(localStorage.getItem(SAVED_POSTS_KEY) || "[]");
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(SAVED_POSTS_KEY, JSON.stringify(savedPosts));
  }, [savedPosts]);

  const categories = useMemo(
    () => ["All", ...new Set(blogPosts.map((post) => post.category))],
    []
  );

  const filteredPosts = useMemo(() => {
    const normalized = searchTerm.trim().toLowerCase();

    const byCategory =
      selectedCategory === "All"
        ? blogPosts
        : blogPosts.filter((post) => post.category === selectedCategory);

    const byQuery = byCategory.filter((post) => {
      if (!normalized) return true;
      const source = [post.title, post.excerpt, post.author, ...(post.tags || [])]
        .join(" ")
        .toLowerCase();
      return source.includes(normalized);
    });

    return [...byQuery].sort(sorters[sortBy]);
  }, [searchTerm, selectedCategory, sortBy]);

  const featuredPost =
    filteredPosts.find((post) => post.featured) || filteredPosts[0] || blogPosts[0];

  const displayPosts = preview ? filteredPosts.slice(0, 3) : filteredPosts;

  const blogInsights = useMemo(() => {
    const totalMinutes = blogPosts.reduce((sum, post) => sum + post.readTime, 0);
    const averageReadTime = blogPosts.length
      ? Math.round(totalMinutes / blogPosts.length)
      : 0;
    const topCategory = Object.entries(
      blogPosts.reduce((accumulator, post) => {
        accumulator[post.category] = (accumulator[post.category] || 0) + 1;
        return accumulator;
      }, {})
    ).sort((a, b) => b[1] - a[1])[0];

    return {
      averageReadTime,
      topCategory: topCategory ? topCategory[0] : "General",
      topTags: getTopTags(blogPosts),
    };
  }, []);

  const savedCount = savedPosts.length;

  const handleToggleLike = (postId) => {
    setLikedPosts((previous) => ({ ...previous, [postId]: !previous[postId] }));
  };

  const handleToggleSave = (postId) => {
    setSavedPosts((previous) =>
      previous.includes(postId)
        ? previous.filter((id) => id !== postId)
        : [...previous, postId]
    );
  };

  return (
    <section className={preview ? "py-14 md:py-20" : "pb-14 pt-2 md:pb-20"}>
      <div className="section-shell">
        <div className="surface-card p-6 md:p-8">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full border border-cyan-300/30 bg-cyan-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-200">
                <Sparkles size={14} />
                Marota Blog
              </p>
              <h2 className="mt-3 text-2xl font-bold text-white md:text-3xl">
                Stories, tips, and campus updates from Marota
              </h2>
              <p className="mt-2 max-w-3xl text-sm text-slate-300 md:text-base">
                Explore practical learning advice, student stories, software insights, and film education updates from our community.
              </p>
            </div>

            {!preview && (
              <div className="grid min-w-[220px] grid-cols-2 gap-3 text-sm">
                <div className="rounded-xl border border-white/10 bg-[#0f2240]/80 px-4 py-3 text-slate-300">
                  <p className="text-xs uppercase tracking-[0.15em] text-slate-400">Articles</p>
                  <p className="mt-1 text-xl font-bold text-white">{blogPosts.length}</p>
                </div>
                <div className="rounded-xl border border-white/10 bg-[#0f2240]/80 px-4 py-3 text-slate-300">
                  <p className="text-xs uppercase tracking-[0.15em] text-slate-400">Saved</p>
                  <p className="mt-1 text-xl font-bold text-white">{savedCount}</p>
                </div>
              </div>
            )}
          </div>

          {!preview && (
            <div className="mb-8 rounded-2xl border border-white/10 bg-gradient-to-r from-[#122846] via-[#10213b] to-[#0d1b31] p-4 md:p-5">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-xl border border-white/10 bg-[#0b1830]/60 p-4">
                  <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-cyan-200">
                    <Clock3 size={14} />
                    Reader Snapshot
                  </p>
                  <p className="mt-2 text-2xl font-bold text-white">{blogInsights.averageReadTime} min</p>
                  <p className="mt-1 text-xs text-slate-300">Average read time per story</p>
                </div>

                <div className="rounded-xl border border-white/10 bg-[#0b1830]/60 p-4">
                  <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-yellow-100">
                    <Newspaper size={14} />
                    Top Category
                  </p>
                  <p className="mt-2 text-xl font-bold text-white">{blogInsights.topCategory}</p>
                  <p className="mt-1 text-xs text-slate-300">Most active publishing focus</p>
                </div>

                <div className="rounded-xl border border-white/10 bg-[#0b1830]/60 p-4">
                  <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-pink-100">
                    <Flame size={14} />
                    Trending Topics
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {blogInsights.topTags.map((tag) => (
                      <span
                        key={tag.name}
                        className="rounded-full border border-slate-600 bg-[#13294a] px-2.5 py-1 text-[11px] text-slate-200"
                      >
                        #{tag.name} Â· {tag.count}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {!preview && (
            <div className="mb-8 space-y-4 rounded-2xl border border-white/10 bg-[#0f2240]/60 p-4">
              <div className="flex flex-col gap-3 lg:flex-row">
                <label className="relative block w-full lg:w-[45%]">
                  <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                    placeholder="Search by title, tag, or author..."
                    className="w-full rounded-xl border border-slate-600 bg-[#13294a] py-2 pl-9 pr-3 text-sm text-slate-100 outline-none transition focus:border-cyan-300/60"
                  />
                </label>

                <div className="flex flex-wrap items-center gap-2 lg:w-[55%] lg:justify-end">
                  {categories.map((category) => (
                    <button
                      key={category}
                      type="button"
                      onClick={() => setSelectedCategory(category)}
                      className={`btn-icon rounded-full border px-3 py-1.5 text-xs transition ${
                        selectedCategory === category
                          ? "border-cyan-300/60 bg-cyan-400/15 text-cyan-200"
                          : "border-slate-600 bg-[#13294a] text-slate-300 hover:border-slate-400"
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2 text-sm text-slate-300">
                <TrendingUp size={16} className="text-cyan-300" />
                <span>Sort by:</span>
                <select
                  value={sortBy}
                  onChange={(event) => setSortBy(event.target.value)}
                  className="rounded-lg border border-slate-600 bg-[#13294a] px-2 py-1.5 text-sm text-slate-100 outline-none"
                >
                  <option value="latest">Latest</option>
                  <option value="popular">Most Popular</option>
                  <option value="quick">Quick Reads</option>
                </select>
              </div>
            </div>
          )}

          {featuredPost && (
            <article className="mb-8 rounded-2xl border border-yellow-300/35 bg-gradient-to-r from-[#13294a] via-[#102442] to-[#0c1d35] p-5 md:p-6">
              <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-end">
                <div>
                  <p className="mb-2 inline-flex items-center gap-1 rounded-full bg-yellow-400/20 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-yellow-200">
                    <BookOpen size={14} />
                    Featured Story
                  </p>
                  <Link to={`/blog/${featuredPost.slug}`} className="block">
                    <h3 className="text-xl font-bold text-white transition hover:text-cyan-100 md:text-2xl">
                      {featuredPost.title}
                    </h3>
                  </Link>
                  <p className="mt-2 text-sm leading-relaxed text-slate-200 md:text-base">{featuredPost.excerpt}</p>
                </div>

                <div className="rounded-xl border border-white/15 bg-[#0d1d34]/75 px-4 py-3 text-sm text-slate-200">
                  <p className="text-xs uppercase tracking-[0.15em] text-slate-400">Popularity Score</p>
                  <p className="mt-1 text-2xl font-bold text-white">{featuredPost.popularity}</p>
                  <div className="mt-2 h-1.5 w-32 overflow-hidden rounded-full bg-white/10">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-cyan-300 to-yellow-300"
                      style={{ width: `${Math.max(12, featuredPost.popularity)}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-slate-300 md:text-sm">
                <span className="inline-flex items-center gap-1">
                  <CalendarDays size={14} />
                  {formatDate(featuredPost.date)}
                </span>
                <span className="inline-flex items-center gap-1">
                  <Clock3 size={14} />
                  {featuredPost.readTime} min read
                </span>
                <span className="inline-flex items-center gap-1">
                  <UserRound size={14} />
                  {featuredPost.author}
                </span>
                <span className="inline-flex items-center gap-1 rounded-full border border-white/15 px-2 py-1">
                  <Tag size={13} />
                  {featuredPost.category}
                </span>
              </div>
            </article>
          )}

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {displayPosts.map((post) => {
              const isLiked = Boolean(likedPosts[post.id]);
              const isSaved = savedPosts.includes(post.id);

              return (
                <article
                  key={post.id}
                  className="group flex h-full flex-col rounded-2xl border border-white/10 bg-[#0f2240]/75 p-4 shadow-[0_12px_30px_rgba(2,8,23,0.18)] transition duration-300 hover:-translate-y-1 hover:border-cyan-300/45 hover:shadow-[0_16px_35px_rgba(8,47,73,0.35)]"
                >
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-300">{post.category}</p>
                    <span className="rounded-full border border-yellow-300/30 bg-yellow-300/10 px-2 py-0.5 text-[10px] font-semibold text-yellow-100">
                      {post.popularity}% hot
                    </span>
                  </div>
                  <Link to={`/blog/${post.slug}`} className="block">
                    <h3 className="text-lg font-semibold text-white transition group-hover:text-cyan-100">{post.title}</h3>
                  </Link>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-300">{post.excerpt}</p>

                  <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-cyan-300 to-yellow-300"
                      style={{ width: `${Math.max(10, post.popularity)}%` }}
                    />
                  </div>

                  <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-slate-400">
                    <span>{formatDate(post.date)}</span>
                    <span>â€¢</span>
                    <span>{post.readTime} min read</span>
                    <span>â€¢</span>
                    <span>{post.author}</span>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2">
                    {post.tags.map((tag) => (
                      <span
                        key={`${post.id}-${tag}`}
                        className="rounded-full border border-slate-600 bg-[#13294a] px-2 py-1 text-[11px] text-slate-300"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>

                  <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        className={`btn-icon inline-flex items-center gap-1 rounded-lg border px-2.5 py-1.5 text-xs transition ${
                          isLiked
                            ? "border-pink-400/60 bg-pink-400/15 text-pink-200"
                            : "border-slate-600 bg-[#13294a] text-slate-300"
                        }`}
                        onClick={() => handleToggleLike(post.id)}
                      >
                        <Heart size={14} />
                        {isLiked ? "Liked" : "Like"}
                      </button>

                      <button
                        type="button"
                        className={`btn-icon inline-flex items-center gap-1 rounded-lg border px-2.5 py-1.5 text-xs transition ${
                          isSaved
                            ? "border-emerald-400/60 bg-emerald-400/15 text-emerald-200"
                            : "border-slate-600 bg-[#13294a] text-slate-300"
                        }`}
                        onClick={() => handleToggleSave(post.id)}
                      >
                        {isSaved ? <BookmarkCheck size={14} /> : <BookmarkPlus size={14} />}
                        {isSaved ? "Saved" : "Save"}
                      </button>
                    </div>

                    <Link
                      to={`/blog/${post.slug}`}
                      className="inline-flex items-center gap-1 rounded-lg border border-cyan-300/35 bg-cyan-400/10 px-2.5 py-1.5 text-xs font-semibold text-cyan-100 transition hover:border-cyan-200"
                    >
                      Read Story
                      <ArrowRight size={13} />
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>

          {displayPosts.length === 0 && (
            <div className="rounded-xl border border-dashed border-slate-500 px-4 py-6 text-center text-sm text-slate-300">
              No blog posts match your current search or category. Try a different filter.
            </div>
          )}

          <div className="mt-8 rounded-2xl border border-cyan-300/30 bg-cyan-400/10 p-5 md:p-6">
            <h3 className="text-lg font-bold text-white md:text-xl">Join the Marota learning community</h3>
            <p className="mt-2 text-sm text-slate-200 md:text-base">
              Get updates about new courses, campus events, student showcases, and practical career tips.
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <Link
                to="/courses"
                className="inline-flex items-center gap-2 rounded-full border border-cyan-300/50 bg-[#112240] px-4 py-2 text-sm font-semibold text-cyan-100 transition hover:border-cyan-200"
              >
                Explore Courses
                <ArrowRight size={15} />
              </Link>
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 rounded-full border border-white/20 px-4 py-2 text-sm font-semibold text-white transition hover:border-cyan-300/45"
              >
                Contact Admissions
              </Link>
              {preview && (
                <Link
                  to="/blog"
                  className="inline-flex items-center gap-2 rounded-full border border-yellow-300/45 bg-yellow-300/10 px-4 py-2 text-sm font-semibold text-yellow-100 transition hover:border-yellow-200"
                >
                  View Full Blog
                  <ArrowRight size={15} />
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
