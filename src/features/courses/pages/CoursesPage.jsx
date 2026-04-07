// src/components/Courses.jsx
import { useEffect, useMemo, useState } from "react";
import {
  FaCode,
  FaVideo,
  FaLaptop,
  FaPaintBrush,
  FaPenNib,
  FaDatabase,
  FaNetworkWired,
  FaStar,
  FaCloudUploadAlt,
  FaChevronDown,
  FaChevronUp,
} from "react-icons/fa";
import { useSearch } from "../../../app/providers/SearchProvider";
import { useAuth } from "../../auth/context/AuthProvider";
import { useNavigate } from "react-router-dom";
import Modal from "../../../shared/ui/Modal";
import cbeImage from "../../../assets/cbe.jpeg";
import telebirrImage from "../../../assets/telebirr.jpeg";
import boaImage from "../../../assets/boa.png";
import mpesaImage from "../../../assets/mpesa.png";
import awashImage from "../../../assets/awash.png";
import dashenImage from "../../../assets/dashen.png";
import { diplomaLevels, shortCourses } from "../data/courses";
import { supabase } from "../../../shared/lib/supabaseClient";
import {
  isMissingApprovalStatusColumnError,
  withDefaultApprovedStatus,
} from "../utils/enrollmentApproval";
import {
  buildCourseIdentity,
  normalizeCourseIdentity,
} from "../utils/courseIdentity";

const iconMap = {
  network: <FaNetworkWired className="text-4xl text-[#ff6b6b]" />,
  video: <FaVideo className="text-4xl text-[#ff6b6b]" />,
  database: <FaDatabase className="text-4xl text-[#ff6b6b]" />,
  code: <FaCode className="text-4xl text-[#64ffda]" />,
  laptop: <FaLaptop className="text-4xl text-[#4a90e2]" />,
  paint: <FaPaintBrush className="text-4xl text-[#ff9f1c]" />,
  pen: <FaPenNib className="text-4xl text-[#f72585]" />,
};

const MAROTA_PAYMENT_ACCOUNTS = {
  cbe: {
    label: "CBE",
    accountName: "Marota Film and Software College",
    accountNumber: "REPLACE_WITH_MAROTA_CBE_ACCOUNT",
    image: cbeImage,
    instruction:
      "Use this CBE account to complete your enrollment payment. After completing your payment, upload the receipt below for admin verification.",
  },
  boa: {
    label: "BOA",
    accountName: "Marota Film and Software College",
    accountNumber: "REPLACE_WITH_MAROTA_BOA_ACCOUNT",
    image: boaImage,
    instruction:
      "Use this BOA account to complete your enrollment payment. After completing your payment, upload the receipt below for admin verification.",
  },
  awash: {
    label: "Awash Bank",
    accountName: "Marota Film and Software College",
    accountNumber: "REPLACE_WITH_MAROTA_AWASH_ACCOUNT",
    image: awashImage,
    instruction:
      "Use this Awash Bank account to complete your enrollment payment. After completing your payment, upload the receipt below for admin verification.",
  },
  dashen: {
    label: "Dashen Bank",
    accountName: "Marota Film and Software College",
    accountNumber: "REPLACE_WITH_MAROTA_DASHEN_ACCOUNT",
    image: dashenImage,
    instruction:
      "Use this Dashen Bank account to complete your enrollment payment. After completing your payment, upload the receipt below for admin verification.",
  },
  telebirr: {
    label: "Telebirr",
    accountName: "Marota Film and Software College",
    accountNumber: "REPLACE_WITH_MAROTA_TELEBIRR_NUMBER",
    image: telebirrImage,
    instruction:
      "Use this Telebirr number to complete your enrollment payment. After completing your payment, upload the receipt below for admin verification.",
  },
  mpesa: {
    label: "M-Pesa",
    accountName: "Marota Film and Software College",
    accountNumber: "REPLACE_WITH_MAROTA_MPESA_NUMBER",
    image: mpesaImage,
    instruction:
      "Use this M-Pesa number to complete your enrollment payment. After completing your payment, upload the receipt below for admin verification.",
  },
};

const COURSE_IMAGE_URLS = {
  "videography and photography":
    "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&w=1400&q=80",
  "video and photo editing":
    "https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=1400&q=80",
  "graphics design":
    "https://images.unsplash.com/photo-1545239351-1141bd82e8a6?auto=format&fit=crop&w=1400&q=80",
  "digital marketing":
    "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1400&q=80",
  "basic computer skills":
    "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1400&q=80",
  "hardware and software maintenance and network service":
    "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1400&q=80",
  "ai and machine learning":
    "https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=1400&q=80",
  "programming languages":
    "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=1400&q=80",
  "website design and development":
    "https://images.unsplash.com/photo-1467232004584-a241de8bcf5d?auto=format&fit=crop&w=1400&q=80",
  "hardware and network servicing":
    "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=1400&q=80",
  "videography and photography level 1":
    "https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=1400&q=80",
  "web development and database administration":
    "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1400&q=80",
};

const getCourseImage = (course) => {
  const title = String(course.title || "").toLowerCase();

  if (COURSE_IMAGE_URLS[title]) {
    return COURSE_IMAGE_URLS[title];
  }

  if (title.includes("videography") || title.includes("photography")) {
    return "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&w=1400&q=80";
  }

  if (title.includes("video and photo editing")) {
    return "https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=1400&q=80";
  }

  if (title.includes("digital marketing") || title.includes("marketing")) {
    return "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1400&q=80";
  }

  if (title.includes("graphic")) {
    return "https://images.unsplash.com/photo-1545239351-1141bd82e8a6?auto=format&fit=crop&w=1400&q=80";
  }

  if (title.includes("basic computer")) {
    return "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1400&q=80";
  }

  if (title.includes("hardware") || title.includes("network")) {
    return "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1400&q=80";
  }

  if (title.includes("ai") || title.includes("machine learning")) {
    return "https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=1400&q=80";
  }

  if (title.includes("programming") || title.includes("website") || title.includes("web")) {
    return "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=1400&q=80";
  }

  if (course.iconName === "video") return "https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=1400&q=80";
  if (course.iconName === "paint" || course.iconName === "pen") return "https://images.unsplash.com/photo-1545239351-1141bd82e8a6?auto=format&fit=crop&w=1400&q=80";
  if (course.iconName === "code" || course.iconName === "database") return "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1400&q=80";
  if (course.iconName === "network" || course.iconName === "laptop") return "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1400&q=80";

  return "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1400&q=80";
};

const CourseCard = ({
  course,
  aggregateRating,
  userRating,
  onRate,
  enrollmentStatus,
  onEnroll,
  isAdminView,
  curriculumStatus,
}) => {
  const [showDetails, setShowDetails] = useState(false);
  const courseImage = getCourseImage(course);
  const courseTitleLower = String(course.title || "").toLowerCase();
  const hideDetailsForCourse =
    courseTitleLower.includes("videography") && courseTitleLower.includes("photography");
  const visibleRating = userRating || Math.round(aggregateRating?.average || 0);
  const previewTools = (course.tools || []).slice(0, 4);
  const isApproved = enrollmentStatus === "approved";
  const isPending = enrollmentStatus === "pending";
  const isRejected = enrollmentStatus === "rejected";

  return (
    <article className="group h-full bg-[#112240]/90 rounded-2xl p-5 md:p-6 border border-[#1f3b5b] shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:border-[var(--accent-blue)]">
      <div className="relative mb-4 rounded-xl overflow-hidden border border-[#1f3b5b]">
        <img
          src={courseImage}
          alt={`${course.title} course`}
          className="w-full h-40 object-cover object-center transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#020817]/90 via-[#020817]/35 to-transparent" />
      </div>

      <div className="flex flex-col items-center justify-center gap-3 text-center">
        <div className="w-14 h-14 rounded-2xl bg-[#0a192f] border border-[#1f3b5b] flex items-center justify-center shrink-0">
          {iconMap[course.iconName] || <FaCode className="text-3xl text-[var(--accent-blue)]" />}
        </div>
        <div className="flex flex-wrap gap-2 justify-center">
          <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[#0a192f] text-[var(--accent-blue)] border border-cyan-800/60">
            {course.tools?.length || 0} Skills
          </span>
          <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[#0a192f] text-gray-300 border border-gray-700">
            Course
          </span>
          {course.type === "Short" && curriculumStatus && (
            <span
              className={`px-2.5 py-1 rounded-full text-[11px] font-semibold border ${
                curriculumStatus === "ready"
                  ? "bg-cyan-500/20 text-cyan-200 border-cyan-500/60"
                  : "bg-gray-700 text-gray-200 border-gray-600"
              }`}
            >
              {curriculumStatus === "ready"
                ? "Curriculum Ready"
                : "Coming Soon â€¢ Curriculum in progress"}
            </span>
          )}
        </div>
      </div>

      <h4 className="text-lg sm:text-xl md:text-2xl font-semibold mt-5 text-white text-center">{course.title}</h4>
      <p className="text-gray-300 mt-3 leading-relaxed text-sm text-center">{course.description}</p>

      {!hideDetailsForCourse && (
        <div className="mt-4 flex flex-wrap gap-2 justify-center">
          {previewTools.map((tool) => (
            <span
              key={`${course.title}-${tool}`}
              className="px-2.5 py-1 rounded-md text-xs bg-[#0a192f] text-gray-300 border border-gray-700"
            >
              {tool}
            </span>
          ))}
          {(course.tools?.length || 0) > 4 && (
            <span className="px-2.5 py-1 rounded-md text-xs bg-[#0a192f] text-[var(--accent-blue)] border border-cyan-800/60">
              +{(course.tools?.length || 0) - 4} more
            </span>
          )}
        </div>
      )}

      <div className="mt-5 p-3 rounded-xl bg-[#0a192f] border border-[#1f3b5b]">
        <div className="flex items-center justify-center gap-1">
          {[1, 2, 3, 4, 5].map((star) => {
            const StarWrapper = isAdminView ? "div" : "button";
            return (
              <StarWrapper
                key={`${course.title}-avg-star-${star}`}
                type={isAdminView ? undefined : "button"}
                onClick={isAdminView ? undefined : () => onRate(course, star)}
                className="text-lg"
                aria-label={isAdminView ? undefined : `Rate ${course.title} ${star} stars`}
              >
                <FaStar
                  className={star <= visibleRating ? "text-yellow-400" : "text-gray-600"}
                />
              </StarWrapper>
            );
          })}
        </div>
        <div className="mt-2 flex flex-wrap items-center justify-center gap-3 text-xs text-center">
          <span className="text-gray-400">
            {aggregateRating
              ? `Average ${aggregateRating.average} â€¢ ${aggregateRating.count} reviews`
              : "No ratings yet"}
          </span>
          {!isAdminView && userRating > 0 && (
            <span className="text-[var(--accent-blue)] font-semibold">Your rating: {userRating}/5</span>
          )}
        </div>
      </div>

      {(!showDetails || !isAdminView) && (
        <div className="mt-5 flex items-center justify-center gap-3 flex-wrap">
          {!showDetails && !hideDetailsForCourse && (
            <button
              type="button"
              onClick={() => setShowDetails(true)}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-md text-sm font-semibold"
            >
              <FaChevronDown className="text-xs" aria-hidden="true" />
              View course details
            </button>
          )}
          {!isAdminView && (
            <button
              type="button"
              onClick={() => onEnroll(course)}
              disabled={isApproved}
              className={`w-full sm:w-auto px-4 py-2.5 rounded-md text-sm font-semibold ${
                isApproved
                  ? "opacity-60 cursor-not-allowed"
                  : isPending
                  ? "bg-amber-500 text-gray-900"
                  : isRejected
                  ? "bg-red-500 text-white"
                  : ""
              }`}
            >
              {isApproved
                ? "Already enrolled"
                : isPending
                ? "Pending Approval"
                : isRejected
                ? "Rejected"
                : "Enroll Now"}
            </button>
          )}
        </div>
      )}

      {!isAdminView && <div className="mt-3 text-center">
        {enrollmentStatus && (
          <p
            className={`text-xs font-semibold mb-2 ${
              isApproved
                ? "text-green-300"
                : isPending
                ? "text-amber-300"
                : "text-red-300"
            }`}
          >
            {isApproved
              ? "Already enrolled"
              : isPending
              ? "Enrollment pending approval"
              : "Enrollment rejected"}
          </p>
        )}
      </div>}

      {showDetails && !hideDetailsForCourse && (
        <div className="mt-4 rounded-xl border border-[#1f3b5b] bg-[#0a192f] p-4">
          <p className="text-sm font-semibold text-[var(--accent-blue)] mb-3 text-center">What you will learn</p>
          <div className="grid sm:grid-cols-2 gap-2">
            {course.tools.map((tool, index) => (
              <div
                key={index}
                className="flex items-start gap-3 rounded-lg bg-[#112240]/70 border border-[#1f3b5b] p-3"
              >
                <span className="shrink-0 w-6 h-6 rounded-full bg-[#10213f] border border-cyan-800/70 text-[10px] font-bold text-[var(--accent-blue)] flex items-center justify-center">
                  {index + 1}
                </span>
                <span className="text-gray-300 text-sm leading-relaxed">{tool}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 flex justify-center">
            <button
              type="button"
              onClick={() => setShowDetails(false)}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-md text-sm font-semibold"
            >
              <FaChevronUp className="text-xs" aria-hidden="true" />
              Hide course details
            </button>
          </div>
        </div>
      )}
    </article>
  );
};

const CourseCards = ({
  courses,
  averageRatingMap,
  userRatingMap,
  onRate,
  onEnroll,
  enrollmentStatusMap,
  isAdminView,
  curriculumStatusMap,
}) => (
  <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5 md:gap-6 lg:gap-8">
    {courses.map((course, index) => (
      <CourseCard
        key={course.identityKey || `${course.title}-${index}`}
        course={course}
        aggregateRating={averageRatingMap.get(course.identityKey)}
        userRating={userRatingMap.get(course.identityKey) || 0}
        onRate={onRate}
        enrollmentStatus={enrollmentStatusMap.get(course.identityKey) || null}
        onEnroll={onEnroll}
        isAdminView={isAdminView}
        curriculumStatus={curriculumStatusMap?.get(course.identityKey) || null}
      />
    ))}
  </div>
);

const Courses = () => {
  const { searchQuery } = useSearch();
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [allRatings, setAllRatings] = useState([]);
  const [userRatings, setUserRatings] = useState([]);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [statusMessage, setStatusMessage] = useState(null);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [pendingEnrollmentCourse, setPendingEnrollmentCourse] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("cbe");
  const [payerName, setPayerName] = useState("");
  const [paymentReference, setPaymentReference] = useState("");
  const [receiptFile, setReceiptFile] = useState(null);
  const [paymentFormError, setPaymentFormError] = useState("");
  const [submittingPayment, setSubmittingPayment] = useState(false);
  const normalizedQuery = searchQuery.trim().toLowerCase();

  const isMissingCourseRatingsTableError = (error) => {
    if (!error) return false;
    const normalizedMessage = String(error.message || "").toLowerCase();
    return (
      error.code === "PGRST205" ||
      (normalizedMessage.includes("could not find the table") &&
        normalizedMessage.includes("course_ratings"))
    );
  };

  const userRatingMap = useMemo(
    () =>
      new Map(
        userRatings.map((item) => [normalizeCourseIdentity(item.course_title), item.rating ?? 0])
      ),
    [userRatings]
  );

  const enrolledCourseSet = useMemo(
    () =>
      new Set(
        enrolledCourses
          .filter((item) => (item.approval_status || "approved") === "approved")
          .map((item) => normalizeCourseIdentity(item.course_title))
      ),
    [enrolledCourses]
  );

  const enrollmentStatusMap = useMemo(
    () =>
      new Map(
        enrolledCourses.map((item) => [
          normalizeCourseIdentity(item.course_title),
          item.approval_status || "approved",
        ])
      ),
    [enrolledCourses]
  );

  const averageRatingMap = useMemo(() => {
    const grouped = allRatings.reduce((accumulator, item) => {
      const key = normalizeCourseIdentity(item.course_title);
      if (!accumulator[key]) {
        accumulator[key] = { total: 0, count: 0 };
      }
      accumulator[key].total += item.rating ?? 0;
      accumulator[key].count += 1;
      return accumulator;
    }, {});

    return new Map(
      Object.entries(grouped).map(([courseTitle, value]) => [
        courseTitle,
        {
          average: Number((value.total / value.count).toFixed(1)),
          count: value.count,
        },
      ])
    );
  }, [allRatings]);

  useEffect(() => {
    const fetchRatings = async () => {
      const { data, error } = await supabase
        .from("course_ratings")
        .select("user_id, course_title, rating");

      if (!error) {
        setAllRatings(data || []);
      }

      if (!user) {
        setUserRatings([]);
        setEnrolledCourses([]);
        return;
      }

      const [userRatingsRes, enrollmentsWithStatusRes] = await Promise.all([
        supabase
          .from("course_ratings")
          .select("course_title, rating")
          .eq("user_id", user.id),
        supabase
          .from("enrollments")
          .select("course_title, approval_status")
          .eq("user_id", user.id),
      ]);

      let enrollmentsRes = enrollmentsWithStatusRes;
      if (isMissingApprovalStatusColumnError(enrollmentsWithStatusRes.error)) {
        const fallbackEnrollmentsRes = await supabase
          .from("enrollments")
          .select("course_title")
          .eq("user_id", user.id);

        enrollmentsRes = {
          ...fallbackEnrollmentsRes,
          data: withDefaultApprovedStatus(fallbackEnrollmentsRes.data),
        };
      }

      if (!userRatingsRes.error) {
        setUserRatings(userRatingsRes.data || []);
      }

      if (!enrollmentsRes.error) {
        setEnrolledCourses(enrollmentsRes.data || []);
      }
    };

    fetchRatings();
  }, [user]);

  const handleRateCourse = async (course, rating) => {
    const normalizedCourseTitle = normalizeCourseIdentity(
      buildCourseIdentity(course)
    );

    if (!user) {
      window.alert("Please sign in to rate this course.");
      return;
    }

    if (isAdmin) {
      window.alert("Admins cannot rate courses from this view.");
      return;
    }

    if (!enrolledCourseSet.has(normalizedCourseTitle)) {
      const enrollmentStatus = enrollmentStatusMap.get(normalizedCourseTitle);
      if (enrollmentStatus === "pending") {
        window.alert("Your enrollment application is pending admin approval.");
        return;
      }
      if (enrollmentStatus === "rejected") {
        window.alert("Your enrollment application was rejected. Contact admin for help.");
        return;
      }
      window.alert("Only enrolled users can rate this course.");
      return;
    }

    const { error } = await supabase.from("course_ratings").upsert(
      [{ user_id: user.id, course_title: normalizedCourseTitle, rating }],
      { onConflict: "user_id,course_title" }
    );

    if (error) {
      if (isMissingCourseRatingsTableError(error)) {
        window.alert("Rating is temporarily unavailable right now.");
        return;
      }
      window.alert(error.message || "Unable to save rating right now.");
      return;
    }

    setUserRatings((prev) => {
      const withoutCourse = prev.filter(
        (item) => normalizeCourseIdentity(item.course_title) !== normalizedCourseTitle
      );
      return [...withoutCourse, { course_title: normalizedCourseTitle, rating }];
    });

    setAllRatings((prev) => {
      const withoutOwn = prev.filter(
        (item) =>
          !(
            item.user_id === user.id &&
            normalizeCourseIdentity(item.course_title) === normalizedCourseTitle
          )
      );
      return [
        ...withoutOwn,
        { user_id: user.id, course_title: normalizedCourseTitle, rating },
      ];
    });
  };

  const handleEnrollCourse = async (course) => {
    if (!user) {
      navigate("/signup");
      return;
    }

    if (isAdmin) {
      window.alert("Admins cannot enroll in courses from this view.");
      return;
    }

    setStatusMessage(null);
    const normalizedCourseTitle = normalizeCourseIdentity(
      buildCourseIdentity(course)
    );
    const enrollmentStatus = enrollmentStatusMap.get(normalizedCourseTitle);

    if (enrollmentStatus === "pending") {
      window.alert("Your enrollment application is pending admin approval.");
      return;
    }

    if (enrollmentStatus === "rejected") {
      window.alert("Your enrollment was rejected. Please contact admin for support.");
      return;
    }

    if (enrollmentStatus === "approved") {
      window.alert("You are already enrolled in this course.");
      return;
    }

    setPendingEnrollmentCourse(course);
    setPaymentMethod("cbe");
    setPayerName("");
    setPaymentReference("");
    setReceiptFile(null);
    setPaymentFormError("");
    setPaymentModalOpen(true);
  };

  const handleSubmitPaymentAndEnrollment = async () => {
    if (!pendingEnrollmentCourse || !user) return;

    if (!payerName.trim()) {
      setPaymentFormError("Please enter the payer full name.");
      return;
    }

    if (!receiptFile) {
      setPaymentFormError("Please upload your payment receipt.");
      return;
    }

    const maxFileSizeBytes = 5 * 1024 * 1024;
    if (receiptFile.size > maxFileSizeBytes) {
      setPaymentFormError("Receipt file is too large. Maximum allowed size is 5MB.");
      return;
    }

    setSubmittingPayment(true);
    setPaymentFormError("");
    setStatusMessage(null);

    const normalizedCourseTitle = normalizeCourseIdentity(
      buildCourseIdentity(pendingEnrollmentCourse)
    );

    const safeFileName = receiptFile.name.replace(/[^a-zA-Z0-9.-]/g, "_");
    const receiptPath = `${user.id}/${Date.now()}-${normalizedCourseTitle
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")}-${safeFileName}`;

    const { error: uploadError } = await supabase.storage
      .from("enrollment-receipts")
      .upload(receiptPath, receiptFile, { upsert: false, cacheControl: "3600" });

    if (uploadError) {
      setSubmittingPayment(false);
      setPaymentFormError(uploadError.message || "Unable to upload receipt.");
      return;
    }

    const selectedAccount = MAROTA_PAYMENT_ACCOUNTS[paymentMethod];
    const primaryInsertRes = await supabase
      .from("enrollments")
      .insert([
        {
          user_id: user.id,
          course_title: normalizedCourseTitle,
          progress: 0,
          approval_status: "pending",
          payment_method: paymentMethod,
          payment_account_number: selectedAccount.accountNumber,
          payment_sender_name: payerName.trim(),
          payment_reference: paymentReference.trim() || null,
          receipt_path: receiptPath,
          payment_uploaded_at: new Date().toISOString(),
        },
      ]);

    if (primaryInsertRes.error) {
      await supabase.storage.from("enrollment-receipts").remove([receiptPath]);
      const insertError = primaryInsertRes.error;
      if (isMissingApprovalStatusColumnError(insertError)) {
        setStatusMessage({
          type: "error",
          text:
            "Enrollment payment workflow requires the latest database migration. Please contact admin.",
        });
      } else {
        setStatusMessage({ type: "error", text: insertError.message });
      }
      setSubmittingPayment(false);
      return;
    }

    setEnrolledCourses((prev) => [
      ...prev,
      {
        course_title: normalizedCourseTitle,
        approval_status: "pending",
      },
    ]);

    setStatusMessage({
      type: "success",
      text:
        "Payment submitted and receipt uploaded. Your enrollment is pending admin payment verification.",
    });

    setSubmittingPayment(false);
    setPaymentModalOpen(false);
    setPendingEnrollmentCourse(null);
  };

  const matchesQuery = (course) => {
    if (!normalizedQuery) return true;
    const haystack = [course.title, course.description, ...(course.tools || [])]
      .join(" ")
      .toLowerCase();
    return haystack.includes(normalizedQuery);
  };

  const filteredDiplomaLevels = diplomaLevels
    .map((level) => ({
      ...level,
      courses: level.courses
        .filter(matchesQuery)
        .map((course) => ({
          ...course,
          level: level.level,
          identityKey: buildCourseIdentity({ ...course, level: level.level }),
        })),
    }))
    .filter((level) => level.courses.length > 0);

  const filteredShortCourses = shortCourses
    .filter(matchesQuery)
    .map((course) => ({
      ...course,
      group: "Short Course",
      type: "Short",
      identityKey: buildCourseIdentity({ ...course, group: "Short Course", type: "Short" }),
    }));

  const shortCourseCurriculumStatusMap = useMemo(() => {
    const readyKeys = new Set(["Short Course::Basic Computer Skills"]);
    return new Map(
      filteredShortCourses.map((course) => [
        course.identityKey,
        readyKeys.has(course.identityKey) ? "ready" : "coming-soon",
      ])
    );
  }, [filteredShortCourses]);

  const hasResults =
    filteredDiplomaLevels.length > 0 || filteredShortCourses.length > 0;

  return (
    <section id="courses" className="py-24 bg-[#0a192f] text-white relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none opacity-30 bg-[radial-gradient(circle_at_top,_rgba(100,255,218,0.15),_transparent_55%)]" />
      <div className="container relative mx-auto px-6 lg:px-12">
        <div className="text-center mb-14">
          <p className="inline-flex px-4 py-1 rounded-full text-xs tracking-widest uppercase font-semibold bg-[#112240] text-[var(--accent-blue)] border border-cyan-800/60 mb-4">
            Programs
          </p>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">Our Courses</h2>
          <p className="text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Explore our Diploma level programs (divided into four levels) and
            short courses designed to help you grow, learn, and achieve your
            goals.
          </p>
          {statusMessage && (
            <div
              className={`mt-4 inline-flex flex-wrap items-center justify-center gap-3 rounded-xl border px-4 py-3 text-sm font-medium ${
                statusMessage.type === "error"
                  ? "border-red-500/40 bg-red-500/10 text-red-300"
                  : "border-green-500/40 bg-green-500/10 text-green-300"
              }`}
            >
              <span>{statusMessage.text}</span>
            </div>
          )}
        </div>

        {!hasResults && (
          <div className="text-center text-gray-300 mb-12 rounded-xl border border-gray-700 bg-[#112240]/60 p-5 max-w-2xl mx-auto">
            No courses match "{searchQuery}". Try a different keyword.
          </div>
        )}

        <span id="on-campus-courses" className="block scroll-mt-32" aria-hidden="true" />
        <h3
          id="diploma-courses"
          className="scroll-mt-32 text-3xl md:text-4xl font-bold mb-8 text-center !text-[var(--accent-blue)]"
        >
          Diploma Level Courses
        </h3>
        {filteredDiplomaLevels.map((level, idx) => (
          <div key={idx} className="mb-16">
            <div className="flex justify-center mb-6">
              <h4 className="text-lg md:text-xl font-semibold px-4 py-2 rounded-full bg-[#112240] border border-cyan-900/60 text-[var(--accent-blue)]">
                {level.level}
              </h4>
            </div>
            <div className="rounded-2xl bg-[#0f203b]/50 border border-[#1f3b5b] p-4 md:p-6">
              <CourseCards
                courses={level.courses}
                averageRatingMap={averageRatingMap}
                userRatingMap={userRatingMap}
                onRate={handleRateCourse}
                onEnroll={handleEnrollCourse}
                enrollmentStatusMap={enrollmentStatusMap}
                isAdminView={isAdmin}
                curriculumStatusMap={new Map()}
              />
            </div>
          </div>
        ))}

        <span id="online-certification-courses" className="block scroll-mt-32" aria-hidden="true" />
        <h3
          id="short-term-courses"
          className="scroll-mt-32 text-3xl md:text-4xl font-bold mb-8 text-center !text-[var(--accent-blue)]"
        >
          Short Term Courses(3-6 Months)
        </h3>
        <div className="rounded-2xl bg-[#0f203b]/50 border border-[#1f3b5b] p-4 md:p-6">
          <CourseCards
            courses={filteredShortCourses}
            averageRatingMap={averageRatingMap}
            userRatingMap={userRatingMap}
            onRate={handleRateCourse}
            onEnroll={handleEnrollCourse}
            enrollmentStatusMap={enrollmentStatusMap}
            isAdminView={isAdmin}
            curriculumStatusMap={shortCourseCurriculumStatusMap}
          />
        </div>
      </div>

      {paymentModalOpen && pendingEnrollmentCourse && (
        <Modal
          onClose={() => {
            if (submittingPayment) return;
            setPaymentModalOpen(false);
          }}
        >
          <h3 className="text-xl font-bold text-white">Enroll & Payment Verification</h3>
          <p className="mt-2 text-sm text-slate-300">
            Course: <span className="font-semibold text-cyan-200">{pendingEnrollmentCourse.title}</span>
          </p>
          <p className="mt-1 text-xs text-slate-400">
            Complete payment, upload your receipt, and wait for admin approval.
          </p>

          <div className="mt-3 rounded-xl border border-amber-300/40 bg-amber-300/10 p-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-amber-200">Important</p>
            <ul className="mt-1 list-disc space-y-1 pl-4 text-xs text-slate-200">
              <li>Select a payment provider below and send payment to Marota account.</li>
              <li>Take a screenshot or download your receipt, then upload it below.</li>
              <li>After payment, upload a clear receipt image or PDF.</li>
              <li>Your enrollment stays pending until admin verifies your payment.</li>
            </ul>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-3">
            {Object.entries(MAROTA_PAYMENT_ACCOUNTS).map(([key, account]) => (
              <button
                key={key}
                type="button"
                onClick={() => setPaymentMethod(key)}
                className={`group relative overflow-hidden rounded-2xl border text-left transition duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/80 focus-visible:ring-offset-2 focus-visible:ring-offset-[#111827] ${
                  paymentMethod === key
                    ? "border-[var(--accent-blue)] bg-neutral-900/95 shadow-[0_12px_28px_rgba(100,255,218,0.2)]"
                    : "border-white/25 bg-neutral-900/90 hover:-translate-y-0.5 hover:border-white/45 hover:shadow-[0_12px_24px_rgba(2,6,23,0.35)]"
                }`}
                aria-pressed={paymentMethod === key}
              >
                <img
                  src={account.image}
                  alt={`${account.label} payment option`}
                  className="h-20 w-full object-contain bg-white p-2 transition duration-500 group-hover:scale-105"
                />
                <div className="bg-neutral-900 p-3">
                  <p className="text-xs font-semibold text-slate-200">Pay with {account.label}.</p>
                </div>
                {paymentMethod === key && (
                  <span className="absolute left-2 top-2 rounded-full bg-[var(--accent-blue)] px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[#0a192f] shadow-lg">
                    Selected
                  </span>
                )}
              </button>
            ))}
          </div>

          {MAROTA_PAYMENT_ACCOUNTS[paymentMethod] && (
            <div className="mt-4 rounded-xl border border-yellow-300/35 bg-yellow-300/10 p-4">
              <p className="text-sm font-semibold text-white">
                {MAROTA_PAYMENT_ACCOUNTS[paymentMethod].label}
              </p>
              <p className="mt-1 text-xs text-slate-200">
                Account Name: {MAROTA_PAYMENT_ACCOUNTS[paymentMethod].accountName}
              </p>
              <p className="text-xs font-semibold text-yellow-200">
                Account Number: {MAROTA_PAYMENT_ACCOUNTS[paymentMethod].accountNumber}
              </p>
              <p className="mt-2 text-xs text-slate-300">
                {MAROTA_PAYMENT_ACCOUNTS[paymentMethod].instruction}
              </p>
            </div>
          )}

          <div className="mt-4 space-y-3">
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-300">
                Payer Full Name
              </label>
              <input
                type="text"
                value={payerName}
                onChange={(event) => setPayerName(event.target.value)}
                placeholder="Enter full name used during payment"
                className="w-full rounded-lg border border-slate-600 bg-[#0a192f] px-3 py-2 text-sm text-white outline-none transition focus:border-cyan-300"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-300">
                Transaction Reference (Optional)
              </label>
              <input
                type="text"
                value={paymentReference}
                onChange={(event) => setPaymentReference(event.target.value)}
                placeholder="Reference / transaction ID"
                className="w-full rounded-lg border border-slate-600 bg-[#0a192f] px-3 py-2 text-sm text-white outline-none transition focus:border-cyan-300"
              />
            </div>

            <div>
              <label className="mb-1 flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-slate-300">
                <FaCloudUploadAlt className="text-sm text-slate-200" />
                Upload Receipt
              </label>
              <input
                type="file"
                accept="image/*,.pdf"
                onChange={(event) => setReceiptFile(event.target.files?.[0] || null)}
                className="w-full rounded-lg border border-slate-600 bg-[#0a192f] px-3 py-2 text-sm text-white file:mr-3 file:rounded-md file:border-0 file:bg-cyan-500/20 file:px-3 file:py-1 file:text-cyan-100"
              />
              <p className="mt-1 text-[11px] text-slate-400">Accepted: image or PDF (max 5MB).</p>
            </div>
          </div>

          {paymentFormError && (
            <p className="mt-3 rounded-lg border border-red-400/40 bg-red-500/10 px-3 py-2 text-xs text-red-300">
              {paymentFormError}
            </p>
          )}

          <div className="mt-5 flex flex-wrap justify-end gap-2">
            <button
              type="button"
              onClick={() => setPaymentModalOpen(false)}
              disabled={submittingPayment}
              className="rounded-lg border border-slate-500 px-4 py-2 text-sm text-slate-200 transition hover:border-slate-300 disabled:opacity-60"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmitPaymentAndEnrollment}
              disabled={submittingPayment}
              className="rounded-lg border border-cyan-300/50 bg-cyan-400/10 px-4 py-2 text-sm font-semibold text-cyan-100 transition hover:-translate-y-0.5 hover:border-cyan-200 disabled:opacity-60"
            >
              {submittingPayment ? "Submitting..." : "Submit Payment & Enroll"}
            </button>
          </div>
        </Modal>
      )}
    </section>
  );
};

export default Courses;
