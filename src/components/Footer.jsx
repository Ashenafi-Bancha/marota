// src/components/Footer.jsx
import { FaFacebookF, FaTelegramPlane, FaTiktok, FaLinkedinIn, FaInstagram, FaYoutube } from "react-icons/fa";
import { Link } from "react-router-dom";
import logo from "../assets/logo1.png";

function Footer() {
  const quickLinks = [
    { label: "Home", to: "/" },
    { label: "About", to: "/about" },
    { label: "Courses", to: "/courses" },
    { label: "Portifolio", to: "/portfolio" },
    { label: "Gallery", to: "/gallery" },
    { label: "Instructors", to: "/instructors" },
    { label: "Contact", to: "/contact" },
  ];

  return (
    <footer className="relative mt-16 overflow-hidden border-t border-white/10 bg-[linear-gradient(180deg,#060f1f_0%,#040b17_100%)] pt-14 pb-6 text-gray-300">
      <span className="pointer-events-none absolute -left-20 top-8 h-52 w-52 rounded-full bg-cyan-300/10 blur-3xl" />
      <span className="pointer-events-none absolute -right-20 bottom-10 h-56 w-56 rounded-full bg-yellow-300/10 blur-3xl" />

      <div className="relative z-10 mx-auto grid max-w-7xl gap-6 px-6 md:grid-cols-2 lg:grid-cols-3">

        

        {/* About */}
        <div className="surface-card p-6 sm:p-7">
          <Link to="/" className="mb-4 inline-flex items-center gap-3">
            <img
              src={logo}
              alt="Marota Logo"
              className="h-10 w-10 rounded-full object-contain ring-2 ring-yellow-300/35"
            />
            <h4 className="brand-wordmark text-2xl font-bold tracking-wide">Marota</h4>
          </Link>
          <p className="max-w-sm text-sm leading-relaxed text-slate-300/95">
            Marota equips students with practical skills in film production and software development through hands-on training, mentorship, and industry-focused learning.
          </p>
        </div>

        {/* Quick Links */}
        <div className="surface-card p-6 sm:p-7">
          <h4 className="mb-4 text-xl font-semibold text-white">
            Quick Links
          </h4>
          <ul className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm text-slate-300">
            {quickLinks.map((item) => (
              <li key={item.label}>
                <Link
                  to={item.to}
                  className="inline-flex items-center text-slate-300 transition duration-200 hover:translate-x-1 hover:text-yellow-200"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      
        {/* Follow Us / Social Links */}
        <div className="surface-card p-6 sm:p-7">
          <h4 className="mb-4 text-xl font-semibold text-white">
            Follow Us
          </h4>
          <div className="mt-2 flex flex-wrap items-center gap-2 pb-1">
            <a href="https://www.facebook.com/profile.php?id=100087120218376" target="_blank" rel="noreferrer" title="Follow us on Facebook" className="shrink-0 rounded-full border border-white/15 bg-blue-600 p-2 transition hover:-translate-y-1 hover:shadow-[0_8px_18px_rgba(37,99,235,0.32)]">
              <FaFacebookF className="text-white" size={18} />
            </a>
            <a href="#" title="Join us on Telegram" className="shrink-0 rounded-full border border-white/15 bg-sky-500 p-2 transition hover:-translate-y-1 hover:shadow-[0_8px_18px_rgba(14,165,233,0.32)]">
              <FaTelegramPlane className="text-white" size={18} />
            </a>
            <a href="https://www.tiktok.com/@mfsc2857?_r=1&_t=ZN-947iwf01KQY" target="_blank" rel="noreferrer" title="Follow us on TikTok" className="shrink-0 rounded-full border border-white/15 bg-black p-2 transition hover:-translate-y-1 hover:shadow-[0_8px_18px_rgba(148,163,184,0.25)]">
              <FaTiktok className="text-white" size={18} />
            </a>
            <a href="#" target="_blank" rel="noreferrer" title="Follow us on LinkedIn" className="shrink-0 rounded-full border border-white/15 bg-blue-700 p-2 transition hover:-translate-y-1 hover:shadow-[0_8px_18px_rgba(29,78,216,0.35)]">
              <FaLinkedinIn className="text-white" size={18} />
            </a>
            
            <a href="#" title="Follow us on Instagram" className="shrink-0 rounded-full border border-white/15 bg-gradient-to-tr from-pink-500 via-red-500 to-yellow-400 p-2 transition hover:-translate-y-1 hover:shadow-[0_8px_18px_rgba(244,114,182,0.32)]">
              <FaInstagram className="text-white" size={18} />
            </a>
            <a href="https://www.youtube.com/channel/UCYxPI7bef6t6uGjywEnYJsQ" target="_blank" rel="noreferrer" title="Visit our YouTube channel" className="shrink-0 rounded-full border border-white/15 bg-red-600 p-2 transition hover:-translate-y-1 hover:shadow-[0_8px_18px_rgba(220,38,38,0.35)]">
              <FaYoutube className="text-white" size={18} />

            </a>
          </div>
          <div className="mt-4 space-y-2">
            <p className="text-xs leading-relaxed text-slate-400">
              Campus: Wolaita Sodo
            </p>
            <p className="inline-flex items-center rounded-full border border-yellow-300/40 bg-yellow-400/10 px-3 py-1 text-xs font-semibold text-yellow-200 shadow-[0_0_20px_rgba(250,204,21,0.12)]">
              Coming Soon in Addis Ababa
            </p>
          </div>
        </div>

      </div>

      {/* Copyright */}
      <div className="relative z-10 mt-10 border-t border-white/10 pt-5 text-slate-400">
        <div className="mx-auto flex w-full max-w-7xl flex-col items-center justify-between gap-3 px-6 md:flex-row">
          <div className="flex items-center justify-center gap-2 text-center md:justify-start md:text-left">
            <img
              src={logo}
              alt="Marota Logo"
              className="h-5 w-5 rounded-full object-contain ring-1 ring-white/20 md:h-6 md:w-6"
            />
            <span className="text-xs leading-relaxed sm:text-sm md:text-[15px]">
              &copy; {new Date().getFullYear()} Marota. All Rights Reserved.
            </span>
          </div>

          <nav aria-label="Legal" className="flex items-center justify-center gap-3 text-sm text-slate-500/90 md:justify-end">
            <Link to="/privacy" className="text-inherit transition-colors duration-200 hover:text-slate-200">
              Privacy Policy
            </Link>
            <span className="text-slate-700">|</span>
            <Link to="/terms" className="text-inherit transition-colors duration-200 hover:text-slate-200">
              Terms of Service
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  )
}

export default Footer;
