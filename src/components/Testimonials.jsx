// src/components/Testimonials.jsx
import { useState } from "react";
import { ArrowRight } from "lucide-react";
import Samuel from "../assets/testimonials/ashenafi.jpg";
import Amina from "../assets/testimonials/ashenafi.jpg";
import Lidya from "../assets/testimonials/ashenafi.jpg";
import Yonas from "../assets/testimonials/ashenafi.jpg";
import Mekdes from "../assets/testimonials/ashenafi.jpg";
import Ashenafi from "../assets/testimonials/ashenafi.jpg";

const testimonials = [
  {
    text: "Marota helped me master web development. The instructors are amazing!",
    name: "Samuel K.",
    role: "Student",
    image: Samuel,
  },
  {
    text: "Great cinematography training. I now work in the industry!",
    name: "Amina T.",
    role: "Graduate",
    image: Amina,
  },
  {
    text: "Thanks to Marota’s mobile app development course, I was able to build my first Android app and publish it successfully.",
    name: "Lidya M.",
    role: "Student",
    image: Lidya,
  },
  {
    text: "The basic computer skills training gave me confidence to use technology in my daily work.",
    name: "Yonas D.",
    role: "Graduate",
    image: Yonas,
  },
  {
    text: "Marota’s graphics and logo design classes boosted my creativity. Now I freelance as a designer for local businesses.",
    name: "Mekdes A.",
    role: "Freelancer",
    image: Mekdes,
  },
  {
    text: "Learning at Marota transformed my skills in web and design. I’m proud to be part of this journey.",
    name: "Ashenafi Bancha",
    role: "Student, Web & Design Enthusiast",
    image: Ashenafi,
  },
];

export default function Testimonials() {
  const [showAll, setShowAll] = useState(false);
  const visibleTestimonials = showAll ? testimonials : testimonials.slice(0, 2);

  return (
    <section id="testimonials" className="py-24 bg-[#112240] text-white">
      <div className="max-w-7xl mx-auto px-6 text-center mb-12">
        <h2 className="text-4xl font-bold text-[var(--accent-orange)]">
          What Our Students Say
        </h2>
      </div>

      <div className="grid md:grid-cols-2 gap-10 max-w-6xl mx-auto">
        {visibleTestimonials.map((t, idx) => (
          <div
            key={idx}
            className="bg-[#0a192f] p-6 rounded-lg shadow-lg flex flex-col items-center text-center 
                       transform transition duration-300 hover:scale-105 hover:shadow-2xl 
                       hover:border hover:border-[var(--accent-blue)]"
          >
            <img
              src={t.image}
              alt={t.name}
              className="w-24 h-24 rounded-full object-cover mb-4 border-2 border-transparent hover:border-[var(--accent-orange)] transition"
            />
            <p className="text-gray-300 italic">"{t.text}"</p>
            <h3 className="mt-4 font-semibold text-[var(--accent-blue)]">
              {t.name}
            </h3>
            <p className="text-sm text-gray-400">{t.role}</p>
          </div>
        ))}
      </div>

      {testimonials.length > 2 && (
        <div className="max-w-6xl mx-auto px-6 mt-8 text-center">
          <button
            type="button"
            onClick={() => setShowAll((prev) => !prev)}
            className="inline-flex items-center gap-2 rounded-md bg-[var(--accent-blue)] px-6 py-2 font-semibold text-black transition hover:bg-teal-300 hover:text-white"
          >
            {showAll ? "View less testimonials" : "View more testimonials"}
            <ArrowRight size={16} />
          </button>
        </div>
      )}
    </section>
  );
}
