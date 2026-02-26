// src/components/Footer.jsx
import { FaFacebookF, FaTelegramPlane, FaTiktok, FaLinkedinIn, FaInstagram, FaYoutube } from "react-icons/fa";
import { Link } from "react-router-dom";
import logo from "../assets/logo1.png";

function Footer() {
  const quickLinks = [
    { label: "Home", href: "/#home" },
    { label: "About", href: "/#about" },
    { label: "Courses", href: "/#services" },
    { label: "Portifolio", href: "/#portfolio" },
    { label: "Gallery", href: "/#gallery" },
    { label: "Instructors", href: "/#instructors" },
    { label: "Contact", href: "/#contact" },
  ];

  return (
    <footer className="mt-14 border-t border-white/10 bg-[linear-gradient(180deg,#071021_0%,#040b17_100%)] text-gray-300 pt-14 pb-6">
      <div className="max-w-7xl mx-auto px-6 grid gap-10 md:grid-cols-2 lg:grid-cols-3">

        

        {/* About */}
        <div>
          <div className="mb-4 flex items-center gap-3">
            <img
              src={logo}
              alt="Marota Logo"
              className="h-9 w-9 rounded-full object-contain ring-2 ring-yellow-300/35"
            />
            <h4 className="text-2xl font-bold tracking-wide text-yellow-300">Marota</h4>
          </div>
          <p className="max-w-sm text-sm leading-relaxed text-slate-300">
            Practical film and software training for a digital-first future.
          </p>


          <a
            href="/#contact"
            className="inline-flex mt-4 px-6 py-3 bg-[var(--accent-blue)] text-[var(--primary-dark)] md:rounded-lg rounded-3xl hover:bg-[#14b8a6] hover:text-white hover:shadow-lg transition hover:translate-y-[-3px] text-sm font-semibold"
          >
            Contact Admissions
          </a>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="text-xl font-semibold text-white mb-4">
            Quick Links
          </h4>
          <ul className="space-y-2 text-sm text-slate-300">
            {quickLinks.map((item) => (
              <li key={item.label}>
                <a href={item.href} className="hover:text-yellow-200 transition">
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      
        {/* Follow Us / Social Links */}
        <div>
          <h4 className="text-xl font-semibold text-white mb-4">
            Follow Us
          </h4>
          <div className="mt-2 flex items-center gap-2 flex-nowrap overflow-x-auto pb-1">
            <a href="https://www.facebook.com/profile.php?id=100087120218376" target="_blank" rel="noreferrer" title="Follow us on Facebook" className="rounded-full border border-white/15 bg-blue-600 p-1.5 transition transform hover:-translate-y-1 shrink-0">
              <FaFacebookF className="text-white" size={18} />
            </a>
            <a href="#" title="Join us on Telegram" className="rounded-full border border-white/15 bg-sky-500 p-1.5 transition transform hover:-translate-y-1 shrink-0">
              <FaTelegramPlane className="text-white" size={18} />
            </a>
            <a href="https://www.tiktok.com/@mfsc2857?_r=1&_t=ZN-947iwf01KQY" target="_blank" rel="noreferrer" title="Follow us on TikTok" className="rounded-full border border-white/15 bg-black p-1.5 transition transform hover:-translate-y-1 shrink-0">
              <FaTiktok className="text-white" size={18} />
            </a>
            <a href="#" target="_blank" rel="noreferrer" title="Follow us on LinkedIn" className="rounded-full border border-white/15 bg-blue-700 p-1.5 transition transform hover:-translate-y-1 shrink-0">
              <FaLinkedinIn className="text-white" size={18} />
            </a>
            
            <a href="#" title="Follow us on Instagram" className="rounded-full border border-white/15 bg-gradient-to-tr from-pink-500 via-red-500 to-yellow-400 p-1.5 transition transform hover:-translate-y-1 shrink-0">
              <FaInstagram className="text-white" size={18} />
            </a>
            <a href="https://www.youtube.com/channel/UCYxPI7bef6t6uGjywEnYJsQ" target="_blank" rel="noreferrer" title="Visit our YouTube channel" className="rounded-full border border-white/15 bg-red-600 p-1.5 transition transform hover:-translate-y-1 shrink-0">
              <FaYoutube className="text-white" size={18} />

            </a>
          </div>
          <div className="mt-4 space-y-1">
            <p className="text-xs text-slate-400 leading-relaxed">
              Campus: Wolaita Sodo
            </p>
            <p className="inline-flex items-center rounded-full border border-yellow-300/40 bg-yellow-400/10 px-3 py-1 text-xs font-semibold text-yellow-200 shadow-[0_0_20px_rgba(250,204,21,0.12)]">
              Coming Soon in Addis Ababa
            </p>
          </div>
        </div>

      </div>

      {/* Copyright */}
      <div className="mt-10 border-t border-white/10 pt-4 text-slate-400">
        <div className="mx-auto flex w-full max-w-7xl flex-col items-center justify-between gap-3 px-6 md:flex-row">
          <div className="flex items-center justify-center gap-2 text-center md:justify-start md:text-left">
            <img
              src={logo}
              alt="Marota Logo"
              className="h-5 w-5 rounded-full object-contain md:h-6 md:w-6"
            />
            <span className="text-xs sm:text-sm md:text-[15px] leading-relaxed">
              &copy; {new Date().getFullYear()} Marota. All Rights Reserved.
            </span>
          </div>

          <nav aria-label="Legal" className="flex items-center justify-center gap-3 text-[11px] sm:text-xs md:justify-end text-slate-500/90">
            <Link to="/privacy" className="text-inherit transition-colors duration-200 hover:text-slate-300">
              Privacy Policy
            </Link>
            <span className="text-slate-700">|</span>
            <Link to="/terms" className="text-inherit transition-colors duration-200 hover:text-slate-300">
              Terms of Service
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  )
}

export default Footer;
