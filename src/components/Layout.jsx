import Header from "./Header";
import Footer from "./Footer";
import { SearchProvider } from "../context/SearchContext";
import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { diplomaLevels, shortCourses } from "../data/courses";
import { blogPosts } from "../data/blogPosts";

const SITE_URL = "https://marota.tech";
const DEFAULT_OG_IMAGE = `${SITE_URL}/favicon.png`;

const SEO_BY_ROUTE = {
  "/": {
    title: "Marota Film and Software College | AI Courses, Software Training & Film Education in Ethiopia",
    description:
      "Marota Film and Software College offers AI courses, software development training, and film production education in Ethiopia.",
    indexable: true,
  },
  "/about": {
    title: "About Marota Film and Software College | AI and Software Training in Ethiopia",
    description:
      "Learn about Marota Film and Software College, an Ethiopian institution focused on AI, software training, and film education.",
    indexable: true,
  },
  "/courses": {
    title: "AI Courses, Software Development & Film Production Training | Marota Ethiopia",
    description:
      "Explore AI courses, software development training, and film production programs at Marota Film and Software College in Ethiopia.",
    indexable: true,
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
    title: "Contact Marota Film and Software College | AI, Software & Film Education Ethiopia",
    description:
      "Contact Marota Film and Software College for admissions, AI and software course inquiries, and film training information in Ethiopia.",
    indexable: true,
  },
  "/blog": {
    title: "Marota Blog | Student Stories, Software & Film Insights",
    description:
      "Read Marota blog updates, student stories, AI and software insights, and film education tips from Marota Film and Software College.",
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

const resolveBlogPostByPath = (pathname) => {
  if (!pathname.startsWith("/blog/")) return null;

  const slug = pathname.replace(/^\/blog\//, "").replace(/\/+$/, "");
  if (!slug) return null;

  return blogPosts.find((post) => post.slug === slug) || null;
};

const buildBlogPostSeo = (post) => ({
  title: `${post.title} | Marota Blog`,
  description: post.excerpt,
  indexable: true,
});

const resolveSeoForPath = (pathname) => {
  if (pathname.startsWith("/learning/")) {
    return SEO_BY_ROUTE["/learning"];
  }

  const blogPost = resolveBlogPostByPath(pathname);
  if (blogPost) {
    return buildBlogPostSeo(blogPost);
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

const updateStructuredDataTag = (id, payload) => {
  const existing = document.getElementById(id);

  if (!payload) {
    if (existing) existing.remove();
    return;
  }

  const script = existing || document.createElement("script");
  script.id = id;
  script.setAttribute("type", "application/ld+json");
  script.textContent = JSON.stringify(payload);

  if (!existing) {
    document.head.appendChild(script);
  }
};

const buildCoursesStructuredData = (pageUrl) => {
  const allCourses = [
    ...diplomaLevels.flatMap((level) =>
      level.courses.map((course) => ({
        ...course,
        category: `Diploma - ${level.level}`,
      }))
    ),
    ...shortCourses.map((course) => ({
      ...course,
      category: "Short Course",
    })),
  ];

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        name: "AI Courses, Software Development & Film Production Training | Marota Ethiopia",
        description:
          "Explore AI courses, software development training, and film production programs at Marota Film and Software College in Ethiopia.",
        url: pageUrl,
      },
      {
        "@type": "ItemList",
        name: "Marota Course Catalog",
        itemListOrder: "https://schema.org/ItemListOrderAscending",
        numberOfItems: allCourses.length,
        itemListElement: allCourses.map((course, index) => ({
          "@type": "ListItem",
          position: index + 1,
          item: {
            "@type": "Course",
            name: course.title,
            description: course.description,
            courseMode: "OnSite",
            educationalCredentialAwarded:
              course.category === "Short Course" ? "Certificate" : "Diploma",
            provider: {
              "@type": "EducationalOrganization",
              name: "Marota Film and Software College",
              url: SITE_URL,
            },
          },
        })),
      },
    ],
  };
};

const buildContactStructuredData = (pageUrl) => ({
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "ContactPage",
      name: "Contact Marota Film and Software College",
      description:
        "Contact Marota Film and Software College for admissions, AI and software course inquiries, and film training information in Ethiopia.",
      url: pageUrl,
      mainEntity: {
        "@type": "EducationalOrganization",
        name: "Marota Film and Software College",
        url: SITE_URL,
        telephone: "+251928976393",
        email: "mathsermi50@gmail.com",
        address: {
          "@type": "PostalAddress",
          addressLocality: "Wolaita Sodo",
          addressCountry: "ET",
        },
      },
    },
  ],
});

const buildBlogStructuredData = (pageUrl) => ({
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Blog",
      name: "Marota Blog",
      description:
        "Stories, practical learning tips, and updates from Marota Film and Software College.",
      url: pageUrl,
      publisher: {
        "@type": "EducationalOrganization",
        name: "Marota Film and Software College",
        url: SITE_URL,
      },
      blogPost: blogPosts.map((post) => ({
        "@type": "BlogPosting",
        headline: post.title,
        description: post.excerpt,
        datePublished: post.date,
        author: {
          "@type": "Person",
          name: post.author,
        },
        keywords: post.tags.join(", "),
      })),
    },
  ],
});

const buildBlogPostStructuredData = (pageUrl, post) => ({
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "BlogPosting",
      headline: post.title,
      description: post.excerpt,
      datePublished: post.date,
      dateModified: post.date,
      articleSection: post.category,
      keywords: post.tags.join(", "),
      author: {
        "@type": "Person",
        name: post.author,
      },
      publisher: {
        "@type": "EducationalOrganization",
        name: "Marota Film and Software College",
        url: SITE_URL,
      },
      mainEntityOfPage: pageUrl,
      url: pageUrl,
    },
  ],
});

const resolveRouteStructuredData = (pathname, pageUrl) => {
  const blogPost = resolveBlogPostByPath(pathname);
  if (blogPost) {
    return buildBlogPostStructuredData(pageUrl, blogPost);
  }

  if (pathname === "/courses") {
    return buildCoursesStructuredData(pageUrl);
  }

  if (pathname === "/contact") {
    return buildContactStructuredData(pageUrl);
  }

  if (pathname === "/blog") {
    return buildBlogStructuredData(pageUrl);
  }

  return null;
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
    updateMetaTag("og:image", seo.image || DEFAULT_OG_IMAGE, true);
    updateMetaTag("twitter:card", "summary_large_image");
    updateMetaTag("twitter:title", seo.title);
    updateMetaTag("twitter:description", seo.description);
    updateMetaTag("twitter:image", seo.image || DEFAULT_OG_IMAGE);
    updateCanonicalTag(pageUrl);

    const routeStructuredData = resolveRouteStructuredData(location.pathname, pageUrl);
    updateStructuredDataTag("route-structured-data", routeStructuredData);
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