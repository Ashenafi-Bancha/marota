import { useInView } from "react-intersection-observer";
import Image1 from "../../../assets/about1.jpg";
import Image2 from "../../../assets/about5.jpg";
import Image3 from "../../../assets/about4.jpg";

export default function About() {
  const [textRef, textInView] = useInView({ triggerOnce: true, threshold: 0.2 });
  const [imageRef, imageInView] = useInView({ triggerOnce: true, threshold: 0.2 });

  const values = [
    {
      title: "Creativity & Innovation",
      text: "Merging artistry with technology to inspire extraordinary outcomes.",
    },
    {
      title: "Community Impact",
      text: "Focusing on Wolaita and Southern Ethiopia while serving the whole nation.",
    },
    {
      title: "Collaboration",
      text: "Working with local and global partners to maximize opportunities.",
    },
    {
      title: "Excellence in Training",
      text: "Providing hands-on, industry-relevant education.",
    },
    {
      title: "Empowerment",
      text: "Fostering entrepreneurship, job creation, and self-reliance.",
    },
  ];

  const goals = [
    "Train and graduate highly skilled filmmakers, developers, and digital creators.",
    "Contribute to Ethiopia’s Digital Ethiopia 2025 agenda through capacity building.",
    "Establish Wolaita as a hub for digital creativity and innovation.",
    "Create opportunities for youth employment and entrepreneurship.",
    "Connect local talent with global markets and collaborations.",
  ];

  return (
    <section
      id="about"
      className="py-24 bg-gradient-to-b from-[#0a192f] via-[#10213f] to-[#0a192f] text-white"
    >
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-12">
          <p className="inline-flex px-4 py-1 rounded-full text-xs tracking-widest uppercase font-semibold bg-[#112240] text-[var(--accent-blue)] border border-cyan-800/60">
            About Marota
          </p>
          <h2 className="mt-4 text-4xl md:text-5xl font-bold text-[var(--accent-blue)]">
            Where Film Meets Software Innovation
          </h2>
          <p className="mt-4 max-w-3xl mx-auto text-gray-300 leading-relaxed">
            Marota Film & Software Collage is where <span className="text-[var(--accent-blue)] font-semibold">cinematic artistry and digital innovation converge</span> to create extraordinary experiences.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-10 items-start">
          <div
            ref={textRef}
            className={`space-y-6 transition-all duration-1000 ease-out transform ${
              textInView ? "translate-x-0 opacity-100" : "-translate-x-10 opacity-0"
            }`}
          >
            <p className="text-gray-300 leading-relaxed bg-[#112240]/60 border border-gray-700 rounded-2xl p-5 transition-transform duration-300 hover:-translate-y-1 hover:shadow-2xl hover:border-cyan-700/70">
              We are committed to building a digitally empowered Ethiopia, with a special focus on <span className="font-semibold text-white">Southern Ethiopia, particularly Wolaita</span>, by equipping students with world-class skills in film, web development, graphics, and emerging technologies.
            </p>

            <div className="grid sm:grid-cols-3 gap-4">
              <div className="rounded-xl bg-[#112240] border border-gray-700 p-4 text-center transition-transform duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-cyan-700/70">
                <p className="text-2xl font-bold text-[var(--accent-blue)]">500+</p>
                <p className="text-xs text-gray-300 mt-1">Graduates Trained</p>
              </div>
              <div className="rounded-xl bg-[#112240] border border-gray-700 p-4 text-center transition-transform duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-cyan-700/70">
                <p className="text-2xl font-bold text-[var(--accent-blue)]">12</p>
                <p className="text-xs text-gray-300 mt-1">Specialized Programs</p>
              </div>
              <div className="rounded-xl bg-[#112240] border border-gray-700 p-4 text-center transition-transform duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-cyan-700/70">
                <p className="text-2xl font-bold text-[var(--accent-blue)]">95%</p>
                <p className="text-xs text-gray-300 mt-1">Career Readiness Focus</p>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="rounded-2xl bg-[#112240]/70 border border-gray-700 p-5 transition-transform duration-300 hover:-translate-y-1 hover:shadow-2xl hover:border-cyan-700/70">
                <h3 className="text-xl font-semibold text-[var(--accent-blue)]">Our Mission</h3>
                <p className="text-gray-300 mt-3 text-sm leading-relaxed">
                  To empower individuals with creative and digital skills in filmmaking, software development, and design, enabling them to become globally competitive and lead in Ethiopia’s digital transformation.
                </p>
              </div>
              <div className="rounded-2xl bg-[#112240]/70 border border-gray-700 p-5 transition-transform duration-300 hover:-translate-y-1 hover:shadow-2xl hover:border-cyan-700/70">
                <h3 className="text-xl font-semibold text-[var(--accent-blue)]">Our Vision</h3>
                <p className="text-gray-300 mt-3 text-sm leading-relaxed">
                  To become Ethiopia’s leading center of excellence in film, software, and digital innovation — shaping a future where Wolaita and Ethiopia stand as global contributors.
                </p>
              </div>
            </div>
          </div>

          <div
            ref={imageRef}
            className={`transition-all duration-1000 ease-out transform ${
              imageInView ? "translate-x-0 opacity-100" : "translate-x-10 opacity-0"
            }`}
          >
            <div className="grid grid-cols-2 gap-4">
              <img
                src={Image1}
                alt="About Marota"
                className="col-span-2 rounded-2xl shadow-2xl object-cover w-full h-64 md:h-72 border border-gray-700"
              />
              <img
                src={Image2}
                alt="Marota in Action"
                className="rounded-2xl shadow-xl object-cover w-full h-44 md:h-52 border border-gray-700"
              />
              <img
                src={Image3}
                alt="Students at Marota"
                className="rounded-2xl shadow-xl object-cover w-full h-44 md:h-52 border border-gray-700"
              />
            </div>
          </div>
        </div>

        <div className="mt-12 grid lg:grid-cols-2 gap-8">
          <div className="rounded-2xl bg-[#112240]/60 border border-gray-700 p-6">
            <h3 className="text-2xl font-semibold text-[var(--accent-blue)]">Our Core Values</h3>
            <div className="mt-4 grid sm:grid-cols-2 gap-3">
              {values.map((value) => (
                <div key={value.title} className="rounded-xl bg-[#0a192f] border border-gray-700 p-4 transition-transform duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-cyan-700/70">
                  <p className="font-semibold text-[var(--accent-blue)]">{value.title}</p>
                  <p className="text-sm text-gray-300 mt-2">{value.text}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl bg-[#112240]/60 border border-gray-700 p-6">
            <h3 className="text-2xl font-semibold text-[var(--accent-blue)]">Our Goals</h3>
            <ol className="mt-4 space-y-3">
              {goals.map((goal, index) => (
                <li key={goal} className="flex gap-3 items-start text-gray-300 rounded-lg p-2 transition-colors duration-200 hover:bg-[#0a192f]/80">
                  <span className="shrink-0 inline-flex items-center justify-center w-7 h-7 rounded-full bg-[#0a192f] border border-cyan-700 text-[var(--accent-blue)] text-xs font-bold">
                    {index + 1}
                  </span>
                  <span className="text-sm leading-relaxed">{goal}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </section>
  );
}
