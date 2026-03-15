import { useEffect, useMemo, useState } from "react";
import QRCode from "qrcode";
import { supabase } from "../../../shared/lib/supabaseClient";
import { useAuth } from "../../auth/context/AuthProvider";
import { diplomaLevels, shortCourses } from "../../courses/data/courses";
import logoUrl from "../../../assets/logo1.png";
import { Link, Navigate } from "react-router-dom";
import { FaHome, FaLinkedin } from "react-icons/fa";
import {
  isMissingApprovalStatusColumnError,
  withDefaultApprovedStatus,
} from "../../courses/utils/enrollmentApproval";
import {
  buildCourseIdentity,
  normalizeCourseIdentity,
  parseCourseIdentity,
} from "../../courses/utils/courseIdentity";

export default function MyCourses() {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const [enrollments, setEnrollments] = useState([]);
  const [availableCurriculumKeys, setAvailableCurriculumKeys] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [profileName, setProfileName] = useState("");
  const [statusMessage, setStatusMessage] = useState(null);
  const [certificateLogo, setCertificateLogo] = useState("");
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewTitle, setPreviewTitle] = useState("");
  const [previewSvgUrl, setPreviewSvgUrl] = useState("");

  const courseMap = useMemo(() => {
    const diplomaCourses = diplomaLevels.flatMap((level) =>
      level.courses.map((course) => ({
        ...course,
        group: level.level,
        type: "Diploma",
      }))
    );
    const shortCourseResults = shortCourses.map((course) => ({
      ...course,
      group: "Short Course",
      type: "Short",
      identityKey: buildCourseIdentity({ ...course, group: "Short Course", type: "Short" }),
    }));

    const mappedCourses = [...diplomaCourses, ...shortCourseResults].map((course) => ({
      ...course,
      identityKey:
        course.identityKey ||
        buildCourseIdentity({
          ...course,
          level: course.group?.startsWith("Level") ? course.group : undefined,
          group: course.group,
          type: course.type,
        }),
    }));

    return {
      byIdentity: new Map(mappedCourses.map((course) => [course.identityKey, course])),
      byTitle: new Map(mappedCourses.map((course) => [course.title, course])),
    };
  }, []);

  const enrolledCourses = useMemo(
    () =>
      enrollments.map((item) => ({
        ...item,
        parsedCourse: parseCourseIdentity(item.course_title),
        details:
          courseMap.byIdentity.get(normalizeCourseIdentity(item.course_title)) ||
          courseMap.byTitle.get(parseCourseIdentity(item.course_title).title),
      })),
    [enrollments, courseMap]
  );

  const stats = useMemo(() => {
    if (enrolledCourses.length === 0) {
      return { total: 0, completed: 0, average: 0 };
    }
    const total = enrolledCourses.length;
    const completed = enrolledCourses.filter(
      (course) => (course.progress ?? 0) >= 100
    ).length;
    const average = Math.round(
      enrolledCourses.reduce(
        (sum, course) => sum + (course.progress ?? 0),
        0
      ) / total
    );
    return { total, completed, average };
  }, [enrolledCourses]);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      setLoading(true);
      setStatusMessage(null);

      const [enrollmentsWithStatusRes, profileRes] = await Promise.all([
        supabase
          .from("enrollments")
          .select("course_title, progress, approval_status")
          .eq("user_id", user.id)
          .order("created_at", { ascending: true }),
        supabase
          .from("profiles")
          .select("full_name")
          .eq("id", user.id)
          .maybeSingle(),
      ]);

      let enrollmentsRes = enrollmentsWithStatusRes;
      if (isMissingApprovalStatusColumnError(enrollmentsWithStatusRes.error)) {
        const fallbackEnrollmentsRes = await supabase
          .from("enrollments")
          .select("course_title, progress")
          .eq("user_id", user.id)
          .order("created_at", { ascending: true });

        enrollmentsRes = {
          ...fallbackEnrollmentsRes,
          data: withDefaultApprovedStatus(fallbackEnrollmentsRes.data),
        };
      }

      if (enrollmentsRes.error) {
        setStatusMessage({ type: "error", text: enrollmentsRes.error.message });
      } else {
        const rows = enrollmentsRes.data || [];
        setEnrollments(rows);

        const shortCourseKeys = rows
          .map((item) => normalizeCourseIdentity(item.course_title))
          .filter((key) => key.toLowerCase().startsWith("short course::"));

        if (shortCourseKeys.length > 0) {
          const { data: curriculumRows, error: curriculumError } = await supabase
            .from("short_course_modules")
            .select("course_key")
            .in("course_key", shortCourseKeys);

          if (!curriculumError && curriculumRows) {
            setAvailableCurriculumKeys(
              new Set(curriculumRows.map((item) => normalizeCourseIdentity(item.course_key)))
            );
          } else {
            setAvailableCurriculumKeys(new Set());
          }
        } else {
          setAvailableCurriculumKeys(new Set());
        }
      }

      if (!profileRes.error && profileRes.data?.full_name) {
        setProfileName(profileRes.data.full_name);
      } else {
        setProfileName("");
      }

      setLoading(false);
    };

    fetchData();
  }, [user]);

  useEffect(() => {
    const loadLogo = async () => {
      try {
        const response = await fetch(logoUrl);
        const blob = await response.blob();
        const reader = new FileReader();
        reader.onloadend = () => {
          setCertificateLogo(reader.result || "");
        };
        reader.readAsDataURL(blob);
      } catch {
        setCertificateLogo("");
      }
    };

    loadLogo();
  }, []);

  const slugify = (value) =>
    value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");

  const generateCertificateId = (courseTitle) => {
    const normalizedCourse = slugify(courseTitle).toUpperCase();
    const shortUserId = (user?.id || "STUDENT").slice(0, 8).toUpperCase();
    const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    return `MFS-${normalizedCourse}-${shortUserId}-${datePart}`;
  };

  const resolveStudentName = () => {
    const metadataName =
      user?.user_metadata?.full_name ||
      user?.user_metadata?.name ||
      user?.user_metadata?.display_name ||
      "";
    const emailFallbackName = user?.email
      ? user.email
          .split("@")[0]
          .replace(/[._-]+/g, " ")
          .trim()
          .replace(/\b\w/g, (char) => char.toUpperCase())
      : "";

    return (
      profileName?.trim() ||
      metadataName?.trim() ||
      emailFallbackName ||
      "Student"
    );
  };

  const buildCertificateSvg = (
    courseTitle,
    certificateId,
    verificationUrl,
    qrCodeDataUrl,
    studentName
  ) => {
    const issuedDate = new Date().toLocaleDateString();
    const nameLine = studentName || "Student";
    const logoMarkup = certificateLogo
      ? `<image href="${certificateLogo}" x="80" y="70" width="90" height="90" />`
      : "";
    const logoRightMarkup = certificateLogo
      ? `<image href="${certificateLogo}" x="1030" y="70" width="90" height="90" />`
      : "";
    const watermarkMarkup = certificateLogo
      ? `<image href="${certificateLogo}" x="60" y="45" width="1080" height="760" opacity="0.06" preserveAspectRatio="xMidYMid slice" />`
      : "";
    const verificationMarkup = qrCodeDataUrl
      ? `<rect x="872" y="668" width="188" height="108" rx="10" fill="#0f172a" stroke="#334155" stroke-width="1.5" />
  <image href="${qrCodeDataUrl}" x="885" y="681" width="74" height="74" />
  <text x="967" y="704" fill="#e2e8f0" font-family="Arial, sans-serif" font-size="11" font-weight="700">Verify Certificate</text>
  <text x="922" y="767" text-anchor="middle" fill="#22d3ee" font-family="Arial, sans-serif" font-size="10">marota.tech/verify</text>`
      : "";

    return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="850" viewBox="0 0 1200 850">
  <defs>
    <linearGradient id="borderGradient" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#facc15" />
      <stop offset="100%" stop-color="#22d3ee" />
    </linearGradient>
  </defs>
  <rect width="1200" height="850" fill="#0f172a" />
  <rect x="30" y="30" width="1140" height="790" rx="28" fill="#111827" stroke="url(#borderGradient)" stroke-width="8" />
  <rect x="55" y="55" width="1090" height="740" rx="24" fill="#0b1220" stroke="#1f2937" stroke-width="2" />
  ${watermarkMarkup}
  ${logoMarkup}
  ${logoRightMarkup}
  <text x="600" y="120" text-anchor="middle" fill="#facc15" font-family="Georgia, serif" font-size="36" letter-spacing="4">MAROTA</text>
  <text x="600" y="165" text-anchor="middle" fill="#e2e8f0" font-family="Georgia, serif" font-size="18" letter-spacing="2">FILM AND SOFTWARE COLLEGE</text>
  <text x="600" y="250" text-anchor="middle" fill="#94a3b8" font-family="Arial, sans-serif" font-size="20" letter-spacing="2">CERTIFICATE OF COMPLETION</text>
  <text x="600" y="330" text-anchor="middle" fill="#e2e8f0" font-family="Palatino Linotype, Book Antiqua, Palatino, serif" font-size="48" font-style="italic" font-weight="700" letter-spacing="1">${nameLine}</text>
  <rect x="240" y="350" width="720" height="2" fill="#22d3ee" />
  <text x="600" y="400" text-anchor="middle" fill="#94a3b8" font-family="Arial, sans-serif" font-size="18">has successfully completed the course</text>
  <text x="600" y="460" text-anchor="middle" fill="#f8fafc" font-family="Georgia, serif" font-size="30">${courseTitle}</text>
  <text x="600" y="520" text-anchor="middle" fill="#94a3b8" font-family="Arial, sans-serif" font-size="16">Issued on ${issuedDate}</text>
  <text x="300" y="612" text-anchor="middle" fill="#f8fafc" font-family="Brush Script MT, Lucida Handwriting, cursive" font-size="28">Mathewos Ermias</text>
  <text x="900" y="612" text-anchor="middle" fill="#f8fafc" font-family="Brush Script MT, Lucida Handwriting, cursive" font-size="28">Lidiya Yonas</text>
  <text x="260" y="650" fill="#e2e8f0" font-family="Arial, sans-serif" font-size="14">Director</text>
  <text x="860" y="650" fill="#e2e8f0" font-family="Arial, sans-serif" font-size="14">Registrar</text>
  <rect x="220" y="620" width="160" height="2" fill="#94a3b8" />
  <rect x="820" y="620" width="160" height="2" fill="#94a3b8" />
  <circle cx="600" cy="696" r="54" fill="#0f172a" stroke="#facc15" stroke-width="3.5" />
  <circle cx="600" cy="696" r="62" fill="none" stroke="#e2e8f0" stroke-width="1.5" opacity="0.85" />
  <text x="600" y="704" text-anchor="middle" fill="#facc15" font-family="Georgia, serif" font-size="18" letter-spacing="1">CERTIFIED</text>
  ${verificationMarkup}
  <text x="600" y="784" text-anchor="middle" fill="#94a3b8" font-family="Arial, sans-serif" font-size="12">Certificate ID: ${certificateId}</text>
</svg>`;
  };

  const svgToPngDataUrl = (svgContent) =>
    new Promise((resolve, reject) => {
      const svgBlob = new Blob([svgContent], { type: "image/svg+xml;charset=utf-8" });
      const svgUrl = URL.createObjectURL(svgBlob);
      const image = new Image();

      image.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = 1200;
        canvas.height = 850;
        const context = canvas.getContext("2d");

        if (!context) {
          URL.revokeObjectURL(svgUrl);
          reject(new Error("Unable to create certificate canvas."));
          return;
        }

        context.drawImage(image, 0, 0, 1200, 850);
        const pngDataUrl = canvas.toDataURL("image/png");
        URL.revokeObjectURL(svgUrl);
        resolve(pngDataUrl);
      };

      image.onerror = () => {
        URL.revokeObjectURL(svgUrl);
        reject(new Error("Unable to render certificate image."));
      };

      image.src = svgUrl;
    });

  const buildCertificateAsset = async (courseTitle, options = {}) => {
    const { useSampleName = false } = options;
    const certificateId = generateCertificateId(courseTitle);
    const verificationUrl = `https://marota.tech/?certificate_id=${encodeURIComponent(
      certificateId
    )}`;
    const studentName = useSampleName ? "Student Name" : resolveStudentName();

    const qrCodeDataUrl = await QRCode.toDataURL(verificationUrl, {
      margin: 1,
      width: 256,
      color: {
        dark: "#0f172a",
        light: "#ffffff",
      },
    });

    const svgContent = buildCertificateSvg(
      courseTitle,
      certificateId,
      verificationUrl,
      qrCodeDataUrl,
      studentName
    );

    return {
      svgContent,
      verificationUrl,
    };
  };

  const viewCertificate = async (courseTitle, useSampleName = false) => {
    if (!user) return;

    setPreviewOpen(true);
    setPreviewLoading(true);
    setPreviewTitle(courseTitle);
    setPreviewSvgUrl("");
    setStatusMessage(null);

    try {
      const { svgContent } = await buildCertificateAsset(courseTitle, {
        useSampleName,
      });
      const svgUrl = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(
        svgContent
      )}`;
      setPreviewSvgUrl(svgUrl);
    } catch (error) {
      setStatusMessage({
        type: "error",
        text: error.message || "Unable to preview certificate",
      });
      setPreviewOpen(false);
    } finally {
      setPreviewLoading(false);
    }
  };

  const shareCertificateOnLinkedIn = (courseTitle) => {
    const certificateId = generateCertificateId(courseTitle);
    const verificationUrl = `https://marota.tech/?certificate_id=${encodeURIComponent(
      certificateId
    )}`;

    const now = new Date();
    const issueYear = String(now.getFullYear());
    const issueMonth = String(now.getMonth() + 1);

    const linkedInUrl =
      "https://www.linkedin.com/profile/add?startTask=CERTIFICATION_NAME" +
      `&name=${encodeURIComponent(courseTitle)}` +
      `&organizationName=${encodeURIComponent("Marota Film and Software College")}` +
      `&issueYear=${encodeURIComponent(issueYear)}` +
      `&issueMonth=${encodeURIComponent(issueMonth)}` +
      `&certUrl=${encodeURIComponent(verificationUrl)}` +
      `&certId=${encodeURIComponent(certificateId)}`;

    const newTab = window.open(linkedInUrl, "_blank", "noopener,noreferrer");
    if (!newTab) {
      setStatusMessage({
        type: "error",
        text: "Unable to open LinkedIn. Please allow popups and try again.",
      });
    }
  };

  const downloadCertificate = async (courseTitle) => {
    if (!user) return;
    setStatusMessage(null);

    try {
      const { svgContent, verificationUrl } = await buildCertificateAsset(courseTitle);
      const pngDataUrl = await svgToPngDataUrl(svgContent);
      const { jsPDF } = await import("jspdf");

      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "pt",
        format: "a4",
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      pdf.addImage(pngDataUrl, "PNG", 0, 0, pageWidth, pageHeight);

      const scaleX = pageWidth / 1200;
      const scaleY = pageHeight / 850;
      pdf.link(872 * scaleX, 668 * scaleY, 188 * scaleX, 108 * scaleY, {
        url: verificationUrl,
      });

      const pdfBlob = pdf.output("blob");
      const pdfUrl = URL.createObjectURL(pdfBlob);

      const link = document.createElement("a");
      link.href = pdfUrl;
      link.download = `${slugify(courseTitle)}-certificate.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(pdfUrl);
    } catch (error) {
      setStatusMessage({
        type: "error",
        text: error.message || "Unable to generate certificate",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-gray-200">
        Loading your courses...
      </div>
    );
  }

  if (authLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-gray-200">
        Loading your courses...
      </div>
    );
  }

  if (isAdmin) {
    return <Navigate to="/admin" replace />;
  }

  return (
    <section className="max-w-6xl mx-auto px-4 py-10 text-white">
      <div className="flex flex-col gap-3 mb-8">
        <nav className="text-sm text-gray-400">
          <Link to="/" className="hover:text-cyan-300">
            Home
          </Link>
          <span className="px-2">/</span>
          <Link to="/dashboard" className="hover:text-cyan-300">
            Dashboard
          </Link>
          <span className="px-2">/</span>
          <span className="text-gray-200">My Courses</span>
        </nav>
        <h1 className="text-3xl font-bold">My Courses</h1>
        <p className="text-gray-300">
          Track your progress and access certificates once you complete a course.
        </p>
        <div>
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 px-4 py-2 mr-3 rounded-full bg-cyan-500 text-white hover:bg-cyan-400"
          >
            Back to Dashboard
          </Link>
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gray-700 text-gray-100 hover:bg-gray-600"
          >
            <FaHome />
            Back to Home
          </Link>
        </div>
        {statusMessage && (
          <p
            className={`text-sm ${
              statusMessage.type === "error" ? "text-red-400" : "text-green-400"
            }`}
          >
            {statusMessage.text}
          </p>
        )}
      </div>

      <div className="grid md:grid-cols-3 gap-4 mb-8">
        <div className="bg-gray-800 rounded-2xl p-4">
          <p className="text-sm text-gray-400">Enrolled Courses</p>
          <p className="text-3xl font-semibold text-white">{stats.total}</p>
        </div>
        <div className="bg-gray-800 rounded-2xl p-4">
          <p className="text-sm text-gray-400">Completed</p>
          <p className="text-3xl font-semibold text-white">{stats.completed}</p>
        </div>
        <div className="bg-gray-800 rounded-2xl p-4">
          <p className="text-sm text-gray-400">Average Progress</p>
          <p className="text-3xl font-semibold text-white">{stats.average}%</p>
        </div>
      </div>

      {enrolledCourses.length === 0 ? (
        <div className="bg-gray-800 rounded-2xl p-8 text-center text-gray-300">
          You have not enrolled in any courses yet. Visit the dashboard to enroll.
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {enrolledCourses.map((course) => {
            const progress = course.progress ?? 0;
            const ringStyle = {
              background: `conic-gradient(#22d3ee ${progress}%, #1f2937 ${progress}%)`,
            };
            const title = course.details?.title || course.parsedCourse.title || course.course_title;
            const details = course.details;
            const scopeLabel =
              details?.group ||
              course.parsedCourse.scope ||
              "Course";
            const completed = progress >= 100;
            const approvalStatus = course.approval_status || "pending";
            const isApproved = approvalStatus === "approved";
            const isShortCourse =
              (details?.type || "").toLowerCase() === "short" ||
              String(scopeLabel).toLowerCase() === "short course";
            const learningUrl = `/learning/${encodeURIComponent(
              normalizeCourseIdentity(course.course_title)
            )}`;
            const hasCurriculum = availableCurriculumKeys.has(
              normalizeCourseIdentity(course.course_title)
            );

            return (
              <div
                key={course.course_title}
                className="bg-gray-800 rounded-2xl p-6 shadow-lg flex flex-col gap-4"
              >
                <div className="flex items-start sm:items-center gap-4">
                  <div
                    className="w-16 h-16 rounded-full flex items-center justify-center"
                    style={ringStyle}
                  >
                    <div className="w-12 h-12 rounded-full bg-gray-900 flex items-center justify-center text-sm font-semibold">
                      {progress}%
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3">
                      <h2 className="text-lg sm:text-xl font-semibold text-white leading-tight">{title}</h2>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          completed
                            ? "bg-green-600 text-white"
                            : "bg-gray-700 text-gray-200"
                        }`}
                      >
                        {completed ? "Completed" : "In progress"}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400">
                      {scopeLabel} â€¢ {details?.type || ""}
                    </p>
                  </div>
                </div>

                <p className="text-sm text-gray-300">
                  {details?.description || "Course description unavailable."}
                </p>

                <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-cyan-400"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>

                <div className="w-full flex items-center justify-center pb-1">
                  {completed ? (
                    <div className="w-full max-w-3xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                      <button
                        type="button"
                        onClick={() => viewCertificate(title, !completed)}
                        className="w-full px-3 py-2 rounded-full text-xs font-semibold bg-gray-100 text-gray-900 hover:bg-gray-200"
                      >
                        View Certificate
                      </button>
                      <button
                        type="button"
                        onClick={() => downloadCertificate(title)}
                        className="w-full px-3 py-2 rounded-full text-xs font-semibold bg-yellow-400 text-gray-900 hover:bg-yellow-300"
                      >
                        Download Certificate
                      </button>
                      <button
                        type="button"
                        onClick={() => shareCertificateOnLinkedIn(title)}
                        className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 rounded-md text-xs font-semibold bg-[#0A66C2] text-white border border-[#0A66C2] hover:bg-[#004182]"
                      >
                        <FaLinkedin className="text-sm" />
                        Share on LinkedIn
                      </button>
                      {isShortCourse && isApproved &&
                        (hasCurriculum ? (
                          <Link
                            to={learningUrl}
                            className="w-full inline-flex items-center justify-center px-3 py-2 rounded-full text-xs font-semibold bg-cyan-500 text-white hover:bg-cyan-400"
                          >
                            Start Learning
                          </Link>
                        ) : (
                          <span className="w-full inline-flex items-center justify-center px-3 py-2 rounded-full text-xs font-semibold bg-gray-700 text-gray-200">
                            Coming Soon â€¢ Curriculum in progress
                          </span>
                        ))}
                    </div>
                  ) : (
                    <div className="w-full max-w-xl grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => viewCertificate(title, !completed)}
                        className="w-full px-3 py-2 rounded-full text-xs font-semibold bg-gray-100 text-gray-900 hover:bg-gray-200"
                      >
                        View Certificate
                      </button>
                      {isShortCourse && isApproved &&
                        (hasCurriculum ? (
                          <Link
                            to={learningUrl}
                            className="w-full inline-flex items-center justify-center px-3 py-2 rounded-full text-xs font-semibold bg-cyan-500 text-white hover:bg-cyan-400"
                          >
                            Start Learning
                          </Link>
                        ) : (
                          <span className="w-full inline-flex items-center justify-center px-3 py-2 rounded-full text-xs font-semibold bg-gray-700 text-gray-200">
                            Coming Soon â€¢ Curriculum in progress
                          </span>
                        ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {previewOpen && (
        <div className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center p-4">
          <div className="w-full max-w-6xl bg-gray-900 rounded-2xl border border-gray-700 shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3 border-b border-gray-700">
              <h3 className="text-base md:text-lg font-semibold text-white">
                Certificate Preview â€¢ {previewTitle}
              </h3>
              <button
                type="button"
                onClick={() => setPreviewOpen(false)}
                className="btn-modal-close"
                aria-label="Close certificate preview"
              >
                âœ•
              </button>
            </div>
            <div className="p-4 bg-gray-950 max-h-[82vh] overflow-auto">
              {previewLoading ? (
                <div className="min-h-[55vh] flex items-center justify-center text-gray-300">
                  Loading certificate preview...
                </div>
              ) : (
                <img
                  src={previewSvgUrl}
                  alt="Certificate preview"
                  className="w-full h-auto rounded-lg border border-gray-700"
                />
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
