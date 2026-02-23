import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import HomeContent from "./components/HomeContent"; // Hero, About, etc.
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import Dashboard from "./pages/Dashboard";
import MyCourses from "./pages/MyCourses";
import Profile from "./pages/Profile";
import AdminDashboard from "./pages/AdminDashboard";
import CourseLearning from "./pages/CourseLearning";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";

function App() {
  return (
    <Router>
      <Routes>
        {/* Home route with shared header/footer */}
        <Route
          path="/"
          element={
            <Layout>
              <HomeContent />  {/* Hero, About, Services, etc. */}
            </Layout>
          }
        />

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
