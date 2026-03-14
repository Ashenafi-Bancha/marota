// src/components/Testimonials.jsx
import { useState } from "react";
import Temesgen from "../assets/testimonials/Temesgen.jpg";
import Kidest from "../assets/testimonials/Kidst.jpg";
import Ashu from "../assets/testimonials/ashu.jpg";
import Bereket from "../assets/testimonials/berekt.jpg";

const testimonials = [
  {
    text: "Marota turned my potential into results. Through practical full-stack training and mentorship, I moved from beginner to employed developer and confident freelancer.",
    name: "Ashenafi Bancha",
    role: "Full Stack Web Developer",
    image: Ashu,
  },
  {
    text: "Marota improved my editing workflow through hands-on training. I now deliver client projects faster and with confidence.",
    name: "Temesgen",
    role: "Video Editor",
    image: Temesgen,
  },
  {
    text: "Mentorship and project-based learning sharpened my creative process from concept to final output.",
    name: "Kidest Yonas",
    role: "Graphics Designer",
    image: Kidest,
  },
  {
    text: "Marota's photography and videography training strengthened my shooting, lighting, and storytelling skills. I can now produce visual projects with much more confidence.",
    name: "Bereket Mesfin",
    role: "Photography and Videography Student",
    image: Bereket,
  },
];

export default function Testimonials() {
  const [isPinned, setIsPinned] = useState(false);

  const togglePinned = () => {
    setIsPinned((prev) => !prev);
  };

  return (
    <section id="testimonials" className="bg-[#112240] py-20 text-white md:py-24">
      <div className="mx-auto mb-12 max-w-7xl px-6 text-center md:mb-14">
        <span className="marquee-section-badge">Student Voices</span>
        <h2 className="mt-4 text-4xl font-bold tracking-tight text-[var(--accent-orange)] md:text-5xl">
          What Our Students Say
        </h2>
        <p className="mx-auto mt-5 max-w-2xl text-sm text-slate-300 md:text-base">
          Real stories from learners building careers in design, media, and technology.
        </p>
        <p className="mx-auto mt-4 inline-flex items-center rounded-full border border-slate-400/30 bg-slate-900/30 px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-slate-300 md:hidden">
          Scroll to read more stories
        </p>
      </div>

      <div className="mx-auto max-w-7xl px-6">
        <div className={`marquee-shell marquee-shell-premium ${isPinned ? "is-paused" : ""}`}>
          <div className="marquee-track marquee-track-right" style={{ "--marquee-duration": "76s" }}>
            {[0, 1].map((segmentIndex) => (
              <div
                key={`testimonial-segment-${segmentIndex}`}
                className="marquee-segment"
                aria-hidden={segmentIndex === 1}
              >
                {testimonials.map((t, idx) => (
                  <article
                    key={`${t.name}-${segmentIndex}-${idx}`}
                    onClick={togglePinned}
                    className="marquee-card marquee-card-testimonial group flex min-h-[360px] w-[300px] cursor-pointer flex-col rounded-2xl p-7 text-center transition duration-300 hover:-translate-y-1"
                  >
                    <div className="mx-auto mb-5">
                      <img
                        src={t.image}
                        alt={t.name}
                        className="marquee-avatar h-24 w-24 rounded-full object-cover transition duration-300 group-hover:scale-105 mx-auto"
                      />
                    </div>
                    <blockquote className="relative mx-auto max-w-xs flex-1 font-serif text-base italic leading-relaxed text-slate-200 md:max-w-sm md:text-lg">
                      <span className="absolute -left-2 -top-3 text-3xl text-[var(--accent-orange)]/80">
                        “
                      </span>
                      {t.text}
                      <span className="ml-1 text-2xl text-[var(--accent-orange)]/80">”</span>
                    </blockquote>
                    <div className="mt-auto pt-6">
                      <h3 className="text-xl font-semibold text-[var(--accent-blue)]">{t.name}</h3>
                      <p className="mt-1 text-xs uppercase tracking-[0.2em] text-slate-400 md:text-sm">
                        {t.role}
                      </p>
                    </div>
                  </article>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
