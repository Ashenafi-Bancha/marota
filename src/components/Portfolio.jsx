// src/components/Portfolio.jsx
import { useEffect, useMemo, useState } from "react";
import { ArrowRight } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import Portfolio1 from "../assets/portfolio/school-life-portfolio.jpg";
import Portfolio2 from "../assets/portfolio/hotel-web.jpg";
import Portfolio3 from "../assets/portfolio/portfolio-logo.jpg";

const portfolioCategories = [
  { label: "All", value: "all" },
  { label: "Films", value: "films" },
  { label: "Graphics", value: "graphics" },
  { label: "Mobile Apps", value: "mobile-apps" },
  { label: "Websites", value: "websites" },
  { label: "Video", value: "video" },
];

const categoryLabelMap = new Map(
  portfolioCategories.map((category) => [category.value, category.label])
);

export default function Portfolio() {
  const [showAll, setShowAll] = useState(false);
  const [searchParams] = useSearchParams();
  const selectedCategoryParam = String(searchParams.get("category") || "all").toLowerCase();

  const activeCategory = useMemo(() => {
    return portfolioCategories.some((category) => category.value === selectedCategoryParam)
      ? selectedCategoryParam
      : "all";
  }, [selectedCategoryParam]);

  const projects = useMemo(
    () => [
      {
        title: "School Life - መንታ ትውልድ",
        img: Portfolio1,
        description: "Film project showcasing school life.",
        categories: ["films", "video"],
        href: "https://youtu.be/uI_bu83Ae58?si=HyecbfT9SEr3imm7",
      },
      {
        title: "Wolatia Heritage Digital Museum Website and Mobile App",
        img: "/wolayta.png",
        description:
          "Cultural heritage platform built for web and mobile to preserve and showcase Wolatia history.",
        categories: ["mobile-apps", "websites"],
      },
      {
        title: "Hotel Website",
        img: Portfolio2,
        description: "Modern web application built with React.",
        categories: ["websites"],
      },
      {
        title: "Urban Health Organization Logo",
        img: Portfolio3,
        description: "Logo designed for Urban Health Organization.",
        categories: ["graphics"],
      },
    ],
    []
  );

  const filteredProjects = useMemo(() => {
    if (activeCategory === "all") {
      return projects;
    }

    return projects.filter((project) => project.categories.includes(activeCategory));
  }, [activeCategory, projects]);

  useEffect(() => {
    setShowAll(false);
  }, [activeCategory]);

  const visibleProjects = showAll ? filteredProjects : filteredProjects.slice(0, 3);
  const activeCategoryLabel = categoryLabelMap.get(activeCategory) || "All";

  return (
    <section id="portfolio" className="py-24 bg-[#0a192f] text-white">
      <div className="max-w-7xl mx-auto px-6 text-center mb-12">
        <h2 className="text-4xl font-bold text-[var(--accent-blue)]">
          Our Portfolio
        </h2>
        <p className="text-gray-400 mt-2">
          {activeCategory === "all"
            ? "Some of our highlighted projects"
            : `Showing ${activeCategoryLabel} projects`}
        </p>

        <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
          {portfolioCategories.map((category) => {
            const isActiveCategory = activeCategory === category.value;
            const target =
              category.value === "all"
                ? "/portfolio"
                : `/portfolio?category=${category.value}`;

            return (
              <Link
                key={category.value}
                to={target}
                className={`rounded-full border px-4 py-1.5 text-sm font-semibold transition-colors ${
                  isActiveCategory
                    ? "border-cyan-400 bg-cyan-400/20 text-cyan-200"
                    : "border-[#1f3b5b] bg-[#112240]/70 text-gray-300 hover:border-cyan-300/60 hover:text-cyan-200"
                }`}
              >
                {category.label}
              </Link>
            );
          })}
        </div>
      </div>

      {visibleProjects.length === 0 ? (
        <div className="max-w-3xl mx-auto px-6 text-center rounded-xl border border-[#1f3b5b] bg-[#112240]/70 py-10 text-gray-300">
          No projects found for {activeCategoryLabel}. Check another category.
        </div>
      ) : (
        <div className="grid gap-8 md:grid-cols-3 max-w-7xl mx-auto px-6">
          {visibleProjects.map((project, idx) => {
            const cardClassName =
              "block bg-[#112240] rounded-lg shadow-lg overflow-hidden transition hover:scale-105";

            const cardContent = (
              <>
                <div className="w-full aspect-video">
                  <img
                    src={project.img}
                    alt={project.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold">{project.title}</h3>
                  <p className="text-gray-400 text-sm mt-2">
                    {project.description}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {project.categories.map((category) => (
                      <span
                        key={`${project.title}-${category}`}
                        className="rounded-full border border-cyan-700/50 bg-cyan-500/10 px-2.5 py-1 text-xs font-semibold text-cyan-200"
                      >
                        {categoryLabelMap.get(category) || category}
                      </span>
                    ))}
                  </div>
                </div>
              </>
            );

            if (project.href) {
              return (
                <a
                  key={idx}
                  href={project.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${cardClassName} focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300`}
                >
                  {cardContent}
                </a>
              );
            }

            return (
              <div key={idx} className={cardClassName}>
                {cardContent}
              </div>
            );
          })}
        </div>
      )}

      {filteredProjects.length > 3 && (
        <div className="max-w-7xl mx-auto px-6 mt-8 text-center">
          <button
            type="button"
            onClick={() => setShowAll((prev) => !prev)}
            className="inline-flex items-center gap-2 rounded-md bg-[var(--accent-blue)] px-6 py-2 font-semibold text-black transition hover:bg-teal-300 hover:text-white"
          >
            {showAll ? "View less portfolio" : "View more portfolio"}
            <ArrowRight size={16} />
          </button>
        </div>
      )}
    </section>
  );
}
