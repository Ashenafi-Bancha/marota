// src/components/Portfolio.jsx
import { useState } from "react";
import { ArrowRight } from "lucide-react";
import Portfolio1 from "../assets/portfolio/school-life-portfolio.jpg";
import Portfolio2 from "../assets/portfolio/hotel-web.jpg";
import Portfolio3 from "../assets/portfolio/portfolio-logo.jpg";

export default function Portfolio() {
  const [showAll, setShowAll] = useState(false);
  const projects = [
    {
      title: "School Life - መንታ ትውልድ",
      img: Portfolio1,
      description: "Film project showcasing school life.",
    },
    {
      title: "Hotel Website",
      img: Portfolio2,
      description: "Modern web application built with React.",
    },
    {
      title: "Urban Health Organization Logo ",
      img: Portfolio3,
      description: "Logo designed for Urban Health Organization.",
    },
  ];

  const visibleProjects = showAll ? projects : projects.slice(0, 3);

  return (
    <section id="portfolio" className="py-24 bg-[#0a192f] text-white">
      <div className="max-w-7xl mx-auto px-6 text-center mb-12">
        <h2 className="text-4xl font-bold text-[var(--accent-blue)]">
          Our Portifolio
        </h2>
        <p className="text-gray-400 mt-2">Some of our highlighted projects</p>
      </div>

      <div className="grid gap-8 md:grid-cols-3 max-w-7xl mx-auto px-6">
        {visibleProjects.map((project, idx) => (
          <div
            key={idx}
            className="bg-[#112240] rounded-lg shadow-lg overflow-hidden hover:scale-105 transition"
          >
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
            </div>
          </div>
        ))}
      </div>

      {projects.length > 3 && (
        <div className="max-w-7xl mx-auto px-6 mt-8 text-center">
          <button
            type="button"
            onClick={() => setShowAll((prev) => !prev)}
            className="inline-flex items-center gap-2 rounded-md bg-[var(--accent-blue)] px-6 py-2 font-semibold text-black transition hover:bg-teal-300 hover:text-white"
          >
            {showAll ? "View less portifolio" : "View more portifolio"}
            <ArrowRight size={16} />
          </button>
        </div>
      )}
    </section>
  );
}
