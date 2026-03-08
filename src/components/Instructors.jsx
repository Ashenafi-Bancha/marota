// src/components/Instructors.jsx
import { useState } from "react";
import Mathewos from "../assets/instructors/Ermias.jpg";
import Lidya from "../assets/instructors/Lidya.jpg";
import Eyonadab from "../assets/instructors/eyonadab.jpg";
import Kidist from "../assets/instructors/Kdist.jpg";
import Salah from "../assets/instructors/salah.jpg";
import Wondimagegn from "../assets/instructors/wonde.jpg";
import Mercy from "../assets/instructors/mercy.jpg";

import { FaFacebookF, FaLinkedinIn, FaTelegram } from "react-icons/fa";

const instructors = [
  { name: "Mathewos Ermias", role: "Photograpy and Videography, Cordinator", img: Mathewos },

  { name: "Lidiya Yonas", role: "Customer Service and Basic Computer Skills", img: Lidya },
  { name: "Eyonadab Malove", role: "Script writer, Directing, acting", img: Eyonadab },
  { name: "Kidist Yonas", role: "Graphic Designer", img: Kidist },
  { name: "Salah Anjoniyo",  role: "Film Instructor", img: Salah },
  { name: "Wondimagegn Desta", role: "Website Design and Database Administrator", img: Wondimagegn },
  { name: "Mercy Tekile",  role: "Video and Photo Editor", img:Mercy},
];

export default function Instructors() {
  const [isPinned, setIsPinned] = useState(false);

  const togglePinned = () => {
    setIsPinned((prev) => !prev);
  };

  return (
    <section id="instructors" className="py-24 bg-[#112240] text-white">
      <div className="max-w-7xl mx-auto px-6 text-center mb-12">
        <span className="marquee-section-badge">Expert Mentors</span>
        <h2 className="mt-4 text-4xl font-bold text-[var(--accent-blue)]">Meet Our Instructors</h2>
        <p className="text-gray-400 mt-2">Learn from professionals with years of experience.</p>
      </div>

      <div className="max-w-7xl mx-auto px-6">
        <div className={`marquee-shell marquee-shell-premium ${isPinned ? "is-paused" : ""}`}>
          <div className="marquee-track marquee-track-right" style={{ "--marquee-duration": "92s" }}>
            {[0, 1].map((segmentIndex) => (
              <div
                key={`instructor-segment-${segmentIndex}`}
                className="marquee-segment"
                aria-hidden={segmentIndex === 1}
              >
                {instructors.map((inst, idx) => (
                  <article
                    key={`${inst.name}-${segmentIndex}-${idx}`}
                    onClick={togglePinned}
                    className="marquee-card marquee-card-instructor w-[285px] cursor-pointer rounded-2xl p-6 text-center transition hover:scale-105"
                  >
                    <img
                      src={inst.img}
                      alt={inst.name}
                      className="marquee-avatar w-32 h-32 mx-auto rounded-full mb-4 object-cover"
                    />
                    <h3 className="text-xl font-semibold">{inst.name}</h3>
                    <p className="text-gray-400">{inst.role}</p>

                    <div className="flex justify-center space-x-4 mt-4">
                      <a
                        href="#"
                        className="instructor-social w-10 h-10 flex items-center justify-center rounded-full bg-[#1877F2] text-white hover:bg-[#0d65d9] transition"
                      >
                        <FaFacebookF />
                      </a>
                      <a
                        href="#"
                        className="instructor-social w-10 h-10 flex items-center justify-center rounded-full bg-[#0088cc] text-white hover:bg-[#0077b3] transition"
                      >
                        <FaTelegram />
                      </a>
                      <a
                        href="#"
                        className="instructor-social w-10 h-10 flex items-center justify-center rounded-full bg-[#0A66C2] text-white hover:bg-[#004182] transition"
                      >
                        <FaLinkedinIn />
                      </a>
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
