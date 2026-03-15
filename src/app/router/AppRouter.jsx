import { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import Layout from "../layout/RootLayout.jsx";
import Hero from "../../features/marketing/pages/HomePage.jsx";
import About from "../../features/marketing/pages/AboutPage.jsx";
import Courses from "../../features/courses/pages/CoursesPage.jsx";
import Instructors from "../../features/marketing/pages/InstructorsPage.jsx";
import Portfolio from "../../features/marketing/pages/PortfolioPage.jsx";
import Gallery from "../../features/marketing/pages/GalleryPage.jsx";
import Contact from "../../features/marketing/pages/ContactPage.jsx";
import ProtectedRoute from "./guards/ProtectedRoute.jsx";
import AdminRoute from "./guards/AdminRoute.jsx";
import LoginPage from "../../features/auth/pages/LoginPage.jsx";
import RegisterPage from "../../features/auth/pages/RegisterPage.jsx";
import Dashboard from "../../features/dashboard/pages/DashboardPage.jsx";
import MyCourses from "../../features/dashboard/pages/MyCoursesPage.jsx";
import Profile from "../../features/dashboard/pages/ProfilePage.jsx";
import AdminDashboard from "../../features/admin/pages/AdminDashboardPage.jsx";
import CourseLearning from "../../features/learning/pages/CourseLearningPage.jsx";
import PrivacyPolicy from "../../features/legal/pages/PrivacyPolicyPage.jsx";
import TermsOfService from "../../features/legal/pages/TermsOfServicePage.jsx";
import Blog from "../../features/blog/pages/BlogPage.jsx";
import BlogPost from "../../features/blog/pages/BlogPostPage.jsx";

function HashScrollHandler() {
  const { hash, pathname } = useLocation();

  useEffect(() => {
    if (!hash) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    const targetId = hash.replace("#", "");
    const timer = window.setTimeout(() => {
      const targetElement = document.getElementById(targetId);
      if (targetElement) {
        targetElement.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 80);

    return () => window.clearTimeout(timer);
  }, [hash, pathname]);

  return null;
}

function App() {
  return (
    <Router>
      <HashScrollHandler />
      <Routes>
        {/* Home route with shared header/footer */}
        <Route
          path="/"
          element={
            <Layout>
              <Hero />
            </Layout>
          }
        />
        <Route
          path="/about"
          element={
            <Layout>
              <About />
            </Layout>
          }
        />
        <Route
          path="/courses"
          element={
            <Layout>
              <Courses />
            </Layout>
          }
        />
        <Route
          path="/portfolio"
          element={
            <Layout>
              <Portfolio />
            </Layout>
          }
        />
        <Route
          path="/gallery"
          element={
            <Layout>
              <Gallery />
            </Layout>
          }
        />
        <Route
          path="/instructors"
          element={
            <Layout>
              <Instructors />
            </Layout>
          }
        />
        <Route
          path="/contact"
          element={
            <Layout>
              <Contact />
            </Layout>
          }
        />
        <Route
          path="/blog"
          element={
            <Layout>
              <Blog />
            </Layout>
          }
        />
        <Route
          path="/blog/:slug"
          element={
            <Layout>
              <BlogPost />
            </Layout>
          }
        />
        <Route path="/services" element={<Navigate to="/courses" replace />} />

        {/* Login/Register standalone pages */}
        <Route
          path="/login"
          element={
            <Layout>
              <LoginPage />
            </Layout>
          }
        />
        <Route
          path="/signup"
          element={
            <Layout>
              <RegisterPage />
            </Layout>
          }
        />
        <Route
          path="/dashboard"
          element={
            <Layout>
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            </Layout>
          }
        />
        <Route
          path="/my-courses"
          element={
            <Layout>
              <ProtectedRoute>
                <MyCourses />
              </ProtectedRoute>
            </Layout>
          }
        />
        <Route
          path="/profile"
          element={
            <Layout>
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            </Layout>
          }
        />
        <Route
          path="/admin"
          element={
            <Layout>
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            </Layout>
          }
        />
        <Route
          path="/learning/:courseKey"
          element={
            <Layout>
              <ProtectedRoute>
                <CourseLearning />
              </ProtectedRoute>
            </Layout>
          }
        />
        <Route
          path="/privacy"
          element={
            <Layout>
              <PrivacyPolicy />
            </Layout>
          }
        />
        <Route
          path="/terms"
          element={
            <Layout>
              <TermsOfService />
            </Layout>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
