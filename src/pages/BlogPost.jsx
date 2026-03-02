import { Link, useParams } from "react-router-dom";
import { ArrowLeft, ArrowRight, CalendarDays, Clock3, Tag, UserRound } from "lucide-react";
import { blogPosts } from "../data/blogPosts";

const formatDate = (date) =>
  new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

const buildParagraphs = (post) => {
  if (!post) return [];

  return [
    post.excerpt,
    `At Marota, we focus on practical education that connects classroom learning with real industry needs. This update from ${post.author} highlights how students can gain confidence through project-based training and mentorship.`,
    `Whether your interest is in software development, filmmaking, or digital creativity, the ideas in this story can help you take the next step with a clear and focused learning path.`,
  ];
};

export default function BlogPost() {
  const { slug } = useParams();

  const post = blogPosts.find((item) => item.slug === slug);

  if (!post) {
    return (
      <section className="py-12 md:py-16">
        <div className="section-shell">
          <div className="surface-card rounded-2xl p-8 text-center">
            <p className="text-sm uppercase tracking-[0.2em] text-slate-400">Marota Blog</p>
            <h1 className="mt-3 text-2xl font-bold text-white md:text-3xl">Post not found</h1>
            <p className="mx-auto mt-3 max-w-xl text-slate-300">
              The article you are trying to read does not exist or may have been moved.
            </p>
            <Link
              to="/blog"
              className="mt-6 inline-flex items-center gap-2 rounded-full border border-cyan-300/45 bg-cyan-400/10 px-5 py-2 text-sm font-semibold text-cyan-100 transition hover:border-cyan-200"
            >
              <ArrowLeft size={15} />
              Back to Blog
            </Link>
          </div>
        </div>
      </section>
    );
  }

  const paragraphs = buildParagraphs(post);
  const relatedPosts = blogPosts
    .filter((item) => item.id !== post.id)
    .filter((item) => item.category === post.category || item.tags.some((tag) => post.tags.includes(tag)))
    .slice(0, 3);

  return (
    <section className="pb-14 pt-4 md:pb-20">
      <div className="section-shell">
        <div className="surface-card overflow-hidden rounded-2xl">
          <div className="border-b border-white/10 bg-gradient-to-r from-[#122846] via-[#10213b] to-[#0d1b31] px-6 py-8 md:px-8 md:py-10">
            <Link
              to="/blog"
              className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-slate-200 transition hover:border-cyan-300/45"
            >
              <ArrowLeft size={14} />
              Back to Blog
            </Link>

            <p className="mt-5 inline-flex items-center gap-2 rounded-full border border-cyan-300/35 bg-cyan-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-cyan-200">
              <Tag size={13} />
              {post.category}
            </p>

            <h1 className="mt-4 max-w-4xl text-2xl font-bold leading-tight text-white md:text-4xl">
              {post.title}
            </h1>

            <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-slate-200 md:text-sm">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-[#0f2240]/50 px-3 py-1">
                <CalendarDays size={14} />
                {formatDate(post.date)}
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-[#0f2240]/50 px-3 py-1">
                <Clock3 size={14} />
                {post.readTime} min read
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-[#0f2240]/50 px-3 py-1">
                <UserRound size={14} />
                {post.author}
              </span>
            </div>
          </div>

          <article className="px-6 py-8 md:px-8 md:py-10">
            <div className="prose prose-invert max-w-none">
              {paragraphs.map((paragraph) => (
                <p key={paragraph} className="mb-4 text-base leading-relaxed text-slate-200 md:text-lg">
                  {paragraph}
                </p>
              ))}
            </div>

            <div className="mt-8 border-t border-white/10 pt-6">
              <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-300">Topics</h2>
              <div className="mt-3 flex flex-wrap gap-2">
                {post.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-slate-600 bg-[#13294a] px-3 py-1 text-xs text-slate-200"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          </article>
        </div>

        {relatedPosts.length > 0 && (
          <div className="mt-8 rounded-2xl border border-white/10 bg-[#0f2240]/55 p-5 md:p-6">
            <h2 className="text-lg font-bold text-white md:text-xl">Related Stories</h2>
            <div className="mt-4 grid gap-3 md:grid-cols-3">
              {relatedPosts.map((related) => (
                <Link
                  key={related.id}
                  to={`/blog/${related.slug}`}
                  className="rounded-xl border border-white/10 bg-[#122846]/70 p-4 transition hover:-translate-y-0.5 hover:border-cyan-300/45"
                >
                  <p className="text-xs uppercase tracking-[0.14em] text-cyan-300">{related.category}</p>
                  <h3 className="mt-2 text-sm font-semibold text-white">{related.title}</h3>
                  <p className="mt-2 text-xs text-slate-300">{formatDate(related.date)} • {related.readTime} min</p>
                  <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-cyan-100">
                    Read story
                    <ArrowRight size={13} />
                  </span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
