// src/components/Footer.jsx
import { FaFacebookF, FaTelegramPlane, FaTiktok, FaLinkedinIn, FaInstagram, FaYoutube } from "react-icons/fa";
import { FiArrowUpRight } from "react-icons/fi";
import { Link } from "react-router-dom";
import logo from "../../assets/logo1.png";
import cbeImage from "../../assets/cbe.jpeg";
import boaImage from "../../assets/boa.png";
import awashImage from "../../assets/awash.png";
import dashenImage from "../../assets/dashen.png";
import telebirrImage from "../../assets/telebirr.jpeg";
import mpesaImage from "../../assets/mpesa.png";
import ThemeSwitcher from "../../shared/ui/ThemeSwitcher";

function Footer() {
  const quickLinks = [
    { label: "Home", to: "/" },
    { label: "About", to: "/about" },
    { label: "Courses", to: "/courses" },
    { label: "Portfolio", to: "/portfolio" },
    { label: "Gallery", to: "/gallery" },
    { label: "Instructors", to: "/instructors" },
    { label: "Testimonials", to: "/#testimonials" },
    { label: "Blog", to: "/blog" },
    { label: "Contact", to: "/contact" },
  ];

  const paymentMethods = [
    { label: "CBE", image: cbeImage },
    { label: "BOA", image: boaImage },
    { label: "Awash Bank", image: awashImage },
    { label: "Dashen Bank", image: dashenImage },
    { label: "Telebirr", image: telebirrImage },
    { label: "M-Pesa", image: mpesaImage },
  ];

  return (
    <footer className="mt-16 border-t border-white/10 bg-[#050d1a] pt-14 pb-6 text-gray-300">
      <div className="mx-auto grid max-w-7xl gap-10 px-6 md:grid-cols-2 lg:grid-cols-3">

        

        {/* About */}
        <div>
          <Link to="/" className="mb-4 inline-flex items-center gap-3">
            <img
              src={logo}
              alt="Marota Logo"
              className="h-10 w-10 rounded-full object-contain ring-2 ring-yellow-300/35"
            />
            <h4 className="brand-wordmark text-2xl font-bold tracking-wide">Marota</h4>
          </Link>
          <p className="max-w-sm text-sm leading-relaxed text-slate-300/95">
            Marota is a film and software training college. We teach practical skills through real projects, mentor support, and career-focused courses.
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="mb-4 text-xl font-semibold text-white">
            Quick Links
          </h4>
          <ul className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm text-slate-300">
            {quickLinks.map((item) => (
              <li key={item.label}>
                <Link
                  to={item.to}
                  className="group inline-flex items-center gap-1 text-slate-300 transition duration-200 hover:translate-x-1 hover:text-yellow-200"
                >
                  {item.label}
                  <FiArrowUpRight className="text-xs transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      
        {/* Follow Us / Social Links */}
        <div>
          <h4 className="mb-4 text-xl font-semibold text-white">
            Follow Us
          </h4>
          <div className="mt-2 flex flex-wrap items-center gap-2 pb-1">
            <a href="https://www.facebook.com/profile.php?id=100087120218376" target="_blank" rel="noreferrer" title="Follow us on Facebook" className="shrink-0 rounded-full border border-white/15 bg-blue-600 p-2 transition hover:-translate-y-1 hover:shadow-[0_8px_18px_rgba(37,99,235,0.32)]">
              <FaFacebookF className="text-white" size={18} />
            </a>
            <a href="https://t.me/marota132" target="_blank" rel="noreferrer" title="Join us on Telegram" className="shrink-0 rounded-full border border-white/15 bg-sky-500 p-2 transition hover:-translate-y-1 hover:shadow-[0_8px_18px_rgba(14,165,233,0.32)]">
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
      <div className="mt-10 border-t border-white/10 pt-5 text-slate-400">
        <div className="mx-auto flex w-full max-w-7xl flex-col items-center justify-between gap-4 px-6 lg:flex-row">
          <div className="flex items-center justify-center gap-2 text-center md:justify-start md:text-left">
            <span className="text-xs leading-relaxed sm:text-sm md:text-[15px]">
              &copy; {new Date().getFullYear()} Marota Film and Software collage. All Rights Reserved.
            </span>
          </div>

          <div className="w-full max-w-sm">
            <p className="text-center text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-300">
              Enroll and pay with
            </p>
            <div className="mt-1 grid grid-cols-6 gap-1.5">
              {paymentMethods.map((method) => (
                <div
                  key={method.label}
                  className="rounded-md border border-white/15 bg-white p-1"
                  title={`Pay with ${method.label}`}
                >
                  <img
                    src={method.image}
                    alt={method.label}
                    className="h-5 w-full object-contain"
                    loading="lazy"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="flex w-full flex-col items-center gap-3 lg:w-auto lg:flex-row lg:justify-end">
            <nav aria-label="Legal" className="flex items-center justify-center gap-3 text-sm text-slate-500/90 md:justify-end">
              <Link to="/privacy" className="text-inherit transition-colors duration-200 hover:text-slate-200">
                Privacy Policy
              </Link>
              <span className="text-slate-700">|</span>
              <Link to="/terms" className="text-inherit transition-colors duration-200 hover:text-slate-200">
                Terms of Service
              </Link>
            </nav>
            <div className="w-full max-w-[260px] rounded-xl border border-white/15 bg-[#0b1b33] px-3 py-2 lg:hidden">
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-300">Theme</p>
              <p className="mt-1 text-xs text-slate-400">Choose your preferred look for small screens.</p>
              <div className="mt-2 inline-flex">
                <ThemeSwitcher compact />
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer;
