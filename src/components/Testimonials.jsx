// src/components/Testimonials.jsx
import Temesgen from "../assets/testimonials/Temesgen.jpg";
import Kidest from "../assets/testimonials/Kidst.jpg";
import Ashenafi from "../assets/testimonials/ashenafi.jpg";

const testimonials = [
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
    text: "Marota transformed my web and design skills through real-world practice and gave me a strong professional foundation.",
    name: "Ashenafi Bancha",
    role: "Student, Web & Design Enthusiast",
    image: Ashenafi,
  },
];

export default function Testimonials() {
  return (
    <section id="testimonials" className="bg-[#112240] py-20 text-white md:py-24">
      <div className="mx-auto mb-12 max-w-7xl px-6 text-center md:mb-14">
        <h2 className="text-4xl font-bold tracking-tight text-[var(--accent-orange)] md:text-5xl">
          What Our Students Say
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-sm text-slate-300 md:text-base">
          Real stories from learners building careers in design, media, and technology.
        </p>
      </div>

      <div className="mx-auto grid max-w-6xl gap-7 px-6 md:grid-cols-2 lg:grid-cols-3">
        {testimonials.map((t, idx) => (
          <div
            key={idx}
            className="group flex h-full min-h-[360px] flex-col rounded-2xl border border-slate-700/70 bg-[#0a192f] p-7 text-center shadow-lg transition duration-300 hover:-translate-y-1 hover:border-[var(--accent-blue)] hover:shadow-2xl"
          >
            <img
              src={t.image}
              alt={t.name}
              className="mx-auto mb-5 h-24 w-24 rounded-full object-cover ring-2 ring-slate-600 transition duration-300 group-hover:scale-105 group-hover:ring-[var(--accent-orange)]"
            />
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
          </div>
        ))}
      </div>
    </section>
  );
}
