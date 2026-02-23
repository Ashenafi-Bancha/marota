import { useEffect, useState } from "react";
import { Camera, Code, Users, Award } from "lucide-react";
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
  const { user } = useAuth();

  // Change image every 4 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImage((prevIndex) => (prevIndex + 1) % images.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

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
          <div className="inline-flex flex-col sm:flex-row items-center gap-2 sm:gap-3 rounded-2xl border border-yellow-300/60 bg-[#0b1d36]/90 px-5 py-3 sm:px-6 sm:py-4 shadow-[0_0_35px_rgba(250,204,21,0.2)] animate-pulse">
            <span className="inline-flex items-center gap-2 rounded-full bg-yellow-400 px-3.5 py-1.5 text-xs sm:text-sm font-bold uppercase tracking-wider text-[#0a192f]">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#0a192f] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#0a192f]"></span>
              </span>
              Big Update
            </span>
            <p className="text-base sm:text-lg md:text-2xl font-bold text-white text-center sm:text-left leading-snug">
              <span className="text-yellow-300">Coming Soon:</span> New Marota Branch in <span className="text-[var(--accent-blue)]">Addis Ababa</span>
            </p>
          </div>
        </div>

        <h1 className="font-bold leading-tight my-2 text-3xl sm:text-4xl md:text-5xl lg:text-6xl p-2 mx-auto text-center">
          Welcome to Marota Film
          <span className="text-[var(--accent-blue)]">
            {" "}
            and Software Collage </span>
        </h1>

        <p className="text-base sm:text-lg md:text-2xl mb-2 max-w-3xl text-gray-200 leading-relaxed mx-auto px-2 sm:px-4 py-2">
          Join our comprehensive programs in cinematography and software
          development. Learn from experts and launch your creative career.
        </p>

        <div className="flex flex-wrap gap-3 sm:gap-4 justify-center mb-2 py-2 w-full max-w-xl mx-auto">
          <Link
            to={user ? "/dashboard" : "/signup"}
            className="px-7 py-3 bg-[var(--accent-blue)] text-[var(--primary-dark)] md:rounded-lg rounded-3xl hover:bg-[rgba(100,255,218,0.9)] hover:shadow-lg transition w-full sm:w-auto text-center hover:translate-y-[-3px] font-semibold"
          >
            Get Started
          </Link>
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
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5 sm:gap-6 my-2 p-2 sm:p-4">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 rounded-full mb-4">
              <Users className="h-8 w-8 text-[var(--accent-blue)]" />
            </div>
            <h3 className="text-2xl sm:text-3xl font-bold text-white mb-2">500+</h3>
            <p className="text-gray-300 text-sm sm:text-base">Graduated Students</p>
          </div>
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 rounded-full mb-4">
              <Camera className="h-8 w-8 text-[var(--accent-blue)]" />
            </div>
            <h3 className="text-2xl sm:text-3xl font-bold text-white mb-2">12</h3>
            <p className="text-gray-300 text-sm sm:text-base">Specialized Courses</p>
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
