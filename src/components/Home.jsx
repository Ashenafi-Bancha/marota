import { useEffect, useState } from "react";
import { Camera, Code, Users, Award, GraduationCap, Clock3 } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

import Hero1 from "../assets/pc-users-group.jpg";
import Hero2 from "../assets/camera.jpg";
import Hero3 from "../assets/programmer.jpg";
import Hero4 from "../assets/camera-male.jpg";
import Hero5 from "../assets/camera-female.jpg";
import Hero9 from "../assets/graphics-designer.jpg";
import Hero10 from "../assets/camera-men.jpg";


const images = [Hero1, Hero9,Hero10, Hero2, Hero3, Hero4, Hero5,];

export default function Hero() {
  const [currentImage, setCurrentImage] = useState(0);
  const [typedAdText, setTypedAdText] = useState("");
  const { user } = useAuth();
  const adText = "Coming Soon in Addis Ababa";
  const adPrefix = "Coming Soon in ";

  // Change image every 4 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImage((prevIndex) => (prevIndex + 1) % images.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    let charIndex = 0;
    let activeTimeout;
    let isCancelled = false;

    const runTyping = () => {
      if (isCancelled) return;

      if (charIndex < adText.length) {
        charIndex += 1;
        setTypedAdText(adText.slice(0, charIndex));
        activeTimeout = window.setTimeout(runTyping, 90);
      } else {
        activeTimeout = window.setTimeout(() => {
          charIndex = 0;
          setTypedAdText("");
          runTyping();
        }, 2400);
      }
    };

    runTyping();

    return () => {
      isCancelled = true;
      if (activeTimeout) {
        window.clearTimeout(activeTimeout);
      }
    };
  }, [adText]);

  return (
    <section id="home" className="relative min-h-[92vh] md:min-h-screen flex flex-col items-center justify-center overflow-hidden px-3">

      {/* Background images slideshow */}
      <div className="absolute inset-0 z-0 ">
        {images.map((img, index) => (
          <img
            key={index}
            src={img}
            alt={`Hero ${index + 1}`}
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${
              index === currentImage ? "opacity-100" : "opacity-0"
            }`}
          />
        ))}

        {/* Overlay gradient for readability */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(17,34,64,0.8)_0%,_rgba(10,25,47,0.95)_70%)]"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-7xl px-3 sm:px-5 text-center mt-2 md:mt-0 mx-auto">
        <div className="mb-5 flex justify-center">
          <div className="relative w-full max-w-4xl overflow-hidden rounded-2xl border border-yellow-300/50 bg-[#0b1d36]/90 px-5 py-4 sm:px-7 sm:py-5 shadow-[0_0_36px_rgba(250,204,21,0.2)]">
            <span className="absolute -top-8 -left-8 h-28 w-28 rounded-full bg-yellow-300/20 blur-2xl animate-pulse" />
            <span className="absolute -bottom-10 -right-10 h-36 w-36 rounded-full bg-cyan-300/20 blur-2xl animate-pulse" />

            <div className="relative z-10 text-center">
              <p className="text-sm sm:text-base font-extrabold tracking-[0.2em] uppercase text-yellow-300 animate-pulse">
                Big Update
              </p>
              <h2 className="mt-1 text-2xl sm:text-3xl md:text-4xl font-black leading-tight text-white">
                <span className="text-yellow-300">{typedAdText.slice(0, Math.min(typedAdText.length, adPrefix.length))}</span>
                <span className="text-[var(--accent-blue)]">{typedAdText.length > adPrefix.length ? typedAdText.slice(adPrefix.length) : ""}</span>
                <span className="ml-1 inline-block w-[2px] h-[1em] bg-[var(--accent-blue)] animate-pulse align-middle" />
              </h2>
              <p className="mt-2 text-sm sm:text-base text-gray-200">
                Marota is expanding with a new branch in Addis Ababa.
              </p>

              <div className="mt-3 flex items-center justify-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-yellow-300 animate-bounce" />
                <span className="h-2.5 w-2.5 rounded-full bg-cyan-300 animate-bounce [animation-delay:120ms]" />
                <span className="h-2.5 w-2.5 rounded-full bg-yellow-300 animate-bounce [animation-delay:240ms]" />
              </div>
            </div>
          </div>
        </div>

        <h1 className="font-bold leading-tight my-2 text-3xl sm:text-4xl md:text-5xl lg:text-6xl p-2 mx-auto text-center">
          Marota Film
          <span className="text-[var(--accent-blue)]">
            {" "}
            and Software Collage </span>
        </h1>

        <p className="hero-brand-slogan mx-auto mb-2 max-w-4xl px-3 text-base sm:text-xl md:text-2xl lg:text-3xl font-semibold leading-snug">
          <span className="hero-brand-slogan-text">
            Your Gateway to a Limitless Digital Future
          </span>
        </p>

        <p className="text-base sm:text-lg md:text-2xl mb-2 max-w-3xl text-gray-200 leading-relaxed mx-auto px-2 sm:px-4 py-2">
          Join our comprehensive programs in cinematography and software
          development. Learn from experts and launch your creative career.
        </p>

        <div className="flex flex-wrap gap-3 sm:gap-4 justify-center mb-2 py-2 w-full max-w-xl mx-auto">
          <Link
            to={user ? "/dashboard" : "/signup"}
            className="px-7 py-3 bg-[var(--accent-blue)] text-[var(--primary-dark)] md:rounded-lg rounded-3xl hover:bg-[#14b8a6] hover:text-white hover:shadow-lg transition w-full sm:w-auto text-center hover:translate-y-[-3px] font-semibold"
          >
            Get Started
          </Link>
          <Link
            to="/courses"
            className="px-7 py-3 rounded-3xl md:rounded-lg border border-white/30 bg-white/5 text-white hover:border-[var(--accent-blue)] hover:text-[var(--accent-blue)] hover:bg-[var(--primary-light)]/70 transition w-full sm:w-auto text-center font-semibold"
          >
            Explore Courses
          </Link>
        </div>

        <div className="mx-auto mt-3 flex w-full max-w-3xl flex-wrap items-center justify-center gap-2 sm:gap-3 px-2">
          {[
            "No prior experience required",
            "Hands-on projects",
            "Industry-focused training",
          ].map((item) => (
            <span
              key={item}
              className="inline-flex items-center rounded-full border border-white/15 bg-white/8 px-4 py-1.5 text-xs sm:text-sm text-slate-200 backdrop-blur-sm"
            >
              {item}
            </span>
          ))}
        </div>
      </div>

      {/* Floating Animation Elements */}
      <div className="absolute left-10 top-1/2 opacity-20 hidden md:block">
        <Code className="h-12 w-12 animate-pulse text-cyan-500" />
      </div>
      <div className="absolute top-20 left-10 opacity-20 hidden md:block">
        <Camera className="h-12 w-12 animate-pulse" />
      </div>
      <div className="absolute right-10 top-1/2 opacity-20 hidden md:block">
        <Camera className="h-12 w-12 animate-pulse text-cyan-500 " />
      </div>
      <div className="absolute top-20 right-10 opacity-20 hidden md:block">
        <Code className="h-12 w-12 animate-pulse" />
      </div>


      {/* Stats Section */}
      <div className="relative z-10 max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 mt-4 mb-4 w-full">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5 sm:gap-6 my-2 p-2 sm:p-4">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 rounded-full mb-4">
              <Users className="h-8 w-8 text-[var(--accent-blue)]" />
            </div>
            <h3 className="text-2xl sm:text-3xl font-bold text-white mb-2">500+</h3>
            <p className="text-gray-300 text-sm sm:text-base">Graduated Students</p>
          </div>
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 rounded-full mb-4">
              <GraduationCap className="h-8 w-8 text-[var(--accent-blue)]" />
            </div>
            <h3 className="text-2xl sm:text-3xl font-bold text-white mb-2">3</h3>
            <p className="text-gray-300 text-sm sm:text-base">Diploma Level Courses</p>
          </div>
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 rounded-full mb-4">
              <Clock3 className="h-8 w-8 text-[var(--accent-blue)]" />
            </div>
            <h3 className="text-2xl sm:text-3xl font-bold text-white mb-2">8</h3>
            <p className="text-gray-300 text-sm sm:text-base">Short Term Courses</p>
          </div>
          <div className="text-center pt-2 ">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 rounded-full mb-4">
              <Award className="h-8 w-8 text-[var(--accent-blue)]" />
            </div>
            <h3 className="text-2xl sm:text-3xl font-bold text-white mb-2 ">95%</h3>
            <p className="text-gray-300 text-sm sm:text-base">Job Placement Rate</p>
          </div>
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 rounded-full mb-4">
              <Code className="h-8 w-8 text-[var(--accent-blue)]" />
            </div>
            <h3 className="text-2xl sm:text-3xl font-bold text-white mb-2">8</h3>
            <p className="text-gray-300 text-sm sm:text-base">Years Experience</p>
          </div>
        </div>
      </div>
    </section>
  );
}
