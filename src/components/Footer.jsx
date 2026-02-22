// src/components/Footer.jsx
import { FaFacebookF, FaTelegramPlane, FaTiktok, FaLinkedinIn, FaInstagram, FaYoutube } from "react-icons/fa";
import logo from "../assets/logo1.png";

function Footer() {
  return (
    <footer className="mt-10 border-t border-white/10 bg-[#071021] text-gray-300 pt-14 pb-6">
      <div className="max-w-7xl mx-auto px-6 grid gap-10 md:grid-cols-2 lg:grid-cols-4 sm:text-center">

        {/* About */}
        <div className="sm:flex sm:flex-col sm:items-center">
          <h4 className="mb-4 text-xl font-semibold text-white relative !text-left ">
            MAROTA 
          </h4>
          <p className="text-sm leading-relaxed text-left text-slate-300">
           Where cinematic artistry and digital innovation converge to create extraordinary experiences, Marota is dedicated to empowering Ethiopia’s digital transformation. We focus on building creative and technical capacity across the nation — with a special commitment to Southern Ethiopia, particularly Wolaita by training the next generation in film, web development, graphics, and emerging technologies.
          </p>
        </div>

        {/* Quick Links */}
        <div className="sm:flex sm:flex-col sm:items-center">
          <h4 className="text-xl font-semibold text-white mb-4 relative ">
            Quick Links
          </h4>
          <ul className="space-y-2 text-sm text-left text-slate-300">
            <li><a href="#home" className="hover:text-yellow-400 transition">Home</a></li>
            <li><a href="#about" className="hover:text-yellow-200 transition">About</a></li>
            <li><a href="#services" className="hover:text-yellow-200 transition">Services</a></li>
            <li><a href="#instructors" className="hover:text-yellow-200 transition">Instructors</a></li>
            <li><a href="#portfolio" className="hover:text-yellow-200 transition">Portfolio</a></li>
            <li><a href="#gallery" className="hover:text-yellow-200 transition">Gallery</a></li>
            <li><a href="#testimonials" className="hover:text-yellow-200 transition" >Testimonials</a></li>
            <li><a href="#contact" className="hover:text-yellow-200 transition">Contact</a></li>
          </ul>
        </div>

        {/* Academy Programs */}
        <div className="sm:flex sm:flex-col sm:items-center">
          <h4 className="text-xl font-semibold text-white mb-4 relative ">
            Academy Programs
          </h4>
          <ul className="space-y-2 text-sm text-left text-slate-300">
            <li><a href="#services" className="hover:text-yellow-200 transition"> Basic Cinematography Concepts</a></li>
            <li><a href="#services" className="hover:text-yellow-200 transition">Film Making </a></li>
            <li><a href="#services" className="hover:text-yellow-200 transition">Web Design and Development</a></li>
            <li><a href="#services" className="hover:text-yellow-200 transition">Database Administrattion</a></li>
            <li><a href="#services" className="hover:text-yellow-200 transition">Basick Computer Skills</a></li>
            <li><a href="#services" className="hover:text-yellow-200 transition">Graphics Design</a></li>
            <li><a href="#services" className="hover:text-yellow-200 transition">Network and Hardware Servicing</a></li>
            <li><a href="#services" className="hover:text-yellow-200 transition">Logo Design</a></li>

          </ul>
        </div>

        {/* Follow Us / Social Links */}
        <div className="sm:flex sm:flex-col sm:items-center">
          <h4 className="text-xl font-semibold text-white mb-4 relative ">
            Follow Us
          </h4>
          <div className="mt-2 flex space-x-3 sm:justify-center">
            <a href="https://www.facebook.com/profile.php?id=100087120218376" target="_blank" rel="noreferrer" title="Follow us on Facebook" className="rounded-full border border-white/15 bg-blue-600 p-2 transition transform hover:-translate-y-1">
              <FaFacebookF className="text-white" size={22} />
            </a>
            <a href="#" title="Join us on Telegram" className="rounded-full border border-white/15 bg-sky-500 p-2 transition transform hover:-translate-y-1">
              <FaTelegramPlane className="text-white" size={22} />
            </a>
            <a href="https://www.tiktok.com/@mfsc2857?_r=1&_t=ZN-947iwf01KQY" target="_blank" rel="noreferrer" title="Follow us on TikTok" className="rounded-full border border-white/15 bg-black p-2 transition transform hover:-translate-y-1">
              <FaTiktok className="text-white" size={22} />
            </a>
            <a href="#" target="_blank" rel="noreferrer" title="Follow us on LinkedIn" className="rounded-full border border-white/15 bg-blue-700 p-2 transition transform hover:-translate-y-1">
              <FaLinkedinIn className="text-white" size={22} />
            </a>
            
            <a href="#" title="Follow us on Instagram" className="rounded-full border border-white/15 bg-gradient-to-tr from-pink-500 via-red-500 to-yellow-400 p-2 transition transform hover:-translate-y-1">
              <FaInstagram className="text-white" size={22} />
            </a>
            <a href="https://www.youtube.com/channel/UCYxPI7bef6t6uGjywEnYJsQ" target="_blank" rel="noreferrer" title="Visit our YouTube channel" className="rounded-full border border-white/15 bg-red-600 p-2 transition transform hover:-translate-y-1">
              <FaYoutube className="text-white" size={22} />
            </a>
          </div>
        </div>

      </div>

      {/* Copyright */}
      <div className="mt-10 border-t border-white/10 pt-4 text-slate-400">
        <div className="flex items-center justify-center gap-2 flex-nowrap">
          <img
            src={logo}
            alt="Marota Logo"
            className="w-5 h-5 md:w-6 md:h-6 rounded-full object-contain"
          />
          <span className="text-xs sm:text-sm md:text-base text-center whitespace-nowrap">
            &copy; {new Date().getFullYear()} Marota Film & Software College. All Rights Reserved.
          </span>
        </div>
      </div>
    </footer>
  )
}

export default Footer;
