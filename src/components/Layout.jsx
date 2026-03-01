import Header from "./Header";
import Footer from "./Footer";
import { SearchProvider } from "../context/SearchContext";
import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const SITE_URL = "https://marota.tech";

const SEO_BY_ROUTE = {
  "/": {
    title: "Marota Film and Software College | Learn Software & Film Skills",
    description:
      "Marota Film and Software College offers professional training in software development, film making, graphics design, web development, and digital skills in Ethiopia.",
  },
  "/about": {
    title: "About Marota | Film and Software College",
    description:
      "Learn about Marota's mission, vision, values, and impact in film and software education.",
  },
  "/courses": {
    title: "Courses | Marota Film and Software College",
    description:
      "Explore Marota diploma and short-term courses in film, software, design, and digital skills.",
  },
  "/portfolio": {
    title: "Portfolio | Marota",
    description:
      "View selected student and institutional projects across film production, web, and design.",
  },
  "/gallery": {
    title: "Gallery | Marota",
    description:
      "See moments from Marota classes, events, and campus activities.",
  },
  "/instructors": {
    title: "Instructors | Marota",
    description:
      "Meet Marota instructors and mentors with practical industry experience.",
  },
  "/contact": {
    title: "Contact Marota",
    description:
      "Contact Marota for admissions, location details, and inquiries.",
    indexable: true,
  },
  "/login": {
    title: "Sign In | Marota Film and Software College",
    description:
      "Sign in to your Marota account to manage your courses, profile, certificates, and learning progress.",
    indexable: false,
  },
  "/signup": {
    title: "Create Account | Marota Film and Software College",
    description:
      "Create your Marota account and start learning software, film making, and digital skills with expert instructors.",
    indexable: false,
  },
  "/dashboard": {
    title: "Student Dashboard | Marota",
    description:
      "Track your course applications, approvals, and progress from your Marota student dashboard.",
    indexable: false,
  },
  "/my-courses": {
    title: "My Courses & Certificates | Marota",
    description:
      "View your enrolled courses, completion status, and certificates at Marota Film and Software College.",
    indexable: false,
  },
  "/profile": {
    title: "My Profile | Marota",
    description:
      "Manage your Marota profile information, learning identity, and student details.",
    indexable: false,
  },
  "/admin": {
    title: "Admin Dashboard | Marota",
    description:
      "Manage users, enrollments, and platform activity from the Marota admin dashboard.",
    indexable: false,
  },
  "/learning": {
    title: "Course Learning | Marota",
    description:
      "Access lessons, modules, quizzes, projects, and final tests in your approved Marota courses.",
    indexable: false,
  },
  "/privacy": {
    title: "Privacy Policy | Marota",
    description:
      "Read Marota's privacy policy for data use, security practices, and user rights.",
    indexable: true,
  },
  "/terms": {
    title: "Terms of Service | Marota",
    description:
      "Review Marota's terms of service for platform usage, responsibilities, and policies.",
    indexable: true,
  },
};

const resolveSeoForPath = (pathname) => {
  if (pathname.startsWith("/learning/")) {
    return SEO_BY_ROUTE["/learning"];
  }

  return SEO_BY_ROUTE[pathname] || SEO_BY_ROUTE["/"];
};

const updateMetaTag = (name, content, property = false) => {
  if (!content) return;
  const selector = property ? `meta[property="${name}"]` : `meta[name="${name}"]`;
  let tag = document.querySelector(selector);

  if (!tag) {
    tag = document.createElement("meta");
    if (property) {
      tag.setAttribute("property", name);
    } else {
      tag.setAttribute("name", name);
    }
    document.head.appendChild(tag);
  }

  tag.setAttribute("content", content);
};

const updateCanonicalTag = (href) => {
  let canonical = document.querySelector('link[rel="canonical"]');
  if (!canonical) {
    canonical = document.createElement("link");
    canonical.setAttribute("rel", "canonical");
    document.head.appendChild(canonical);
  }

  canonical.setAttribute("href", href);
};

const Layout = ({ children }) => {
  const location = useLocation();

  useEffect(() => {
    const seo = resolveSeoForPath(location.pathname);
    const normalizedPath = location.pathname === "/" ? "/" : `${location.pathname.replace(/\/+$/, "")}/`;
    const pageUrl = `${SITE_URL}${normalizedPath}`;
    const robotsValue = seo.indexable === false ? "noindex, nofollow" : "index, follow";

    document.title = seo.title;
    updateMetaTag("description", seo.description);
    updateMetaTag("robots", robotsValue);
    updateMetaTag("googlebot", robotsValue);
    updateMetaTag("og:title", seo.title, true);
    updateMetaTag("og:description", seo.description, true);
    updateMetaTag("og:url", pageUrl, true);
    updateMetaTag("twitter:title", seo.title);
    updateMetaTag("twitter:description", seo.description);
    updateCanonicalTag(pageUrl);
  }, [location.pathname]);

  useEffect(() => {
    if (!location.hash) {
      window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    }
  }, [location.pathname, location.hash]);

  return (
    <SearchProvider>
      <Header />
      <main className="pt-24 md:pt-28 overflow-x-clip">
        <div key={location.pathname} className="route-transition">
          {children}
        </div>
      </main>
      <Footer />
    </SearchProvider>
  );
};
export default Layout;