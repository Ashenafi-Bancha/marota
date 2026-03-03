// src/components/Services.jsx
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
} from "react-icons/fa";
import { useSearch } from "../context/SearchContext";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";
import { diplomaLevels, shortCourses } from "../data/courses";
import { supabase } from "../lib/supabaseClient";
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

const COURSE_IMAGE_URLS = {
  "videography and photography":
    "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&w=1400&q=80",
  "video and photo editing":
    "https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=1400&q=80",
  "graphics design":
    "https://images.unsplash.com/photo-1545239351-1141bd82e8a6?auto=format&fit=crop&w=1400&q=80",
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
                : "Coming Soon • Curriculum in progress"}
            </span>
          )}
        </div>
      </div>

      <h4 className="text-lg sm:text-xl md:text-2xl font-semibold mt-5 text-white text-center">{course.title}</h4>
      <p className="text-gray-300 mt-3 leading-relaxed text-sm text-center">{course.description}</p>

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
              ? `Average ${aggregateRating.average} • ${aggregateRating.count} reviews`
              : "No ratings yet"}
          </span>
          {!isAdminView && userRating > 0 && (
            <span className="text-[var(--accent-blue)] font-semibold">Your rating: {userRating}/5</span>
          )}
        </div>
      </div>

      <div className="mt-5 flex items-center justify-center gap-3 flex-wrap">
        <button
          type="button"
          onClick={() => setShowDetails((prev) => !prev)}
          className="w-full sm:w-auto px-4 py-2.5 rounded-md text-sm font-semibold"
        >
          {showDetails ? "Hide course details" : "View course details"}
        </button>
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

      {showDetails && (
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

const Services = () => {
  const { searchQuery } = useSearch();
  const { user, isAdmin } = useAuth();
  const [allRatings, setAllRatings] = useState([]);
  const [userRatings, setUserRatings] = useState([]);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [statusMessage, setStatusMessage] = useState(null);
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
      setStatusMessage({
        type: "info",
        text: "First create an account to enroll in a course.",
        actionLabel: "Create account",
        actionTo: "/signup",
      });
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

    const primaryInsertRes = await supabase
      .from("enrollments")
      .insert([
        {
          user_id: user.id,
          course_title: normalizedCourseTitle,
          progress: 0,
          approval_status: "pending",
        },
      ]);

    let insertError = primaryInsertRes.error;
    let insertedStatus = "pending";

    if (isMissingApprovalStatusColumnError(primaryInsertRes.error)) {
      const fallbackInsertRes = await supabase
        .from("enrollments")
        .insert([
          {
            user_id: user.id,
            course_title: normalizedCourseTitle,
            progress: 0,
          },
        ]);

      insertError = fallbackInsertRes.error;
      insertedStatus = "approved";
    }

    if (insertError) {
      setStatusMessage({ type: "error", text: insertError.message });
      return;
    }

    setEnrolledCourses((prev) => [
      ...prev,
      {
        course_title: normalizedCourseTitle,
        approval_status: insertedStatus,
      },
    ]);

    setStatusMessage({
      type: "success",
      text:
        insertedStatus === "pending"
          ? "Enrollment application sent. Waiting for admin approval."
          : "Enrollment completed successfully.",
    });
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
    <section id="services" className="py-24 bg-[#0a192f] text-white relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none opacity-30 bg-[radial-gradient(circle_at_top,_rgba(100,255,218,0.15),_transparent_55%)]" />
      <div className="container relative mx-auto px-6 lg:px-12">
        <div className="text-center mb-14">
          <p className="inline-flex px-4 py-1 rounded-full text-xs tracking-widest uppercase font-semibold bg-[#112240] text-[var(--accent-blue)] border border-cyan-800/60 mb-4">
            Programs
          </p>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Our Courses and Services
          </h2>
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
                  : statusMessage.type === "info"
                  ? "border-cyan-400/40 bg-cyan-400/10 text-cyan-100"
                  : "border-green-500/40 bg-green-500/10 text-green-300"
              }`}
            >
              <span>{statusMessage.text}</span>
              {statusMessage.actionLabel && statusMessage.actionTo && (
                <Link
                  to={statusMessage.actionTo}
                  className="inline-flex items-center rounded-full border border-white/25 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.08em] text-white transition hover:-translate-y-0.5 hover:bg-white/20"
                >
                  {statusMessage.actionLabel}
                </Link>
              )}
            </div>
          )}
        </div>

        {!hasResults && (
          <div className="text-center text-gray-300 mb-12 rounded-xl border border-gray-700 bg-[#112240]/60 p-5 max-w-2xl mx-auto">
            No courses match "{searchQuery}". Try a different keyword.
          </div>
        )}

        <h3 className="text-3xl md:text-4xl font-bold mb-8 text-center !text-[var(--accent-blue)]">
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

        <h3 className="text-3xl md:text-4xl font-bold mb-8 text-center !text-[var(--accent-blue)]">
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
    </section>
  );
};

export default Services;
