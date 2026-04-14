import { useEffect, useState } from "react";
import {
  Camera,
  Code,
  Users,
  Globe,
  Building2,
  Hotel,
  School,
  Smartphone,
  Bot,
  Award,
  GraduationCap,
  Clock3,
  ArrowRight,
  ShieldCheck,
  BriefcaseBusiness,
  Layers3,
  ChevronDown,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../../auth/context/AuthProvider";

import Hero1 from "../../../assets/pc-users-group.jpg";
import Hero2 from "../../../assets/camera.jpg";
import Hero3 from "../../../assets/programmer.jpg";
import Hero4 from "../../../assets/camera-male.jpg";
import Hero5 from "../../../assets/camera-female.jpg";
import Hero9 from "../../../assets/graphics-designer.jpg";
import Hero10 from "../../../assets/camera-men.jpg";
import Testimonials from "../components/Testimonials";
import Contact from "./ContactPage";


const images = [Hero1, Hero9,Hero10, Hero2, Hero3, Hero4, Hero5,];

const valueCards = [
  {
    title: "Hands-On Training",
    description:
      "Learn by doing with practical projects, studio activities, and guided real-world exercises.",
    icon: Layers3,
  },
  {
    title: "Career-Ready Outcomes",
    description:
      "Build a portfolio, strengthen your confidence, and prepare for freelance or full-time opportunities.",
    icon: BriefcaseBusiness,
  },
  {
    title: "Trusted Learning Path",
    description:
      "Structured learning roadmap with mentor support, progress checkpoints, and recognized certificates.",
    icon: ShieldCheck,
  },
];

const learningJourney = [
  {
    title: "Choose Your Track",
    detail: "Pick Diploma or Short Term courses based on your goals.",
  },
  {
    title: "Learn by Practice",
    detail: "Work on practical tasks and guided projects every week.",
  },
  {
    title: "Get Mentored",
    detail: "Receive feedback from instructors and improve with clear direction.",
  },
  {
    title: "Graduate with Portfolio",
    detail: "Finish with real work samples and certificate-backed confidence.",
  },
];

const serviceCards = [
  {
    title: "Full NGO Websites",
    description:
      "Complete NGO websites with donation pages, campaign storytelling, and trust-focused design.",
    icon: Globe,
    tags: ["Donation pages", "Campaign-ready", "SEO-ready"],
  },
  {
    title: "Digital Systems for Organizations",
    description:
      "Custom digital systems that modernize daily operations and improve how teams serve people.",
    icon: Building2,
    tags: ["Custom workflows", "Secure access", "Scalable"],
  },
  {
    title: "Hotel Websites",
    description:
      "Hotel and hospitality websites with service highlights, booking-focused flow, and clean UX.",
    icon: Hotel,
    tags: ["Booking-focused", "Fast loading", "Brand-aligned UI"],
  },
  {
    title: "School Websites & Portals",
    description:
      "Education platforms for admissions, announcements, and parent-student communication.",
    icon: School,
    tags: ["Admissions info", "Parent updates", "Program pages"],
  },
  {
    title: "Business Websites",
    description:
      "Professional business websites that improve visibility, credibility, and lead generation.",
    icon: BriefcaseBusiness,
    tags: ["Lead generation", "Brand trust", "Growth-ready"],
  },
  {
    title: "Landing Pages",
    description:
      "High-converting campaign and product landing pages built to turn visitors into clients.",
    icon: Layers3,
    tags: ["Conversion focused", "Fast launch", "Ad-ready"],
  },
  {
    title: "Android & iOS Apps",
    description:
      "Cross-platform mobile apps built for reliability, speed, and smooth user experience.",
    icon: Smartphone,
    tags: ["Android", "iOS", "API integrated"],
  },
  {
    title: "AI Workflow Automation",
    description:
      "AI integrations that automate repetitive tasks, improve response time, and increase team productivity.",
    icon: Bot,
    tags: ["Process automation", "AI integration", "Time saving"],
  },
];

const faqs = [
  {
    question: "Do I need prior experience to join?",
    answer:
      "No. Most beginner tracks are designed to start from fundamentals and gradually build practical skills.",
  },
  {
    question: "Are courses available online and in person?",
    answer:
      "Yes. Marota offers flexible delivery depending on the program, including in-person and blended options.",
  },
  {
    question: "Will I get a certificate after completion?",
    answer:
      "Yes. Learners who complete required coursework and assessments receive a recognized certificate.",
  },
  {
    question: "How do I start enrollment?",
    answer:
      "Go to the Courses page, choose your program, submit enrollment, and follow payment and approval steps.",
  },
];

export default function Hero() {
  const [currentImage, setCurrentImage] = useState(0);
  const [typedAdText, setTypedAdText] = useState("");
  const [isSmallScreen, setIsSmallScreen] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.innerWidth < 768;
  });
  const [openFaqIndex, setOpenFaqIndex] = useState(0);
  const { user } = useAuth();
  const adText = "Coming Soon in Addis Ababa";
  const adPrefix = "Coming Soon in ";

  useEffect(() => {
    const handleResize = () => {
      setIsSmallScreen(window.innerWidth < 768);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Change image every 4 seconds
  useEffect(() => {
    if (isSmallScreen) return undefined;

    const interval = setInterval(() => {
      setCurrentImage((prevIndex) => (prevIndex + 1) % images.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [isSmallScreen]);

  useEffect(() => {
    if (isSmallScreen) {
      setTypedAdText(adText);
      return undefined;
    }

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
  }, [adText, isSmallScreen]);

  return (
    <>
    <section id="home" className="relative min-h-[92vh] md:min-h-screen flex flex-col items-center justify-center overflow-hidden px-3">

      {/* Background image slideshow */}
      <div className="absolute inset-0 z-0 ">
        <div className="absolute inset-0 md:hidden">
          <img
            src={Hero1}
            alt="Hero background"
            className="absolute inset-0 h-full w-full object-cover"
          />
        </div>

        <div className="absolute inset-0 hidden md:block">
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
        </div>

        {/* Overlay gradient for readability */}
        <div className="hero-overlay absolute inset-0"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-7xl px-3 sm:px-5 text-center mt-2 md:mt-0 mx-auto">
        <div className="mb-5 flex justify-center">
          <div className="hero-announcement-card relative w-full max-w-4xl overflow-hidden rounded-2xl px-5 py-4 sm:px-7 sm:py-5">
            <span className="absolute -top-8 -left-8 h-28 w-28 rounded-full bg-yellow-300/20 blur-2xl animate-pulse" />
            <span className="absolute -bottom-10 -right-10 h-36 w-36 rounded-full bg-cyan-300/20 blur-2xl animate-pulse" />

            <div className="relative z-10 text-center">
              <p className={`hero-announcement-label text-sm sm:text-base font-extrabold tracking-[0.2em] uppercase ${isSmallScreen ? "" : "animate-pulse"}`}>
                Big Update
              </p>
              <h2 className="hero-announcement-title mt-1 text-2xl sm:text-3xl md:text-4xl font-black leading-tight">
                {isSmallScreen ? (
                  <span className="hero-announcement-main">{adText}</span>
                ) : (
                  <>
                    <span className="hero-announcement-prefix">{typedAdText.slice(0, Math.min(typedAdText.length, adPrefix.length))}</span>
                    <span className="hero-announcement-main">{typedAdText.length > adPrefix.length ? typedAdText.slice(adPrefix.length) : ""}</span>
                    <span className="hero-announcement-cursor ml-1 inline-block w-[2px] h-[1em] animate-pulse align-middle" />
                  </>
                )}
              </h2>
              <p className="hero-announcement-desc mt-2 text-sm sm:text-base">
                Marota is expanding with a new branch in Addis Ababa.
              </p>

              <div className={`mt-3 items-center justify-center gap-2 ${isSmallScreen ? "hidden" : "flex"}`}>
                <span className="h-2.5 w-2.5 rounded-full bg-yellow-300 animate-bounce" />
                <span className="h-2.5 w-2.5 rounded-full bg-cyan-300 animate-bounce [animation-delay:120ms]" />
                <span className="h-2.5 w-2.5 rounded-full bg-yellow-300 animate-bounce [animation-delay:240ms]" />
              </div>
            </div>
          </div>
        </div>

        <div className="text-center">
            <h1 className="hero-main-title font-bold leading-tight my-2 text-3xl sm:text-4xl md:text-5xl lg:text-6xl p-2 mx-auto text-center">
              Marota Film
              <span className="hero-main-title-accent">
                {" "}
                and Software Collage </span>
            </h1>

            <p className="hero-brand-slogan mx-auto mb-2 max-w-4xl px-3 text-base sm:text-xl md:text-2xl lg:text-3xl font-semibold leading-snug">
              <span className="hero-brand-slogan-text">
                Your Gateway to a Limitless Digital Future
              </span>
            </p>

            <p className="hero-main-description text-base sm:text-lg md:text-2xl mb-2 max-w-3xl leading-relaxed mx-auto px-2 sm:px-4 py-2">
              Join our comprehensive programs in cinematography and software
              development. Learn from experts and launch your creative career.
            </p>

            <div className="flex flex-wrap gap-3 sm:gap-4 justify-center mb-2 py-2 w-full max-w-xl mx-auto">
              <Link
                to={user ? "/dashboard" : "/signup"}
                className="hero-primary-cta group inline-flex w-full items-center justify-center gap-2 px-7 py-3 text-center font-semibold transition hover:translate-y-[-3px] md:rounded-lg rounded-3xl sm:w-auto"
              >
                Get Started
                <ArrowRight size={18} className="transition-transform duration-200 group-hover:translate-x-1" />
              </Link>
              <Link
                to="/courses"
                className="hero-secondary-cta group inline-flex w-full items-center justify-center gap-2 px-7 py-3 rounded-3xl text-center font-semibold transition md:rounded-lg sm:w-auto"
              >
                Explore Courses
                <ArrowRight size={18} className="transition-transform duration-200 group-hover:translate-x-1" />
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
                  className="hero-trust-chip inline-flex items-center rounded-full px-4 py-1.5 text-xs sm:text-sm backdrop-blur-sm"
                >
                  {item}
                </span>
              ))}
            </div>
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
            <h3 className="hero-stat-value text-2xl sm:text-3xl font-bold mb-2">500+</h3>
            <p className="hero-stat-label text-sm sm:text-base">Graduated Students</p>
          </div>
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 rounded-full mb-4">
              <GraduationCap className="h-8 w-8 text-[var(--accent-blue)]" />
            </div>
            <h3 className="hero-stat-value text-2xl sm:text-3xl font-bold mb-2">3</h3>
            <p className="hero-stat-label text-sm sm:text-base">Diploma Level Courses</p>
          </div>
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 rounded-full mb-4">
              <Clock3 className="h-8 w-8 text-[var(--accent-blue)]" />
            </div>
            <h3 className="hero-stat-value text-2xl sm:text-3xl font-bold mb-2">8</h3>
            <p className="hero-stat-label text-sm sm:text-base">Short Term Courses</p>
          </div>
          <div className="text-center pt-2 ">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 rounded-full mb-4">
              <Award className="h-8 w-8 text-[var(--accent-blue)]" />
            </div>
            <h3 className="hero-stat-value text-2xl sm:text-3xl font-bold mb-2 ">95%</h3>
            <p className="hero-stat-label text-sm sm:text-base">Job Placement Rate</p>
          </div>
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 rounded-full mb-4">
              <Code className="h-8 w-8 text-[var(--accent-blue)]" />
            </div>
            <h3 className="hero-stat-value text-2xl sm:text-3xl font-bold mb-2">8</h3>
            <p className="hero-stat-label text-sm sm:text-base">Years Experience</p>
          </div>
        </div>
      </div>

      <div className="relative z-10 w-full max-w-6xl px-3 pb-6 sm:px-6 lg:px-8">
        <div className="overflow-hidden rounded-2xl border border-cyan-300/25 bg-[#0f2240]/75 p-4 shadow-[0_16px_40px_rgba(2,8,23,0.35)] backdrop-blur-sm sm:p-6">
          <div className="grid gap-4 md:grid-cols-2">
            <article className="group rounded-2xl border border-cyan-300/25 bg-gradient-to-br from-[#112a4b]/90 to-[#0d203c]/90 p-5 text-left transition duration-300 hover:-translate-y-1 hover:border-cyan-300/50">
              <div className="inline-flex items-center gap-2 rounded-full border border-cyan-300/35 bg-cyan-400/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] text-cyan-100">
                <GraduationCap size={14} />
                Diploma Courses
              </div>
              <p className="mt-3 text-sm leading-relaxed text-slate-100 sm:text-base">
                Diploma courses are divided into four levels with focused learning in three major courses.
                Diploma level courses are given in person at Marota campuses.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs text-slate-200">5 Levels</span>
                <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs text-slate-200">3 Focus Courses</span>
                <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs text-slate-200">In-Person Campus</span>
              </div>
            </article>

            <article className="group rounded-2xl border border-yellow-300/25 bg-gradient-to-br from-[#2a2440]/90 to-[#1e1735]/90 p-5 text-left transition duration-300 hover:-translate-y-1 hover:border-yellow-300/50">
              <div className="inline-flex items-center gap-2 rounded-full border border-yellow-300/35 bg-yellow-300/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] text-yellow-100">
                <Clock3 size={14} />
                Short Term Courses
              </div>
              <p className="mt-3 text-sm leading-relaxed text-slate-100 sm:text-base">
                Short term courses are flexible and provided both online and in person,
                helping learners choose the schedule and format that fits them best.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs text-slate-200">Online Learning</span>
                <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs text-slate-200">In-Person Classes</span>
                <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs text-slate-200">Flexible Mode</span>
              </div>
            </article>
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Link
              to="/courses"
              className="inline-flex items-center gap-2 rounded-full border border-cyan-300/45 bg-cyan-400/10 px-6 py-2.5 text-sm font-semibold uppercase tracking-[0.12em] text-cyan-100 transition hover:-translate-y-0.5 hover:border-cyan-200"
            >
              Explore Courses
              <ArrowRight size={16} />
            </Link>
            <Link
              to={user ? "/courses" : "/signup"}
              className="group inline-flex items-center gap-2 rounded-full border border-yellow-300/55 bg-gradient-to-r from-yellow-300/85 via-amber-300/90 to-orange-300/85 px-6 py-2.5 text-sm font-extrabold uppercase tracking-[0.1em] text-[#0a192f] shadow-[0_10px_25px_rgba(250,204,21,0.26)] transition duration-300 hover:-translate-y-0.5 hover:from-yellow-200 hover:to-orange-200"
            >
              <Award size={16} className="transition-transform duration-200 group-hover:rotate-12" />
              Enroll & Get Certified
            </Link>
          </div>
          <p className="mt-3 text-center text-xs font-medium tracking-wide text-slate-300 sm:text-sm">
            Start your enrollment today and build job-ready skills with a recognized certificate.
          </p>

        </div>
      </div>
    </section>

    <section className="bg-[#08182d] py-8 md:py-10">
      <div className="mx-auto grid w-full max-w-6xl grid-cols-2 gap-3 px-4 text-center sm:grid-cols-4 sm:gap-4">
        {[
          "Industry-focused curriculum",
          "Mentor-led practical sessions",
          "Portfolio-based graduation",
          "Career support and guidance",
        ].map((item) => (
          <div
            key={item}
            className="rounded-xl border border-cyan-300/20 bg-[#0e2340]/75 px-3 py-3 text-xs font-semibold uppercase tracking-[0.08em] text-slate-200 sm:text-sm"
          >
            {item}
          </div>
        ))}
      </div>
    </section>

    <section className="bg-[#0a192f] py-16 md:py-20">
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
        <div className="mx-auto max-w-3xl text-center">
          <p className="inline-flex rounded-full border border-cyan-300/35 bg-cyan-400/10 px-4 py-1 text-xs font-bold uppercase tracking-[0.16em] text-cyan-100">
            Why Marota
          </p>
          <h2 className="mt-4 text-3xl font-black text-white sm:text-4xl">Built for Learners Who Want Real Results</h2>
          <p className="mt-3 text-sm leading-relaxed text-slate-300 sm:text-base">
            Marota is more than a course catalog. It is a practice-first learning environment focused on skills you can apply immediately.
          </p>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {valueCards.map((card) => {
            const Icon = card.icon;
            return (
              <article
                key={card.title}
                className="rounded-2xl border border-white/15 bg-[#112240]/85 p-5 transition duration-300 hover:-translate-y-1 hover:border-cyan-300/45"
              >
                <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-cyan-300/35 bg-cyan-400/10 text-cyan-100">
                  <Icon size={20} />
                </div>
                <h3 className="mt-4 text-lg font-bold text-white">{card.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-300">{card.description}</p>
              </article>
            );
          })}
        </div>
      </div>
    </section>

    <section className="bg-[#0c1f38] py-16 md:py-20">
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
        <div className="mx-auto max-w-3xl text-center">
          <p className="inline-flex rounded-full border border-yellow-300/35 bg-yellow-300/10 px-4 py-1 text-xs font-bold uppercase tracking-[0.16em] text-yellow-100">
            Learning Journey
          </p>
          <h2 className="mt-4 text-3xl font-black text-white sm:text-4xl">From Enrollment to Career Confidence</h2>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-4">
          {learningJourney.map((step, index) => (
            <article
              key={step.title}
              className="rounded-2xl border border-white/15 bg-[#102744]/85 p-5 text-left"
            >
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-cyan-300/40 bg-cyan-400/10 text-xs font-bold text-cyan-100">
                {index + 1}
              </span>
              <h3 className="mt-3 text-base font-bold text-white">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-300">{step.detail}</p>
            </article>
          ))}
        </div>
      </div>
    </section>

    <section id="services" className="bg-[#091d36] py-16 md:py-20">
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
        <div className="mx-auto max-w-4xl text-center">
          <p className="inline-flex rounded-lg border border-yellow-300/45 bg-[#102744] px-5 py-2 text-sm font-black uppercase tracking-[0.2em] text-yellow-200">
            Marota Tech
          </p>
          <p className="mt-4 text-xs font-bold uppercase tracking-[0.24em] text-cyan-100/90 sm:text-sm">
            Your Vision. Our Craft. Real Results.
          </p>
          <h2 className="mt-4 text-3xl font-black leading-tight text-white sm:text-5xl">
            We Not Just Teach, We Build
          </h2>
          <p className="mx-auto mt-4 max-w-3xl text-sm leading-relaxed text-slate-300 sm:text-base">
            Marota gives practical courses and also builds real digital products.
            We create websites, landing pages, mobile apps, and AI-powered automations for NGOs, organizations, hotels, schools, and businesses.
          </p>
          <div className="mx-auto mt-7 h-px w-full max-w-3xl bg-gradient-to-r from-transparent via-cyan-300/40 to-transparent" />
          <p className="mt-5 text-xs font-bold uppercase tracking-[0.18em] text-slate-300">
            What We Build For Clients
          </p>
        </div>

        <div className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {serviceCards.map((service) => {
            const Icon = service.icon;
            return (
              <article
                key={service.title}
                className="rounded-2xl border border-white/15 bg-[#112240]/85 p-5 text-left transition duration-300 hover:-translate-y-1 hover:border-yellow-300/45"
              >
                <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-cyan-300/35 bg-cyan-400/10 text-cyan-100">
                  <Icon size={20} />
                </div>
                <h3 className="mt-4 text-base font-bold text-white">{service.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-300">{service.description}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {service.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-[11px] text-slate-200"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </article>
            );
          })}
        </div>

        <div className="mt-8 rounded-3xl border border-yellow-300/30 bg-[#111f36] p-6 text-center shadow-[0_16px_40px_rgba(2,8,23,0.3)] sm:p-8">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-yellow-100/90">
            Also Learn From Us
          </p>
          <h3 className="mt-3 text-2xl font-black text-white sm:text-3xl">
            We Not Just Teach, We Build
          </h3>
          <p className="mx-auto mt-3 max-w-3xl text-sm leading-relaxed text-slate-200 sm:text-base">
            Want to learn these skills yourself? Join Marota courses in web development, mobile app development,
            graphics, and video production taught with practical, project-based training.
          </p>
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            {["Web Development", "Mobile App Dev", "Graphic Design", "Video Editing", "Landing Pages"].map((item) => (
              <span
                key={item}
                className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs text-slate-100"
              >
                {item}
              </span>
            ))}
          </div>
        </div>

        <div className="mt-6 rounded-3xl border border-cyan-300/25 bg-gradient-to-r from-[#152f53] via-[#102a4a] to-[#183557] p-6 text-center sm:p-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-300/45 bg-cyan-400/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] text-cyan-100">
            Build With Marota
          </div>
          <p className="mx-auto mt-3 max-w-3xl text-sm leading-relaxed text-slate-200 sm:text-base">
            Need a full website, landing page, mobile app, or AI automation?
            Marota is ready to deliver your product from planning to launch.
          </p>
          <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 rounded-full border border-yellow-300/55 bg-gradient-to-r from-yellow-300/85 via-amber-300/90 to-orange-300/85 px-6 py-3 text-sm font-extrabold uppercase tracking-[0.1em] text-[#0a192f] shadow-[0_10px_25px_rgba(250,204,21,0.26)] transition duration-300 hover:-translate-y-0.5 hover:from-yellow-200 hover:to-orange-200"
            >
              Request a Service
              <ArrowRight size={16} />
            </Link>
            <Link
              to="/portfolio"
              className="inline-flex items-center gap-2 rounded-full border border-cyan-300/45 bg-cyan-400/10 px-6 py-3 text-sm font-semibold uppercase tracking-[0.12em] text-cyan-100 transition hover:-translate-y-0.5 hover:border-cyan-200"
            >
              View Portfolio
            </Link>
          </div>
        </div>
      </div>
    </section>

    <section className="bg-[#0a192f] py-16 md:py-20">
      <div className="mx-auto w-full max-w-4xl px-4 sm:px-6">
        <div className="text-center">
          <p className="inline-flex rounded-full border border-yellow-300/35 bg-yellow-300/10 px-4 py-1 text-xs font-bold uppercase tracking-[0.16em] text-yellow-100">
            FAQ
          </p>
          <h2 className="mt-4 text-3xl font-black text-white sm:text-4xl">Frequently Asked Questions</h2>
        </div>

        <div className="mt-8 space-y-3">
          {faqs.map((item, index) => {
            const isOpen = openFaqIndex === index;
            return (
              <article
                key={item.question}
                className={`overflow-hidden rounded-xl border bg-[#112240]/85 transition-colors ${
                  isOpen ? "border-yellow-300/45" : "border-white/15"
                }`}
              >
                <button
                  type="button"
                  onClick={() => setOpenFaqIndex(isOpen ? -1 : index)}
                  className="btn-icon flex w-full items-center justify-between gap-3 bg-transparent px-4 py-4 text-left"
                >
                  <span className="text-sm font-semibold text-white sm:text-base">{item.question}</span>
                  <ChevronDown
                    size={18}
                    className={`shrink-0 transition-transform ${
                      isOpen ? "rotate-180 text-yellow-200" : "text-slate-300"
                    }`}
                  />
                </button>
                {isOpen && <p className="px-4 pb-4 text-sm leading-relaxed text-slate-300">{item.answer}</p>}
              </article>
            );
          })}
        </div>
      </div>
    </section>

    <section className="bg-[#0b203c] py-16 md:py-20">
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
        <div className="rounded-3xl border border-cyan-300/25 bg-gradient-to-r from-[#122948] via-[#102744] to-[#182840] p-6 text-center sm:p-8">
          <h2 className="text-3xl font-black text-white sm:text-4xl">Ready to Build Your Digital Future?</h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-slate-300 sm:text-base">
            Start your journey with Marota today. Explore programs, choose your track, and begin learning with practical guidance.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Link
              to={user ? "/courses" : "/signup"}
              className="inline-flex items-center gap-2 rounded-full border border-yellow-300/55 bg-gradient-to-r from-yellow-300/85 via-amber-300/90 to-orange-300/85 px-6 py-3 text-sm font-extrabold uppercase tracking-[0.1em] text-[#0a192f] shadow-[0_10px_25px_rgba(250,204,21,0.26)] transition duration-300 hover:-translate-y-0.5 hover:from-yellow-200 hover:to-orange-200"
            >
              Apply Now
              <ArrowRight size={16} />
            </Link>
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 rounded-full border border-cyan-300/45 bg-cyan-400/10 px-6 py-3 text-sm font-semibold uppercase tracking-[0.12em] text-cyan-100 transition hover:-translate-y-0.5 hover:border-cyan-200"
            >
              Contact Team
            </Link>
          </div>
        </div>
      </div>
    </section>

    <Contact />

    <Testimonials />
    </>
  );
}
