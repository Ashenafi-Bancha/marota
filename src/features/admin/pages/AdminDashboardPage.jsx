import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  FaBell,
  FaBook,
  FaChartLine,
  FaCheck,
  FaClipboardList,
  FaExclamationTriangle,
  FaFilter,
  FaHome,
  FaLayerGroup,
  FaListAlt,
  FaPlus,
  FaRegClock,
  FaSearch,
  FaStar,
  FaSyncAlt,
  FaTrash,
  FaUserShield,
  FaUsers,
  FaWallet,
} from "react-icons/fa";
import { supabase } from "../../../shared/lib/supabaseClient";
import { useAuth } from "../../auth/context/AuthProvider";
import { shortCourses } from "../../courses/data/courses";
import {
  isMissingApprovalStatusColumnError,
  withDefaultApprovedStatus,
} from "../../courses/utils/enrollmentApproval";
import {
  buildCourseIdentity,
  normalizeCourseIdentity,
  parseCourseIdentity,
} from "../../courses/utils/courseIdentity";
import { ADMIN_ROLES, isMasterAdminRole } from "../../../config/adminPermissions";
import "./AdminDashboard.css";

const TAB_OPTIONS = [
  { id: "overview", label: "Overview", icon: FaChartLine, permission: "viewAnalytics" },
  { id: "learners", label: "Learners", icon: FaUsers, permission: "manageUsers" },
  {
    id: "admissions",
    label: "Admissions",
    icon: FaClipboardList,
    permission: "manageAdmissions",
  },
  {
    id: "curriculum",
    label: "Curriculum",
    icon: FaLayerGroup,
    permission: "manageCurriculum",
  },
  {
    id: "assessments",
    label: "Assessments",
    icon: FaBook,
    permission: "manageAssessments",
  },
  {
    id: "moderation",
    label: "Moderation",
    icon: FaStar,
    permission: "moderateRatings",
  },
  {
    id: "announcements",
    label: "Announcements",
    icon: FaBell,
    permission: "manageAnnouncements",
  },
  { id: "activity", label: "Activity", icon: FaListAlt, permission: "viewAuditLog" },
];

const ADMIN_ROLE_CHOICES = ["student", "admin", "super_admin", "master_admin", "owner"];
const ADMISSION_STATUS_OPTIONS = ["pending", "approved", "rejected", "all"];
const ANNOUNCEMENT_AUDIENCE_OPTIONS = ["all", "students", "admins"];
const ANNOUNCEMENT_STATUS_OPTIONS = ["published", "draft", "archived"];

const toPositiveInt = (value, fallback = 1) => {
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.max(1, parsed);
};

const formatDateTime = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleString();
};

const relativeAgeLabel = (value) => {
  if (!value) return "unknown";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "unknown";

  const diffMs = Date.now() - date.getTime();
  const minutes = Math.floor(diffMs / (1000 * 60));
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;

  const months = Math.floor(days / 30);
  return `${months}mo ago`;
};

const isWithinDays = (dateValue, days) => {
  if (!dateValue) return false;
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return false;

  const threshold = Date.now() - days * 24 * 60 * 60 * 1000;
  return date.getTime() >= threshold;
};

const statusBadgeClass = (status) => {
  if (status === "approved" || status === "published") return "status-approved";
  if (status === "pending" || status === "draft") return "status-pending";
  if (status === "rejected" || status === "archived") return "status-rejected";
  return "status-neutral";
};

const normalizeRole = (value) => String(value || "student").trim().toLowerCase();

const isAdminRole = (value) => ADMIN_ROLES.includes(normalizeRole(value));

const isMissingTableError = (error, tableName) => {
  if (!error) return false;
  const normalizedMessage = String(error.message || "").toLowerCase();
  const normalizedTableName = String(tableName || "").toLowerCase();

  return (
    error.code === "42P01" ||
    (normalizedMessage.includes("does not exist") &&
      normalizedMessage.includes(normalizedTableName))
  );
};

const isMissingColumnError = (error, columnName) => {
  if (!error) return false;
  const normalizedMessage = String(error.message || "").toLowerCase();
  const normalizedColumn = String(columnName || "").toLowerCase();

  return (
    error.code === "42703" ||
    (normalizedMessage.includes("column") &&
      normalizedMessage.includes(normalizedColumn) &&
      normalizedMessage.includes("does not exist"))
  );
};

const DEFAULT_MODULE_DRAFT = {
  title: "",
  description: "",
  sortOrder: "1",
};

const DEFAULT_LESSON_DRAFT = {
  moduleId: "",
  title: "",
  summary: "",
  videoUrl: "",
  documentationUrl: "",
  reviewUrl: "",
  sortOrder: "1",
};

const DEFAULT_QUIZ_DRAFT = {
  moduleId: "",
  title: "",
  description: "",
  questionCount: "10",
  passScore: "70",
  sortOrder: "1",
  quizUrl: "",
  reviewUrl: "",
};

const DEFAULT_PROJECT_DRAFT = {
  title: "",
  description: "",
  submissionInstruction: "",
  sortOrder: "1",
  projectBriefUrl: "",
  reviewUrl: "",
};

const DEFAULT_TEST_DRAFT = {
  title: "",
  description: "",
  durationMinutes: "60",
  passScore: "70",
  sortOrder: "1",
  testGuideUrl: "",
  reviewUrl: "",
};

const DEFAULT_ANNOUNCEMENT_DRAFT = {
  title: "",
  message: "",
  audience: "all",
  status: "published",
  expiresAt: "",
};

const getProfileName = (profile, fallbackId = "") => {
  if (profile?.full_name) return profile.full_name;
  const fallback = String(fallbackId || profile?.id || "").slice(0, 8);
  return fallback ? `User ${fallback}` : "Unknown user";
};

export default function AdminDashboard() {
  const { user, role, hasPermission } = useAuth();
  const isMasterAdmin = isMasterAdminRole(role);

  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState(null);

  const [supportsApprovalStatus, setSupportsApprovalStatus] = useState(true);
  const [supportsPaymentEvidence, setSupportsPaymentEvidence] = useState(true);
  const [supportsCurriculum, setSupportsCurriculum] = useState(true);
  const [supportsAssessmentLinks, setSupportsAssessmentLinks] = useState(true);
  const [supportsAnnouncements, setSupportsAnnouncements] = useState(true);
  const [supportsActivityLogs, setSupportsActivityLogs] = useState(true);

  const [profiles, setProfiles] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [ratings, setRatings] = useState([]);
  const [modules, setModules] = useState([]);
  const [lessons, setLessons] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [projects, setProjects] = useState([]);
  const [tests, setTests] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [activityLogs, setActivityLogs] = useState([]);

  const [updatingRoleFor, setUpdatingRoleFor] = useState("");
  const [roleSelections, setRoleSelections] = useState({});
  const [updatingApplicationFor, setUpdatingApplicationFor] = useState("");
  const [bulkApproving, setBulkApproving] = useState(false);
  const [openingReceiptFor, setOpeningReceiptFor] = useState("");
  const [removingRatingFor, setRemovingRatingFor] = useState("");

  const [learnerQuery, setLearnerQuery] = useState("");
  const [learnerRoleFilter, setLearnerRoleFilter] = useState("all");
  const [learnerSort, setLearnerSort] = useState("recent");

  const [admissionQuery, setAdmissionQuery] = useState("");
  const [admissionStatusFilter, setAdmissionStatusFilter] = useState("pending");
  const [paymentMethodFilter, setPaymentMethodFilter] = useState("all");

  const [ratingQuery, setRatingQuery] = useState("");
  const [ratingFloor, setRatingFloor] = useState("all");

  const [curriculumCourseKey, setCurriculumCourseKey] = useState("");

  const [moduleDraft, setModuleDraft] = useState(DEFAULT_MODULE_DRAFT);
  const [editingModuleId, setEditingModuleId] = useState(null);

  const [lessonDraft, setLessonDraft] = useState(DEFAULT_LESSON_DRAFT);
  const [editingLessonId, setEditingLessonId] = useState(null);

  const [quizDraft, setQuizDraft] = useState(DEFAULT_QUIZ_DRAFT);
  const [editingQuizId, setEditingQuizId] = useState(null);

  const [projectDraft, setProjectDraft] = useState(DEFAULT_PROJECT_DRAFT);
  const [editingProjectId, setEditingProjectId] = useState(null);

  const [testDraft, setTestDraft] = useState(DEFAULT_TEST_DRAFT);
  const [editingTestId, setEditingTestId] = useState(null);

  const [announcementDraft, setAnnouncementDraft] = useState(DEFAULT_ANNOUNCEMENT_DRAFT);
  const [editingAnnouncementId, setEditingAnnouncementId] = useState(null);

  const pushStatus = useCallback((type, text) => {
    setStatusMessage({ type, text, stamp: Date.now() });
  }, []);

  const availableTabs = useMemo(
    () => TAB_OPTIONS.filter((tab) => hasPermission(tab.permission)),
    [hasPermission]
  );

  useEffect(() => {
    if (!availableTabs.length) return;
    if (!availableTabs.some((tab) => tab.id === activeTab)) {
      setActiveTab(availableTabs[0].id);
    }
  }, [activeTab, availableTabs]);

  useEffect(() => {
    if (!statusMessage) return;
    const timeout = window.setTimeout(() => setStatusMessage(null), 7000);
    return () => window.clearTimeout(timeout);
  }, [statusMessage]);

  const profileMap = useMemo(
    () => new Map(profiles.map((profile) => [profile.id, profile])),
    [profiles]
  );

  const normalizedShortCourseKeys = useMemo(
    () =>
      shortCourses.map((course) =>
        normalizeCourseIdentity(
          buildCourseIdentity({
            ...course,
            group: "Short Course",
            type: "Short",
          })
        )
      ),
    []
  );

  const allCourseKeys = useMemo(() => {
    const dynamicKeys = [
      ...modules.map((item) => normalizeCourseIdentity(item.course_key)),
      ...quizzes.map((item) => normalizeCourseIdentity(item.course_key)),
      ...projects.map((item) => normalizeCourseIdentity(item.course_key)),
      ...tests.map((item) => normalizeCourseIdentity(item.course_key)),
      ...enrollments.map((item) => normalizeCourseIdentity(item.course_title)),
    ];

    const merged = new Set([...normalizedShortCourseKeys, ...dynamicKeys].filter(Boolean));

    return Array.from(merged)
      .map((key) => {
        const parsed = parseCourseIdentity(key);
        return {
          key,
          label: parsed.title || key,
          scope: parsed.scope || "Short Course",
        };
      })
      .sort((first, second) => first.label.localeCompare(second.label));
  }, [enrollments, modules, normalizedShortCourseKeys, projects, quizzes, tests]);

  useEffect(() => {
    if (!curriculumCourseKey && allCourseKeys.length > 0) {
      setCurriculumCourseKey(allCourseKeys[0].key);
      return;
    }

    if (
      curriculumCourseKey &&
      !allCourseKeys.some((course) => course.key === curriculumCourseKey)
    ) {
      setCurriculumCourseKey(allCourseKeys[0]?.key || "");
    }
  }, [allCourseKeys, curriculumCourseKey]);

  const modulesForCourse = useMemo(
    () =>
      modules
        .filter((moduleItem) => normalizeCourseIdentity(moduleItem.course_key) === curriculumCourseKey)
        .sort((first, second) => first.sort_order - second.sort_order),
    [curriculumCourseKey, modules]
  );

  useEffect(() => {
    if (!lessonDraft.moduleId && modulesForCourse.length > 0) {
      setLessonDraft((prev) => ({
        ...prev,
        moduleId: String(modulesForCourse[0].id),
      }));
    }
  }, [lessonDraft.moduleId, modulesForCourse]);

  const moduleIdSet = useMemo(
    () => new Set(modulesForCourse.map((moduleItem) => moduleItem.id)),
    [modulesForCourse]
  );

  const lessonsForCourse = useMemo(
    () =>
      lessons
        .filter((lessonItem) => moduleIdSet.has(lessonItem.module_id))
        .sort((first, second) => {
          if (first.module_id === second.module_id) {
            return first.sort_order - second.sort_order;
          }
          return first.module_id - second.module_id;
        }),
    [lessons, moduleIdSet]
  );

  const quizzesForCourse = useMemo(
    () =>
      quizzes
        .filter((quizItem) => normalizeCourseIdentity(quizItem.course_key) === curriculumCourseKey)
        .sort((first, second) => first.sort_order - second.sort_order),
    [curriculumCourseKey, quizzes]
  );

  const projectsForCourse = useMemo(
    () =>
      projects
        .filter(
          (projectItem) => normalizeCourseIdentity(projectItem.course_key) === curriculumCourseKey
        )
        .sort((first, second) => first.sort_order - second.sort_order),
    [curriculumCourseKey, projects]
  );

  const testsForCourse = useMemo(
    () =>
      tests
        .filter((testItem) => normalizeCourseIdentity(testItem.course_key) === curriculumCourseKey)
        .sort((first, second) => first.sort_order - second.sort_order),
    [curriculumCourseKey, tests]
  );

  const platformStats = useMemo(() => {
    const approved = enrollments.filter(
      (item) => (item.approval_status || "approved") === "approved"
    );
    const pending = enrollments.filter(
      (item) => (item.approval_status || "approved") === "pending"
    );
    const rejected = enrollments.filter(
      (item) => (item.approval_status || "approved") === "rejected"
    );

    const averageRating =
      ratings.length > 0
        ? Number(
            (ratings.reduce((sum, item) => sum + (item.rating || 0), 0) / ratings.length).toFixed(1)
          )
        : 0;

    const averageProgress =
      approved.length > 0
        ? Math.round(
            approved.reduce((sum, item) => sum + (item.progress || 0), 0) / approved.length
          )
        : 0;

    const admins = profiles.filter((profile) => isAdminRole(profile.role)).length;

    const newUsers7d = profiles.filter((profile) => isWithinDays(profile.created_at, 7)).length;
    const applications7d = enrollments.filter((enrollment) => isWithinDays(enrollment.created_at, 7)).length;

    const paymentUploads = enrollments.filter((item) => item.receipt_path).length;

    return {
      users: profiles.length,
      admins,
      enrollments: enrollments.length,
      approved: approved.length,
      pending: pending.length,
      rejected: rejected.length,
      ratings: ratings.length,
      averageRating,
      averageProgress,
      newUsers7d,
      applications7d,
      paymentUploads,
    };
  }, [enrollments, profiles, ratings]);

  const courseOverview = useMemo(() => {
    const map = new Map();

    enrollments.forEach((item) => {
      const key = normalizeCourseIdentity(item.course_title);
      const parsed = parseCourseIdentity(key);
      const initial = map.get(key) || {
        key,
        title: parsed.title,
        scope: parsed.scope || "Course",
        approved: 0,
        pending: 0,
        rejected: 0,
        progressTotal: 0,
        progressCount: 0,
        ratingsCount: 0,
        ratingsTotal: 0,
      };

      const status = item.approval_status || "approved";
      if (status === "approved") {
        initial.approved += 1;
        initial.progressTotal += item.progress || 0;
        initial.progressCount += 1;
      } else if (status === "pending") {
        initial.pending += 1;
      } else {
        initial.rejected += 1;
      }

      map.set(key, initial);
    });

    ratings.forEach((item) => {
      const key = normalizeCourseIdentity(item.course_title);
      const parsed = parseCourseIdentity(key);
      const initial = map.get(key) || {
        key,
        title: parsed.title,
        scope: parsed.scope || "Course",
        approved: 0,
        pending: 0,
        rejected: 0,
        progressTotal: 0,
        progressCount: 0,
        ratingsCount: 0,
        ratingsTotal: 0,
      };

      initial.ratingsCount += 1;
      initial.ratingsTotal += item.rating || 0;
      map.set(key, initial);
    });

    const rows = Array.from(map.values()).map((item) => ({
      ...item,
      averageProgress:
        item.progressCount > 0 ? Math.round(item.progressTotal / item.progressCount) : 0,
      averageRating:
        item.ratingsCount > 0
          ? Number((item.ratingsTotal / item.ratingsCount).toFixed(1))
          : 0,
    }));

    rows.sort((first, second) => second.approved - first.approved);
    return rows;
  }, [enrollments, ratings]);

  const highestEnrollmentCount = useMemo(
    () => Math.max(1, ...courseOverview.map((item) => item.approved + item.pending + item.rejected)),
    [courseOverview]
  );

  const learnerRows = useMemo(() => {
    return profiles.map((profile) => {
      const profileEnrollments = enrollments.filter((item) => item.user_id === profile.id);
      const approvedCount = profileEnrollments.filter(
        (item) => (item.approval_status || "approved") === "approved"
      ).length;
      const pendingCount = profileEnrollments.filter(
        (item) => (item.approval_status || "approved") === "pending"
      ).length;
      const rejectedCount = profileEnrollments.filter(
        (item) => (item.approval_status || "approved") === "rejected"
      ).length;

      const averageProgress =
        approvedCount > 0
          ? Math.round(
              profileEnrollments
                .filter((item) => (item.approval_status || "approved") === "approved")
                .reduce((sum, item) => sum + (item.progress || 0), 0) / approvedCount
            )
          : 0;

      const latestActivity = profileEnrollments
        .map((item) => item.created_at)
        .filter(Boolean)
        .sort((first, second) => new Date(second).getTime() - new Date(first).getTime())[0];

      const riskScore =
        (pendingCount >= 2 ? 1 : 0) +
        (rejectedCount >= 1 ? 1 : 0) +
        (approvedCount > 0 && averageProgress < 25 ? 1 : 0);

      return {
        profile,
        enrollments: profileEnrollments,
        approvedCount,
        pendingCount,
        rejectedCount,
        averageProgress,
        latestActivity,
        riskScore,
      };
    });
  }, [enrollments, profiles]);

  const filteredLearners = useMemo(() => {
    const normalizedQuery = learnerQuery.trim().toLowerCase();

    const filtered = learnerRows.filter((row) => {
      const roleValue = normalizeRole(row.profile.role || "student");
      if (learnerRoleFilter !== "all" && roleValue !== learnerRoleFilter) {
        return false;
      }

      if (!normalizedQuery) return true;

      const name = getProfileName(row.profile).toLowerCase();
      const profileId = String(row.profile.id || "").toLowerCase();
      return name.includes(normalizedQuery) || profileId.includes(normalizedQuery);
    });

    filtered.sort((first, second) => {
      if (learnerSort === "name") {
        return getProfileName(first.profile).localeCompare(getProfileName(second.profile));
      }
      if (learnerSort === "progress") {
        return second.averageProgress - first.averageProgress;
      }
      if (learnerSort === "risk") {
        return second.riskScore - first.riskScore;
      }

      return (
        new Date(second.profile.created_at || 0).getTime() -
        new Date(first.profile.created_at || 0).getTime()
      );
    });

    return filtered;
  }, [learnerQuery, learnerRoleFilter, learnerRows, learnerSort]);

  const filteredAdmissions = useMemo(() => {
    const normalizedQuery = admissionQuery.trim().toLowerCase();

    const filtered = enrollments.filter((enrollment) => {
      const status = enrollment.approval_status || "approved";
      const paymentMethod = String(enrollment.payment_method || "").toLowerCase();
      const parsedCourse = parseCourseIdentity(enrollment.course_title);
      const profile = profileMap.get(enrollment.user_id);
      const learnerName = getProfileName(profile, enrollment.user_id).toLowerCase();

      if (admissionStatusFilter !== "all" && status !== admissionStatusFilter) {
        return false;
      }

      if (paymentMethodFilter !== "all" && paymentMethod !== paymentMethodFilter) {
        return false;
      }

      if (!normalizedQuery) return true;

      return (
        parsedCourse.title.toLowerCase().includes(normalizedQuery) ||
        learnerName.includes(normalizedQuery) ||
        String(enrollment.user_id || "").toLowerCase().includes(normalizedQuery)
      );
    });

    filtered.sort(
      (first, second) =>
        new Date(second.created_at || 0).getTime() - new Date(first.created_at || 0).getTime()
    );

    return filtered;
  }, [
    admissionQuery,
    admissionStatusFilter,
    enrollments,
    paymentMethodFilter,
    profileMap,
  ]);

  const pendingAdmissions = useMemo(
    () =>
      filteredAdmissions.filter(
        (enrollment) => (enrollment.approval_status || "approved") === "pending"
      ),
    [filteredAdmissions]
  );

  const filteredRatings = useMemo(() => {
    const normalizedQuery = ratingQuery.trim().toLowerCase();

    return ratings
      .filter((ratingItem) => {
        const parsedCourse = parseCourseIdentity(ratingItem.course_title);
        const profile = profileMap.get(ratingItem.user_id);
        const learnerName = getProfileName(profile, ratingItem.user_id).toLowerCase();

        if (ratingFloor !== "all" && ratingItem.rating < Number(ratingFloor)) {
          return false;
        }

        if (!normalizedQuery) return true;

        return (
          parsedCourse.title.toLowerCase().includes(normalizedQuery) ||
          learnerName.includes(normalizedQuery)
        );
      })
      .sort(
        (first, second) =>
          new Date(second.created_at || 0).getTime() - new Date(first.created_at || 0).getTime()
      );
  }, [profileMap, ratingFloor, ratingQuery, ratings]);

  const delayedAdmissions = useMemo(
    () =>
      enrollments.filter((item) => {
        const status = item.approval_status || "approved";
        return status === "pending" && !isWithinDays(item.created_at, 2);
      }),
    [enrollments]
  );

  const accessRisks = useMemo(() => {
    const highRiskLearners = learnerRows.filter((row) => row.riskScore >= 2);

    return [
      {
        id: "pending-delays",
        title: "Admissions waiting over 48 hours",
        value: delayedAdmissions.length,
        severity: delayedAdmissions.length > 0 ? "high" : "low",
      },
      {
        id: "learner-risk",
        title: "Learners requiring intervention",
        value: highRiskLearners.length,
        severity: highRiskLearners.length > 0 ? "medium" : "low",
      },
      {
        id: "low-reviews",
        title: "Low ratings (2 or below)",
        value: ratings.filter((item) => item.rating <= 2).length,
        severity: ratings.some((item) => item.rating <= 2) ? "medium" : "low",
      },
    ];
  }, [delayedAdmissions.length, learnerRows, ratings]);

  const loadAdminData = useCallback(async () => {
    setLoading(true);

    const enrollmentFieldsWithPayment =
      "id, user_id, course_title, progress, approval_status, created_at, payment_method, payment_account_number, payment_sender_name, payment_reference, payment_uploaded_at, receipt_path";

    const [
      profilesRes,
      enrollmentsWithPaymentRes,
      ratingsRes,
      modulesRes,
      lessonsRes,
      quizzesWithLinksRes,
      projectsWithLinksRes,
      testsWithLinksRes,
      announcementsRes,
      activityLogsRes,
    ] = await Promise.all([
      supabase
        .from("profiles")
        .select("id, full_name, role, created_at")
        .order("created_at", { ascending: false }),
      supabase
        .from("enrollments")
        .select(enrollmentFieldsWithPayment)
        .order("created_at", { ascending: false }),
      supabase
        .from("course_ratings")
        .select("id, user_id, course_title, rating, created_at")
        .order("created_at", { ascending: false }),
      supabase
        .from("short_course_modules")
        .select("id, course_key, title, description, sort_order, created_at")
        .order("course_key", { ascending: true })
        .order("sort_order", { ascending: true }),
      supabase
        .from("short_course_lessons")
        .select(
          "id, module_id, title, summary, video_url, documentation_url, external_review_url, sort_order, created_at"
        )
        .order("module_id", { ascending: true })
        .order("sort_order", { ascending: true }),
      supabase
        .from("short_course_quizzes")
        .select(
          "id, course_key, module_id, title, description, question_count, pass_score, sort_order, quiz_url, review_url, created_at"
        )
        .order("course_key", { ascending: true })
        .order("sort_order", { ascending: true }),
      supabase
        .from("short_course_projects")
        .select(
          "id, course_key, title, description, submission_instruction, sort_order, project_brief_url, review_url, created_at"
        )
        .order("course_key", { ascending: true })
        .order("sort_order", { ascending: true }),
      supabase
        .from("short_course_tests")
        .select(
          "id, course_key, title, description, duration_minutes, pass_score, sort_order, test_guide_url, review_url, created_at"
        )
        .order("course_key", { ascending: true })
        .order("sort_order", { ascending: true }),
      supabase
        .from("admin_announcements")
        .select(
          "id, title, message, audience, status, expires_at, created_at, updated_at, created_by"
        )
        .order("created_at", { ascending: false })
        .limit(40),
      supabase
        .from("admin_activity_logs")
        .select(
          "id, actor_id, actor_role, action_type, target_type, target_id, description, metadata, created_at"
        )
        .order("created_at", { ascending: false })
        .limit(60),
    ]);

    let nextSupportsApprovalStatus = true;
    let nextSupportsPaymentEvidence = true;
    let nextSupportsCurriculum = true;
    let nextSupportsAssessmentLinks = true;
    let nextSupportsAnnouncements = true;
    let nextSupportsActivityLogs = true;

    let enrollmentsRes = enrollmentsWithPaymentRes;
    if (isMissingApprovalStatusColumnError(enrollmentsWithPaymentRes.error)) {
      const fallbackEnrollmentsRes = await supabase
        .from("enrollments")
        .select("id, user_id, course_title, progress, created_at")
        .order("created_at", { ascending: false });

      enrollmentsRes = {
        ...fallbackEnrollmentsRes,
        data: withDefaultApprovedStatus(fallbackEnrollmentsRes.data || []).map((item) => ({
          ...item,
          payment_method: null,
          payment_account_number: null,
          payment_sender_name: null,
          payment_reference: null,
          payment_uploaded_at: null,
          receipt_path: null,
        })),
      };

      nextSupportsApprovalStatus = false;
      nextSupportsPaymentEvidence = false;
      pushStatus(
        "info",
        "Enrollment approval workflow is limited until the latest database migration is applied."
      );
    } else if (
      enrollmentsWithPaymentRes.error &&
      (isMissingColumnError(enrollmentsWithPaymentRes.error, "payment_method") ||
        isMissingColumnError(enrollmentsWithPaymentRes.error, "receipt_path") ||
        isMissingColumnError(enrollmentsWithPaymentRes.error, "payment_uploaded_at"))
    ) {
      const fallbackEnrollmentsRes = await supabase
        .from("enrollments")
        .select("id, user_id, course_title, progress, approval_status, created_at")
        .order("created_at", { ascending: false });

      enrollmentsRes = {
        ...fallbackEnrollmentsRes,
        data: (fallbackEnrollmentsRes.data || []).map((item) => ({
          ...item,
          payment_method: null,
          payment_account_number: null,
          payment_sender_name: null,
          payment_reference: null,
          payment_uploaded_at: null,
          receipt_path: null,
        })),
      };

      nextSupportsPaymentEvidence = false;
      pushStatus(
        "info",
        "Payment evidence fields are unavailable until the latest migration is applied."
      );
    }

    let quizzesRes = quizzesWithLinksRes;
    if (
      quizzesWithLinksRes.error &&
      (isMissingColumnError(quizzesWithLinksRes.error, "quiz_url") ||
        isMissingColumnError(quizzesWithLinksRes.error, "review_url"))
    ) {
      const fallbackQuizzesRes = await supabase
        .from("short_course_quizzes")
        .select(
          "id, course_key, module_id, title, description, question_count, pass_score, sort_order, created_at"
        )
        .order("course_key", { ascending: true })
        .order("sort_order", { ascending: true });

      quizzesRes = {
        ...fallbackQuizzesRes,
        data: (fallbackQuizzesRes.data || []).map((item) => ({
          ...item,
          quiz_url: null,
          review_url: null,
        })),
      };
      nextSupportsAssessmentLinks = false;
    }

    let projectsRes = projectsWithLinksRes;
    if (
      projectsWithLinksRes.error &&
      (isMissingColumnError(projectsWithLinksRes.error, "project_brief_url") ||
        isMissingColumnError(projectsWithLinksRes.error, "review_url"))
    ) {
      const fallbackProjectsRes = await supabase
        .from("short_course_projects")
        .select("id, course_key, title, description, submission_instruction, sort_order, created_at")
        .order("course_key", { ascending: true })
        .order("sort_order", { ascending: true });

      projectsRes = {
        ...fallbackProjectsRes,
        data: (fallbackProjectsRes.data || []).map((item) => ({
          ...item,
          project_brief_url: null,
          review_url: null,
        })),
      };
      nextSupportsAssessmentLinks = false;
    }

    let testsRes = testsWithLinksRes;
    if (
      testsWithLinksRes.error &&
      (isMissingColumnError(testsWithLinksRes.error, "test_guide_url") ||
        isMissingColumnError(testsWithLinksRes.error, "review_url"))
    ) {
      const fallbackTestsRes = await supabase
        .from("short_course_tests")
        .select(
          "id, course_key, title, description, duration_minutes, pass_score, sort_order, created_at"
        )
        .order("course_key", { ascending: true })
        .order("sort_order", { ascending: true });

      testsRes = {
        ...fallbackTestsRes,
        data: (fallbackTestsRes.data || []).map((item) => ({
          ...item,
          test_guide_url: null,
          review_url: null,
        })),
      };
      nextSupportsAssessmentLinks = false;
    }

    let announcementsResult = announcementsRes;
    if (isMissingTableError(announcementsRes.error, "admin_announcements")) {
      announcementsResult = { data: [], error: null };
      nextSupportsAnnouncements = false;
    }

    let activityLogsResult = activityLogsRes;
    if (isMissingTableError(activityLogsRes.error, "admin_activity_logs")) {
      activityLogsResult = { data: [], error: null };
      nextSupportsActivityLogs = false;
    }

    const curriculumErrors = [modulesRes, lessonsRes, quizzesRes, projectsRes, testsRes].filter(
      (result) => result.error
    );

    const missingCurriculumTable = curriculumErrors.some((result) => {
      return (
        isMissingTableError(result.error, "short_course_modules") ||
        isMissingTableError(result.error, "short_course_lessons") ||
        isMissingTableError(result.error, "short_course_quizzes") ||
        isMissingTableError(result.error, "short_course_projects") ||
        isMissingTableError(result.error, "short_course_tests")
      );
    });

    if (missingCurriculumTable) {
      nextSupportsCurriculum = false;
    }

    if (profilesRes.error) {
      pushStatus("error", profilesRes.error.message || "Unable to load profiles.");
    }

    if (enrollmentsRes.error) {
      pushStatus("error", enrollmentsRes.error.message || "Unable to load enrollments.");
    }

    if (ratingsRes.error) {
      pushStatus("error", ratingsRes.error.message || "Unable to load ratings.");
    }

    if (curriculumErrors.some((result) => result.error && !missingCurriculumTable)) {
      const errorMessage = curriculumErrors.find((result) => result.error)?.error?.message;
      pushStatus(
        "error",
        errorMessage || "Unable to load curriculum data for one or more sections."
      );
    }

    if (announcementsResult.error) {
      pushStatus("error", announcementsResult.error.message || "Unable to load announcements.");
    }

    if (activityLogsResult.error) {
      pushStatus("error", activityLogsResult.error.message || "Unable to load activity logs.");
    }

    setSupportsApprovalStatus(nextSupportsApprovalStatus);
    setSupportsPaymentEvidence(nextSupportsPaymentEvidence);
    setSupportsCurriculum(nextSupportsCurriculum);
    setSupportsAssessmentLinks(nextSupportsAssessmentLinks);
    setSupportsAnnouncements(nextSupportsAnnouncements);
    setSupportsActivityLogs(nextSupportsActivityLogs);

    setProfiles(profilesRes.data || []);
    setEnrollments(enrollmentsRes.data || []);
    setRatings(ratingsRes.data || []);
    setModules(modulesRes.data || []);
    setLessons(lessonsRes.data || []);
    setQuizzes(quizzesRes.data || []);
    setProjects(projectsRes.data || []);
    setTests(testsRes.data || []);
    setAnnouncements(announcementsResult.data || []);
    setActivityLogs(activityLogsResult.data || []);

    setLoading(false);
  }, [pushStatus]);

  useEffect(() => {
    loadAdminData();
  }, [loadAdminData]);

  const recordAdminActivity = useCallback(
    async ({ actionType, targetType = null, targetId = null, description, metadata = null }) => {
      const localActivity = {
        id: `local-${Date.now()}`,
        actor_id: user?.id || null,
        actor_role: role,
        action_type: actionType,
        target_type: targetType,
        target_id: targetId,
        description,
        metadata,
        created_at: new Date().toISOString(),
      };

      setActivityLogs((prev) => [localActivity, ...prev].slice(0, 60));

      if (!supportsActivityLogs || !user) {
        return;
      }

      const { data, error } = await supabase
        .from("admin_activity_logs")
        .insert([
          {
            actor_id: user.id,
            actor_role: role,
            action_type: actionType,
            target_type: targetType,
            target_id: targetId,
            description,
            metadata,
          },
        ])
        .select(
          "id, actor_id, actor_role, action_type, target_type, target_id, description, metadata, created_at"
        )
        .maybeSingle();

      if (!error && data) {
        setActivityLogs((prev) => {
          const withoutLocal = prev.filter((item) => item.id !== localActivity.id);
          return [data, ...withoutLocal].slice(0, 60);
        });
      }
    },
    [role, supportsActivityLogs, user]
  );

  const updateUserRole = async (profileRow, nextRole) => {
    if (!isMasterAdmin) {
      pushStatus(
        "error",
        "Only master_admin (or owner) accounts can change user roles."
      );
      return;
    }

    if (!hasPermission("manageRoles")) {
      pushStatus("error", "You do not have permission to manage roles.");
      return;
    }

    if (!profileRow?.id) return;

    const normalizedNextRole = normalizeRole(nextRole);
    const currentRole = normalizeRole(profileRow.role || "student");

    if (normalizedNextRole === currentRole) {
      pushStatus("info", "This user already has the selected role.");
      return;
    }

    if (profileRow.id === user?.id && !isMasterAdminRole(normalizedNextRole)) {
      pushStatus(
        "error",
        "Master admin accounts cannot demote themselves from master_admin/owner roles."
      );
      return;
    }

    setUpdatingRoleFor(profileRow.id);

    const { error } = await supabase
      .from("profiles")
      .update({ role: normalizedNextRole })
      .eq("id", profileRow.id);

    if (error) {
      pushStatus("error", error.message || "Unable to update role.");
      setUpdatingRoleFor("");
      return;
    }

    setProfiles((prev) =>
      prev.map((item) =>
        item.id === profileRow.id ? { ...item, role: normalizedNextRole } : item
      )
    );
    setRoleSelections((prev) => ({ ...prev, [profileRow.id]: normalizedNextRole }));

    pushStatus(
      "success",
      `${getProfileName(profileRow, profileRow.id)} is now ${normalizedNextRole}.`
    );

    recordAdminActivity({
      actionType: "role_change",
      targetType: "profile",
      targetId: profileRow.id,
      description: `Changed role for ${getProfileName(profileRow, profileRow.id)} to ${normalizedNextRole}`,
      metadata: {
        previousRole: currentRole,
        nextRole: normalizedNextRole,
      },
    });

    setUpdatingRoleFor("");
  };

  const updateEnrollmentStatus = async (enrollmentRow, nextStatus) => {
    if (!hasPermission("manageAdmissions")) {
      pushStatus("error", "You do not have permission to manage admissions.");
      return;
    }

    if (!supportsApprovalStatus) {
      pushStatus(
        "info",
        "Approval actions are unavailable until the enrollment migration is applied."
      );
      return;
    }

    const enrollmentId = enrollmentRow?.id;
    if (!enrollmentId) return;

    setUpdatingApplicationFor(String(enrollmentId));

    const { error } = await supabase
      .from("enrollments")
      .update({ approval_status: nextStatus })
      .eq("id", enrollmentId);

    if (error) {
      pushStatus("error", error.message || "Unable to update enrollment status.");
      setUpdatingApplicationFor("");
      return;
    }

    setEnrollments((prev) =>
      prev.map((item) =>
        item.id === enrollmentId ? { ...item, approval_status: nextStatus } : item
      )
    );

    const parsedCourse = parseCourseIdentity(enrollmentRow.course_title);
    pushStatus(
      "success",
      `${parsedCourse.title} application moved to ${nextStatus.toUpperCase()}.`
    );

    recordAdminActivity({
      actionType: "admission_status_change",
      targetType: "enrollment",
      targetId: String(enrollmentId),
      description: `Updated enrollment ${enrollmentId} to ${nextStatus}`,
      metadata: {
        previousStatus: enrollmentRow.approval_status || "approved",
        nextStatus,
      },
    });

    setUpdatingApplicationFor("");
  };

  const approveAllVisiblePending = async () => {
    if (!hasPermission("manageAdmissions")) {
      pushStatus("error", "You do not have permission to manage admissions.");
      return;
    }

    if (!supportsApprovalStatus) {
      pushStatus(
        "info",
        "Bulk approval is unavailable until the enrollment migration is applied."
      );
      return;
    }

    const pendingIds = pendingAdmissions.map((item) => item.id).filter(Boolean);

    if (!pendingIds.length) {
      pushStatus("info", "No pending applications in the current filter.");
      return;
    }

    setBulkApproving(true);

    const { error } = await supabase
      .from("enrollments")
      .update({ approval_status: "approved" })
      .in("id", pendingIds);

    if (error) {
      pushStatus("error", error.message || "Unable to bulk-approve applications.");
      setBulkApproving(false);
      return;
    }

    const pendingSet = new Set(pendingIds);
    setEnrollments((prev) =>
      prev.map((item) =>
        pendingSet.has(item.id) ? { ...item, approval_status: "approved" } : item
      )
    );

    pushStatus("success", `Approved ${pendingIds.length} pending applications.`);

    recordAdminActivity({
      actionType: "admission_bulk_approve",
      targetType: "enrollment",
      targetId: `${pendingIds.length}`,
      description: `Bulk-approved ${pendingIds.length} applications`,
      metadata: {
        enrollmentIds: pendingIds,
      },
    });

    setBulkApproving(false);
  };

  const openEnrollmentReceipt = async (enrollmentRow) => {
    if (!supportsPaymentEvidence) {
      pushStatus(
        "info",
        "Receipt preview is unavailable until payment evidence columns are available."
      );
      return;
    }

    if (!enrollmentRow?.receipt_path) {
      pushStatus("info", "This application has no receipt uploaded.");
      return;
    }

    setOpeningReceiptFor(String(enrollmentRow.id));

    const { data, error } = await supabase.storage
      .from("enrollment-receipts")
      .createSignedUrl(enrollmentRow.receipt_path, 60 * 30);

    if (error || !data?.signedUrl) {
      pushStatus("error", error?.message || "Unable to open this receipt.");
      setOpeningReceiptFor("");
      return;
    }

    window.open(data.signedUrl, "_blank", "noopener,noreferrer");

    recordAdminActivity({
      actionType: "receipt_view",
      targetType: "enrollment",
      targetId: String(enrollmentRow.id),
      description: `Opened payment receipt for enrollment ${enrollmentRow.id}`,
      metadata: {
        receiptPath: enrollmentRow.receipt_path,
      },
    });

    setOpeningReceiptFor("");
  };

  const removeRating = async (ratingRow) => {
    if (!hasPermission("moderateRatings")) {
      pushStatus("error", "You do not have permission to moderate ratings.");
      return;
    }

    if (!ratingRow?.id) return;

    setRemovingRatingFor(String(ratingRow.id));

    const { error } = await supabase
      .from("course_ratings")
      .delete()
      .eq("id", ratingRow.id);

    if (error) {
      pushStatus("error", error.message || "Unable to remove rating.");
      setRemovingRatingFor("");
      return;
    }

    setRatings((prev) => prev.filter((item) => item.id !== ratingRow.id));
    pushStatus("success", "Rating removed.");

    recordAdminActivity({
      actionType: "rating_removed",
      targetType: "course_rating",
      targetId: String(ratingRow.id),
      description: `Removed rating ${ratingRow.id} from ${parseCourseIdentity(ratingRow.course_title).title}`,
      metadata: {
        rating: ratingRow.rating,
      },
    });

    setRemovingRatingFor("");
  };

  const submitModule = async (event) => {
    event.preventDefault();

    if (!supportsCurriculum) {
      pushStatus(
        "info",
        "Curriculum features are unavailable until curriculum migrations are applied."
      );
      return;
    }

    if (!hasPermission("manageCurriculum")) {
      pushStatus("error", "You do not have permission to manage curriculum.");
      return;
    }

    if (!curriculumCourseKey) {
      pushStatus("error", "Select a course before adding modules.");
      return;
    }

    const trimmedTitle = moduleDraft.title.trim();
    if (!trimmedTitle) {
      pushStatus("error", "Module title is required.");
      return;
    }

    const payload = {
      course_key: curriculumCourseKey,
      title: trimmedTitle,
      description: moduleDraft.description.trim() || null,
      sort_order: toPositiveInt(moduleDraft.sortOrder, 1),
    };

    let response;
    if (editingModuleId) {
      response = await supabase
        .from("short_course_modules")
        .update(payload)
        .eq("id", editingModuleId)
        .select("id, course_key, title, description, sort_order, created_at")
        .maybeSingle();
    } else {
      response = await supabase
        .from("short_course_modules")
        .insert([payload])
        .select("id, course_key, title, description, sort_order, created_at")
        .maybeSingle();
    }

    if (response.error || !response.data) {
      pushStatus("error", response.error?.message || "Unable to save module.");
      return;
    }

    const savedModule = response.data;

    if (editingModuleId) {
      setModules((prev) => prev.map((item) => (item.id === savedModule.id ? savedModule : item)));
      pushStatus("success", "Module updated.");
      recordAdminActivity({
        actionType: "module_updated",
        targetType: "module",
        targetId: String(savedModule.id),
        description: `Updated module ${savedModule.title}`,
      });
    } else {
      setModules((prev) => [savedModule, ...prev]);
      pushStatus("success", "Module created.");
      recordAdminActivity({
        actionType: "module_created",
        targetType: "module",
        targetId: String(savedModule.id),
        description: `Created module ${savedModule.title}`,
      });
    }

    setModuleDraft(DEFAULT_MODULE_DRAFT);
    setEditingModuleId(null);
  };

  const submitLesson = async (event) => {
    event.preventDefault();

    if (!supportsCurriculum) {
      pushStatus(
        "info",
        "Curriculum features are unavailable until curriculum migrations are applied."
      );
      return;
    }

    if (!hasPermission("manageCurriculum")) {
      pushStatus("error", "You do not have permission to manage curriculum.");
      return;
    }

    if (!lessonDraft.moduleId) {
      pushStatus("error", "Select a module for this lesson.");
      return;
    }

    const trimmedTitle = lessonDraft.title.trim();
    if (!trimmedTitle) {
      pushStatus("error", "Lesson title is required.");
      return;
    }

    const payload = {
      module_id: Number(lessonDraft.moduleId),
      title: trimmedTitle,
      summary: lessonDraft.summary.trim() || null,
      video_url: lessonDraft.videoUrl.trim() || null,
      documentation_url: lessonDraft.documentationUrl.trim() || null,
      external_review_url: lessonDraft.reviewUrl.trim() || null,
      sort_order: toPositiveInt(lessonDraft.sortOrder, 1),
    };

    let response;
    if (editingLessonId) {
      response = await supabase
        .from("short_course_lessons")
        .update(payload)
        .eq("id", editingLessonId)
        .select(
          "id, module_id, title, summary, video_url, documentation_url, external_review_url, sort_order, created_at"
        )
        .maybeSingle();
    } else {
      response = await supabase
        .from("short_course_lessons")
        .insert([payload])
        .select(
          "id, module_id, title, summary, video_url, documentation_url, external_review_url, sort_order, created_at"
        )
        .maybeSingle();
    }

    if (response.error || !response.data) {
      pushStatus("error", response.error?.message || "Unable to save lesson.");
      return;
    }

    const savedLesson = response.data;

    if (editingLessonId) {
      setLessons((prev) => prev.map((item) => (item.id === savedLesson.id ? savedLesson : item)));
      pushStatus("success", "Lesson updated.");
      recordAdminActivity({
        actionType: "lesson_updated",
        targetType: "lesson",
        targetId: String(savedLesson.id),
        description: `Updated lesson ${savedLesson.title}`,
      });
    } else {
      setLessons((prev) => [savedLesson, ...prev]);
      pushStatus("success", "Lesson created.");
      recordAdminActivity({
        actionType: "lesson_created",
        targetType: "lesson",
        targetId: String(savedLesson.id),
        description: `Created lesson ${savedLesson.title}`,
      });
    }

    setLessonDraft((prev) => ({ ...DEFAULT_LESSON_DRAFT, moduleId: prev.moduleId }));
    setEditingLessonId(null);
  };

  const submitQuiz = async (event) => {
    event.preventDefault();

    if (!supportsCurriculum) {
      pushStatus(
        "info",
        "Assessment features are unavailable until curriculum migrations are applied."
      );
      return;
    }

    if (!hasPermission("manageAssessments")) {
      pushStatus("error", "You do not have permission to manage assessments.");
      return;
    }

    if (!curriculumCourseKey) {
      pushStatus("error", "Select a course before adding quizzes.");
      return;
    }

    const trimmedTitle = quizDraft.title.trim();
    if (!trimmedTitle) {
      pushStatus("error", "Quiz title is required.");
      return;
    }

    const payload = {
      course_key: curriculumCourseKey,
      module_id: quizDraft.moduleId ? Number(quizDraft.moduleId) : null,
      title: trimmedTitle,
      description: quizDraft.description.trim() || null,
      question_count: toPositiveInt(quizDraft.questionCount, 10),
      pass_score: toPositiveInt(quizDraft.passScore, 70),
      sort_order: toPositiveInt(quizDraft.sortOrder, 1),
      quiz_url: quizDraft.quizUrl.trim() || null,
      review_url: quizDraft.reviewUrl.trim() || null,
    };

    let response;
    if (editingQuizId) {
      response = await supabase
        .from("short_course_quizzes")
        .update(payload)
        .eq("id", editingQuizId)
        .select(
          "id, course_key, module_id, title, description, question_count, pass_score, sort_order, quiz_url, review_url, created_at"
        )
        .maybeSingle();
    } else {
      response = await supabase
        .from("short_course_quizzes")
        .insert([payload])
        .select(
          "id, course_key, module_id, title, description, question_count, pass_score, sort_order, quiz_url, review_url, created_at"
        )
        .maybeSingle();
    }

    if (response.error || !response.data) {
      pushStatus("error", response.error?.message || "Unable to save quiz.");
      return;
    }

    const savedQuiz = response.data;

    if (editingQuizId) {
      setQuizzes((prev) => prev.map((item) => (item.id === savedQuiz.id ? savedQuiz : item)));
      pushStatus("success", "Quiz updated.");
      recordAdminActivity({
        actionType: "quiz_updated",
        targetType: "quiz",
        targetId: String(savedQuiz.id),
        description: `Updated quiz ${savedQuiz.title}`,
      });
    } else {
      setQuizzes((prev) => [savedQuiz, ...prev]);
      pushStatus("success", "Quiz created.");
      recordAdminActivity({
        actionType: "quiz_created",
        targetType: "quiz",
        targetId: String(savedQuiz.id),
        description: `Created quiz ${savedQuiz.title}`,
      });
    }

    setQuizDraft((prev) => ({ ...DEFAULT_QUIZ_DRAFT, moduleId: prev.moduleId }));
    setEditingQuizId(null);
  };

  const submitProject = async (event) => {
    event.preventDefault();

    if (!supportsCurriculum) {
      pushStatus(
        "info",
        "Assessment features are unavailable until curriculum migrations are applied."
      );
      return;
    }

    if (!hasPermission("manageAssessments")) {
      pushStatus("error", "You do not have permission to manage assessments.");
      return;
    }

    if (!curriculumCourseKey) {
      pushStatus("error", "Select a course before adding projects.");
      return;
    }

    const trimmedTitle = projectDraft.title.trim();
    if (!trimmedTitle) {
      pushStatus("error", "Project title is required.");
      return;
    }

    const payload = {
      course_key: curriculumCourseKey,
      title: trimmedTitle,
      description: projectDraft.description.trim() || null,
      submission_instruction: projectDraft.submissionInstruction.trim() || null,
      sort_order: toPositiveInt(projectDraft.sortOrder, 1),
      project_brief_url: projectDraft.projectBriefUrl.trim() || null,
      review_url: projectDraft.reviewUrl.trim() || null,
    };

    let response;
    if (editingProjectId) {
      response = await supabase
        .from("short_course_projects")
        .update(payload)
        .eq("id", editingProjectId)
        .select(
          "id, course_key, title, description, submission_instruction, sort_order, project_brief_url, review_url, created_at"
        )
        .maybeSingle();
    } else {
      response = await supabase
        .from("short_course_projects")
        .insert([payload])
        .select(
          "id, course_key, title, description, submission_instruction, sort_order, project_brief_url, review_url, created_at"
        )
        .maybeSingle();
    }

    if (response.error || !response.data) {
      pushStatus("error", response.error?.message || "Unable to save project.");
      return;
    }

    const savedProject = response.data;

    if (editingProjectId) {
      setProjects((prev) =>
        prev.map((item) => (item.id === savedProject.id ? savedProject : item))
      );
      pushStatus("success", "Project updated.");
      recordAdminActivity({
        actionType: "project_updated",
        targetType: "project",
        targetId: String(savedProject.id),
        description: `Updated project ${savedProject.title}`,
      });
    } else {
      setProjects((prev) => [savedProject, ...prev]);
      pushStatus("success", "Project created.");
      recordAdminActivity({
        actionType: "project_created",
        targetType: "project",
        targetId: String(savedProject.id),
        description: `Created project ${savedProject.title}`,
      });
    }

    setProjectDraft(DEFAULT_PROJECT_DRAFT);
    setEditingProjectId(null);
  };

  const submitTest = async (event) => {
    event.preventDefault();

    if (!supportsCurriculum) {
      pushStatus(
        "info",
        "Assessment features are unavailable until curriculum migrations are applied."
      );
      return;
    }

    if (!hasPermission("manageAssessments")) {
      pushStatus("error", "You do not have permission to manage assessments.");
      return;
    }

    if (!curriculumCourseKey) {
      pushStatus("error", "Select a course before adding tests.");
      return;
    }

    const trimmedTitle = testDraft.title.trim();
    if (!trimmedTitle) {
      pushStatus("error", "Test title is required.");
      return;
    }

    const payload = {
      course_key: curriculumCourseKey,
      title: trimmedTitle,
      description: testDraft.description.trim() || null,
      duration_minutes: toPositiveInt(testDraft.durationMinutes, 60),
      pass_score: toPositiveInt(testDraft.passScore, 70),
      sort_order: toPositiveInt(testDraft.sortOrder, 1),
      test_guide_url: testDraft.testGuideUrl.trim() || null,
      review_url: testDraft.reviewUrl.trim() || null,
    };

    let response;
    if (editingTestId) {
      response = await supabase
        .from("short_course_tests")
        .update(payload)
        .eq("id", editingTestId)
        .select(
          "id, course_key, title, description, duration_minutes, pass_score, sort_order, test_guide_url, review_url, created_at"
        )
        .maybeSingle();
    } else {
      response = await supabase
        .from("short_course_tests")
        .insert([payload])
        .select(
          "id, course_key, title, description, duration_minutes, pass_score, sort_order, test_guide_url, review_url, created_at"
        )
        .maybeSingle();
    }

    if (response.error || !response.data) {
      pushStatus("error", response.error?.message || "Unable to save test.");
      return;
    }

    const savedTest = response.data;

    if (editingTestId) {
      setTests((prev) => prev.map((item) => (item.id === savedTest.id ? savedTest : item)));
      pushStatus("success", "Test updated.");
      recordAdminActivity({
        actionType: "test_updated",
        targetType: "test",
        targetId: String(savedTest.id),
        description: `Updated test ${savedTest.title}`,
      });
    } else {
      setTests((prev) => [savedTest, ...prev]);
      pushStatus("success", "Test created.");
      recordAdminActivity({
        actionType: "test_created",
        targetType: "test",
        targetId: String(savedTest.id),
        description: `Created test ${savedTest.title}`,
      });
    }

    setTestDraft(DEFAULT_TEST_DRAFT);
    setEditingTestId(null);
  };

  const removeByTable = async ({ tableName, id, successMessage, targetType, title }) => {
    if (!supportsCurriculum) {
      pushStatus(
        "info",
        "Curriculum features are unavailable until curriculum migrations are applied."
      );
      return;
    }

    const managingCurriculumTables = ["short_course_modules", "short_course_lessons"];
    const managingAssessmentTables = [
      "short_course_quizzes",
      "short_course_projects",
      "short_course_tests",
    ];

    if (
      managingCurriculumTables.includes(tableName) &&
      !hasPermission("manageCurriculum")
    ) {
      pushStatus("error", "You do not have permission to manage curriculum.");
      return;
    }

    if (
      managingAssessmentTables.includes(tableName) &&
      !hasPermission("manageAssessments")
    ) {
      pushStatus("error", "You do not have permission to manage assessments.");
      return;
    }

    const confirmed = window.confirm(`Delete this ${targetType}? This cannot be undone.`);
    if (!confirmed) return;

    const { error } = await supabase.from(tableName).delete().eq("id", id);

    if (error) {
      pushStatus("error", error.message || `Unable to delete ${targetType}.`);
      return;
    }

    if (tableName === "short_course_modules") {
      setModules((prev) => prev.filter((item) => item.id !== id));
      setLessons((prev) => prev.filter((item) => item.module_id !== id));
    }

    if (tableName === "short_course_lessons") {
      setLessons((prev) => prev.filter((item) => item.id !== id));
    }

    if (tableName === "short_course_quizzes") {
      setQuizzes((prev) => prev.filter((item) => item.id !== id));
    }

    if (tableName === "short_course_projects") {
      setProjects((prev) => prev.filter((item) => item.id !== id));
    }

    if (tableName === "short_course_tests") {
      setTests((prev) => prev.filter((item) => item.id !== id));
    }

    pushStatus("success", successMessage);

    recordAdminActivity({
      actionType: `${targetType}_deleted`,
      targetType,
      targetId: String(id),
      description: `Deleted ${targetType} ${title ? `(${title})` : ""}`,
    });
  };

  const submitAnnouncement = async (event) => {
    event.preventDefault();

    if (!hasPermission("manageAnnouncements")) {
      pushStatus("error", "You do not have permission to manage announcements.");
      return;
    }

    if (!supportsAnnouncements) {
      pushStatus(
        "info",
        "Announcement storage is unavailable until the new migration is applied."
      );
      return;
    }

    const trimmedTitle = announcementDraft.title.trim();
    const trimmedMessage = announcementDraft.message.trim();

    if (!trimmedTitle || !trimmedMessage) {
      pushStatus("error", "Announcement title and message are required.");
      return;
    }

    const payload = {
      title: trimmedTitle,
      message: trimmedMessage,
      audience: announcementDraft.audience,
      status: announcementDraft.status,
      expires_at: announcementDraft.expiresAt || null,
      created_by: user?.id || null,
    };

    let response;
    if (editingAnnouncementId) {
      response = await supabase
        .from("admin_announcements")
        .update(payload)
        .eq("id", editingAnnouncementId)
        .select(
          "id, title, message, audience, status, expires_at, created_at, updated_at, created_by"
        )
        .maybeSingle();
    } else {
      response = await supabase
        .from("admin_announcements")
        .insert([payload])
        .select(
          "id, title, message, audience, status, expires_at, created_at, updated_at, created_by"
        )
        .maybeSingle();
    }

    if (response.error || !response.data) {
      pushStatus("error", response.error?.message || "Unable to save announcement.");
      return;
    }

    const savedAnnouncement = response.data;

    if (editingAnnouncementId) {
      setAnnouncements((prev) =>
        prev.map((item) => (item.id === savedAnnouncement.id ? savedAnnouncement : item))
      );
      pushStatus("success", "Announcement updated.");
      recordAdminActivity({
        actionType: "announcement_updated",
        targetType: "announcement",
        targetId: String(savedAnnouncement.id),
        description: `Updated announcement ${savedAnnouncement.title}`,
      });
    } else {
      setAnnouncements((prev) => [savedAnnouncement, ...prev]);
      pushStatus("success", "Announcement published.");
      recordAdminActivity({
        actionType: "announcement_created",
        targetType: "announcement",
        targetId: String(savedAnnouncement.id),
        description: `Created announcement ${savedAnnouncement.title}`,
      });
    }

    setAnnouncementDraft(DEFAULT_ANNOUNCEMENT_DRAFT);
    setEditingAnnouncementId(null);
  };

  const updateAnnouncementStatus = async (announcementRow, nextStatus) => {
    if (!hasPermission("manageAnnouncements")) {
      pushStatus("error", "You do not have permission to manage announcements.");
      return;
    }

    if (!supportsAnnouncements) {
      pushStatus(
        "info",
        "Announcement storage is unavailable until the new migration is applied."
      );
      return;
    }

    const { error } = await supabase
      .from("admin_announcements")
      .update({ status: nextStatus })
      .eq("id", announcementRow.id);

    if (error) {
      pushStatus("error", error.message || "Unable to update announcement status.");
      return;
    }

    setAnnouncements((prev) =>
      prev.map((item) => (item.id === announcementRow.id ? { ...item, status: nextStatus } : item))
    );

    pushStatus("success", `Announcement moved to ${nextStatus}.`);

    recordAdminActivity({
      actionType: "announcement_status_changed",
      targetType: "announcement",
      targetId: String(announcementRow.id),
      description: `Announcement ${announcementRow.title} status changed to ${nextStatus}`,
      metadata: {
        previousStatus: announcementRow.status,
        nextStatus,
      },
    });
  };

  const deleteAnnouncement = async (announcementRow) => {
    if (!hasPermission("manageAnnouncements")) {
      pushStatus("error", "You do not have permission to manage announcements.");
      return;
    }

    if (!supportsAnnouncements) {
      pushStatus(
        "info",
        "Announcement storage is unavailable until the new migration is applied."
      );
      return;
    }

    const confirmed = window.confirm("Delete this announcement permanently?");
    if (!confirmed) return;

    const { error } = await supabase
      .from("admin_announcements")
      .delete()
      .eq("id", announcementRow.id);

    if (error) {
      pushStatus("error", error.message || "Unable to delete announcement.");
      return;
    }

    setAnnouncements((prev) => prev.filter((item) => item.id !== announcementRow.id));
    pushStatus("success", "Announcement deleted.");

    recordAdminActivity({
      actionType: "announcement_deleted",
      targetType: "announcement",
      targetId: String(announcementRow.id),
      description: `Deleted announcement ${announcementRow.title}`,
    });
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-gray-100">
        Loading admin command center...
      </div>
    );
  }

  return (
    <section className="admin-shell">
      <div className="admin-hero">
        <div>
          <nav className="admin-breadcrumb">
            <Link to="/" className="admin-link">
              Home
            </Link>
            <span>/</span>
            <span>Admin</span>
          </nav>
          <h1>Marota LMS Admin Command Center</h1>
          <p>
            Real-time operations for admissions, learner success, curriculum delivery, and
            platform governance.
          </p>
          <div className="admin-hero-meta">
            <span className="pill pill-info">Role: {normalizeRole(role)}</span>
            <span className="pill pill-neutral">{availableTabs.length} workspaces enabled</span>
            <span className="pill pill-neutral">{platformStats.pending} pending approvals</span>
          </div>
        </div>

        <div className="admin-hero-actions">
          <button
            type="button"
            className="btn-icon admin-action-btn"
            onClick={loadAdminData}
            aria-label="Refresh admin data"
          >
            <FaSyncAlt />
            Refresh
          </button>
          <button
            type="button"
            className="btn-icon admin-action-btn"
            onClick={approveAllVisiblePending}
            disabled={bulkApproving || pendingAdmissions.length === 0 || !supportsApprovalStatus}
            aria-label="Approve all visible pending admissions"
          >
            <FaCheck />
            {bulkApproving ? "Approving..." : `Approve Visible (${pendingAdmissions.length})`}
          </button>
          <Link to="/" className="admin-action-link">
            <FaHome /> Back to Home
          </Link>
        </div>
      </div>

      {statusMessage && (
        <div className={`admin-status ${statusMessage.type || "info"}`}>{statusMessage.text}</div>
      )}

      <div className="admin-kpi-grid">
        <article className="admin-kpi-card">
          <div className="admin-kpi-label">Registered Users</div>
          <div className="admin-kpi-value">{platformStats.users}</div>
          <div className="admin-kpi-sub">+{platformStats.newUsers7d} in last 7 days</div>
        </article>
        <article className="admin-kpi-card">
          <div className="admin-kpi-label">Admissions Queue</div>
          <div className="admin-kpi-value">{platformStats.pending}</div>
          <div className="admin-kpi-sub">{platformStats.approved} approved / {platformStats.rejected} rejected</div>
        </article>
        <article className="admin-kpi-card">
          <div className="admin-kpi-label">Avg Learning Progress</div>
          <div className="admin-kpi-value">{platformStats.averageProgress}%</div>
          <div className="admin-kpi-sub">Across approved enrollments</div>
        </article>
        <article className="admin-kpi-card">
          <div className="admin-kpi-label">Course Ratings</div>
          <div className="admin-kpi-value">{platformStats.averageRating || 0}</div>
          <div className="admin-kpi-sub">from {platformStats.ratings} reviews</div>
        </article>
        <article className="admin-kpi-card">
          <div className="admin-kpi-label">Payment Uploads</div>
          <div className="admin-kpi-value">{platformStats.paymentUploads}</div>
          <div className="admin-kpi-sub">Evidence files submitted</div>
        </article>
        <article className="admin-kpi-card">
          <div className="admin-kpi-label">Admin Staff</div>
          <div className="admin-kpi-value">{platformStats.admins}</div>
          <div className="admin-kpi-sub">Role-based access enabled</div>
        </article>
      </div>

      <div className="admin-tab-row">
        {availableTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              className={`btn-icon admin-tab-btn ${isActive ? "active" : ""}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <Icon />
              {tab.label}
            </button>
          );
        })}
      </div>

      {activeTab === "overview" && (
        <div className="admin-grid-two">
          <section className="admin-panel">
            <div className="admin-panel-head">
              <h2>Operations Pulse</h2>
              <span className="panel-chip">
                <FaRegClock /> Updated {relativeAgeLabel(new Date().toISOString())}
              </span>
            </div>
            <div className="admin-overview-metrics">
              <div className="metric-row">
                <span>Applications this week</span>
                <strong>{platformStats.applications7d}</strong>
              </div>
              <div className="metric-row">
                <span>Delayed admissions (&gt;48h)</span>
                <strong>{delayedAdmissions.length}</strong>
              </div>
              <div className="metric-row">
                <span>Curriculum modules</span>
                <strong>{modules.length}</strong>
              </div>
              <div className="metric-row">
                <span>Announcements live</span>
                <strong>
                  {
                    announcements.filter(
                      (item) =>
                        item.status === "published" &&
                        (!item.expires_at || new Date(item.expires_at).getTime() > Date.now())
                    ).length
                  }
                </strong>
              </div>
            </div>

            <div className="risk-list">
              {accessRisks.map((risk) => (
                <div key={risk.id} className={`risk-card severity-${risk.severity}`}>
                  <div className="risk-icon">
                    <FaExclamationTriangle />
                  </div>
                  <div>
                    <p>{risk.title}</p>
                    <strong>{risk.value}</strong>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="admin-panel">
            <div className="admin-panel-head">
              <h2>Course Health Leaderboard</h2>
              <span className="panel-chip">Top {Math.min(courseOverview.length, 8)} courses</span>
            </div>

            {courseOverview.length === 0 ? (
              <p className="empty-text">No course activity yet.</p>
            ) : (
              <div className="admin-list">
                {courseOverview.slice(0, 8).map((course) => {
                  const adoptionCount = course.approved + course.pending + course.rejected;
                  const fillWidth = Math.round((adoptionCount / highestEnrollmentCount) * 100);
                  return (
                    <article key={course.key} className="list-item">
                      <div className="list-item-top">
                        <div>
                          <h3>{course.title}</h3>
                          <p>{course.scope || "Course"}</p>
                        </div>
                        <span className="pill pill-neutral">{adoptionCount} learners</span>
                      </div>

                      <div className="course-bar-track">
                        <div className="course-bar-fill" style={{ width: `${fillWidth}%` }} />
                      </div>

                      <div className="course-stats-row">
                        <span className="pill status-approved">Approved {course.approved}</span>
                        <span className="pill status-pending">Pending {course.pending}</span>
                        <span className="pill status-rejected">Rejected {course.rejected}</span>
                        <span className="pill pill-neutral">Progress {course.averageProgress}%</span>
                        <span className="pill pill-neutral">Rating {course.averageRating || 0}</span>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      )}

      {activeTab === "learners" && (
        <section className="admin-panel">
          <div className="admin-panel-head">
            <h2>Learner Management</h2>
            <span className="panel-chip">{filteredLearners.length} learners visible</span>
          </div>

          <div className="filter-grid">
            <label>
              <span>
                <FaSearch /> Search
              </span>
              <input
                type="text"
                value={learnerQuery}
                onChange={(event) => setLearnerQuery(event.target.value)}
                placeholder="Search by name or profile id"
              />
            </label>

            <label>
              <span>
                <FaFilter /> Role
              </span>
              <select
                value={learnerRoleFilter}
                onChange={(event) => setLearnerRoleFilter(event.target.value)}
              >
                <option value="all">All roles</option>
                {ADMIN_ROLE_CHOICES.map((roleOption) => (
                  <option key={roleOption} value={roleOption}>
                    {roleOption}
                  </option>
                ))}
              </select>
            </label>

            <label>
              <span>
                <FaChartLine /> Sort by
              </span>
              <select value={learnerSort} onChange={(event) => setLearnerSort(event.target.value)}>
                <option value="recent">Recently added</option>
                <option value="name">Name</option>
                <option value="progress">Progress</option>
                <option value="risk">Risk score</option>
              </select>
            </label>
          </div>

          {!isMasterAdmin && (
            <p className="warning-note">
              Role updates are locked for non-master admins. Sign in with a
              <strong> master_admin </strong>
              or <strong>owner</strong> account.
            </p>
          )}

          {filteredLearners.length === 0 ? (
            <p className="empty-text">No learners match this filter.</p>
          ) : (
            <div className="admin-list">
              {filteredLearners.map((row) => {
                const profileRow = row.profile;
                const currentRole = normalizeRole(profileRow.role || "student");
                const selectedRole = roleSelections[profileRow.id] || currentRole;
                const profileName = getProfileName(profileRow, profileRow.id);
                const isSelf = profileRow.id === user?.id;

                return (
                  <article key={profileRow.id} className="list-item learner-row">
                    <div className="list-item-top">
                      <div>
                        <h3>{profileName}</h3>
                        <p>{String(profileRow.id).slice(0, 8)}...</p>
                      </div>
                      <div className="course-stats-row">
                        <span className="pill status-approved">Approved {row.approvedCount}</span>
                        <span className="pill status-pending">Pending {row.pendingCount}</span>
                        <span className="pill status-rejected">Rejected {row.rejectedCount}</span>
                        <span className="pill pill-neutral">Avg {row.averageProgress}%</span>
                        <span className="pill pill-neutral">Risk {row.riskScore}</span>
                      </div>
                    </div>

                    <div className="learner-action-row">
                      <label>
                        <span>Role</span>
                        <select
                          disabled={!isMasterAdmin}
                          value={selectedRole}
                          onChange={(event) =>
                            setRoleSelections((prev) => ({
                              ...prev,
                              [profileRow.id]: event.target.value,
                            }))
                          }
                        >
                          {ADMIN_ROLE_CHOICES.map((roleOption) => (
                            <option key={roleOption} value={roleOption}>
                              {roleOption}
                            </option>
                          ))}
                        </select>
                      </label>

                      <button
                        type="button"
                        className="btn-icon admin-inline-btn"
                        disabled={
                          updatingRoleFor === profileRow.id ||
                          isSelf ||
                          selectedRole === currentRole ||
                          !isMasterAdmin ||
                          !hasPermission("manageRoles")
                        }
                        onClick={() => updateUserRole(profileRow, selectedRole)}
                      >
                        <FaUserShield />
                        {updatingRoleFor === profileRow.id ? "Updating..." : "Apply Role"}
                      </button>

                      <div className="learner-meta">
                        <span>Joined: {formatDateTime(profileRow.created_at)}</span>
                        <span>Latest activity: {row.latestActivity ? relativeAgeLabel(row.latestActivity) : "none"}</span>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      )}

      {activeTab === "admissions" && (
        <section className="admin-panel">
          <div className="admin-panel-head">
            <h2>Admissions and Payment Verification</h2>
            <span className="panel-chip">{filteredAdmissions.length} applications visible</span>
          </div>

          {!supportsApprovalStatus && (
            <p className="warning-note">
              Apply the enrollment approval migration to enable full approval controls.
            </p>
          )}
          {!supportsPaymentEvidence && (
            <p className="warning-note">
              Payment evidence fields are unavailable in your current schema.
            </p>
          )}

          <div className="filter-grid">
            <label>
              <span>
                <FaSearch /> Search
              </span>
              <input
                type="text"
                value={admissionQuery}
                onChange={(event) => setAdmissionQuery(event.target.value)}
                placeholder="Search learner or course"
              />
            </label>

            <label>
              <span>
                <FaFilter /> Status
              </span>
              <select
                value={admissionStatusFilter}
                onChange={(event) => setAdmissionStatusFilter(event.target.value)}
              >
                {ADMISSION_STATUS_OPTIONS.map((statusOption) => (
                  <option key={statusOption} value={statusOption}>
                    {statusOption}
                  </option>
                ))}
              </select>
            </label>

            <label>
              <span>
                <FaWallet /> Payment method
              </span>
              <select
                value={paymentMethodFilter}
                onChange={(event) => setPaymentMethodFilter(event.target.value)}
              >
                <option value="all">All methods</option>
                <option value="cbe">cbe</option>
                <option value="telebirr">telebirr</option>
                <option value="boa">boa</option>
                <option value="mpesa">mpesa</option>
                <option value="awash">awash</option>
                <option value="dashen">dashen</option>
              </select>
            </label>
          </div>

          <div className="admin-list">
            {filteredAdmissions.length === 0 ? (
              <p className="empty-text">No applications found for the current filter.</p>
            ) : (
              filteredAdmissions.map((enrollmentRow) => {
                const parsed = parseCourseIdentity(enrollmentRow.course_title);
                const profileRow = profileMap.get(enrollmentRow.user_id);
                const status = enrollmentRow.approval_status || "approved";
                const isUpdating = updatingApplicationFor === String(enrollmentRow.id);

                return (
                  <article key={enrollmentRow.id} className="list-item">
                    <div className="list-item-top">
                      <div>
                        <h3>{parsed.title}</h3>
                        <p>{parsed.scope || "Course"}</p>
                      </div>
                      <div className="course-stats-row">
                        <span className={`pill ${statusBadgeClass(status)}`}>{status}</span>
                        <span className="pill pill-neutral">Progress {enrollmentRow.progress || 0}%</span>
                        <span className="pill pill-neutral">
                          {formatDateTime(enrollmentRow.created_at)}
                        </span>
                      </div>
                    </div>

                    <div className="admission-grid">
                      <div>
                        <p>
                          <strong>Learner:</strong> {getProfileName(profileRow, enrollmentRow.user_id)}
                        </p>
                        <p>
                          <strong>User ID:</strong> {String(enrollmentRow.user_id).slice(0, 8)}...
                        </p>
                      </div>

                      <div>
                        <p>
                          <strong>Method:</strong> {enrollmentRow.payment_method || "-"}
                        </p>
                        <p>
                          <strong>Sender:</strong> {enrollmentRow.payment_sender_name || "-"}
                        </p>
                        <p>
                          <strong>Reference:</strong> {enrollmentRow.payment_reference || "-"}
                        </p>
                      </div>

                      <div className="admission-actions">
                        <button
                          type="button"
                          className="btn-icon admin-inline-btn"
                          disabled={
                            !enrollmentRow.receipt_path ||
                            openingReceiptFor === String(enrollmentRow.id) ||
                            !supportsPaymentEvidence
                          }
                          onClick={() => openEnrollmentReceipt(enrollmentRow)}
                        >
                          <FaWallet />
                          {openingReceiptFor === String(enrollmentRow.id)
                            ? "Opening..."
                            : "View Receipt"}
                        </button>

                        <button
                          type="button"
                          className="btn-icon admin-inline-btn"
                          disabled={isUpdating || !supportsApprovalStatus || status === "approved"}
                          onClick={() => updateEnrollmentStatus(enrollmentRow, "approved")}
                        >
                          <FaCheck /> Approve
                        </button>

                        <button
                          type="button"
                          className="btn-icon admin-inline-btn danger"
                          disabled={isUpdating || !supportsApprovalStatus || status === "rejected"}
                          onClick={() => updateEnrollmentStatus(enrollmentRow, "rejected")}
                        >
                          <FaTrash /> Reject
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })
            )}
          </div>
        </section>
      )}

      {activeTab === "curriculum" && (
        <div className="admin-grid-two">
          <section className="admin-panel">
            <div className="admin-panel-head">
              <h2>Module Studio</h2>
              <span className="panel-chip">{modulesForCourse.length} modules</span>
            </div>

            {!supportsCurriculum && (
              <p className="warning-note">
                Curriculum tables are unavailable. Apply short course curriculum migrations.
              </p>
            )}

            <label className="full-width-control">
              <span>Course</span>
              <select
                value={curriculumCourseKey}
                onChange={(event) => setCurriculumCourseKey(event.target.value)}
              >
                {allCourseKeys.map((course) => (
                  <option key={course.key} value={course.key}>
                    {course.label} ({course.scope})
                  </option>
                ))}
              </select>
            </label>

            <form className="form-grid" onSubmit={submitModule}>
              <label>
                <span>Module title</span>
                <input
                  type="text"
                  value={moduleDraft.title}
                  onChange={(event) =>
                    setModuleDraft((prev) => ({ ...prev, title: event.target.value }))
                  }
                  placeholder="Module 1: Foundations"
                />
              </label>

              <label>
                <span>Sort order</span>
                <input
                  type="number"
                  min="1"
                  value={moduleDraft.sortOrder}
                  onChange={(event) =>
                    setModuleDraft((prev) => ({ ...prev, sortOrder: event.target.value }))
                  }
                />
              </label>

              <label className="span-2">
                <span>Description</span>
                <textarea
                  rows="3"
                  value={moduleDraft.description}
                  onChange={(event) =>
                    setModuleDraft((prev) => ({ ...prev, description: event.target.value }))
                  }
                  placeholder="What learners should achieve in this module"
                />
              </label>

              <div className="form-actions span-2">
                <button type="submit" className="btn-icon admin-inline-btn">
                  <FaPlus /> {editingModuleId ? "Update Module" : "Create Module"}
                </button>
                {editingModuleId && (
                  <button
                    type="button"
                    className="btn-icon admin-inline-btn"
                    onClick={() => {
                      setEditingModuleId(null);
                      setModuleDraft(DEFAULT_MODULE_DRAFT);
                    }}
                  >
                    Cancel edit
                  </button>
                )}
              </div>
            </form>

            <div className="admin-list compact">
              {modulesForCourse.length === 0 ? (
                <p className="empty-text">No modules for this course yet.</p>
              ) : (
                modulesForCourse.map((moduleRow) => (
                  <article key={moduleRow.id} className="list-item">
                    <div className="list-item-top">
                      <div>
                        <h3>{moduleRow.title}</h3>
                        <p>{moduleRow.description || "No description"}</p>
                      </div>
                      <span className="pill pill-neutral">Order {moduleRow.sort_order}</span>
                    </div>

                    <div className="course-stats-row">
                      <button
                        type="button"
                        className="btn-icon admin-inline-btn"
                        onClick={() => {
                          setEditingModuleId(moduleRow.id);
                          setModuleDraft({
                            title: moduleRow.title || "",
                            description: moduleRow.description || "",
                            sortOrder: String(moduleRow.sort_order || 1),
                          });
                        }}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        className="btn-icon admin-inline-btn danger"
                        onClick={() =>
                          removeByTable({
                            tableName: "short_course_modules",
                            id: moduleRow.id,
                            successMessage: "Module deleted.",
                            targetType: "module",
                            title: moduleRow.title,
                          })
                        }
                      >
                        Delete
                      </button>
                    </div>
                  </article>
                ))
              )}
            </div>
          </section>

          <section className="admin-panel">
            <div className="admin-panel-head">
              <h2>Lesson Builder</h2>
              <span className="panel-chip">{lessonsForCourse.length} lessons</span>
            </div>

            <form className="form-grid" onSubmit={submitLesson}>
              <label>
                <span>Module</span>
                <select
                  value={lessonDraft.moduleId}
                  onChange={(event) =>
                    setLessonDraft((prev) => ({ ...prev, moduleId: event.target.value }))
                  }
                >
                  <option value="">Select module</option>
                  {modulesForCourse.map((moduleRow) => (
                    <option key={moduleRow.id} value={moduleRow.id}>
                      {moduleRow.title}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                <span>Sort order</span>
                <input
                  type="number"
                  min="1"
                  value={lessonDraft.sortOrder}
                  onChange={(event) =>
                    setLessonDraft((prev) => ({ ...prev, sortOrder: event.target.value }))
                  }
                />
              </label>

              <label className="span-2">
                <span>Lesson title</span>
                <input
                  type="text"
                  value={lessonDraft.title}
                  onChange={(event) =>
                    setLessonDraft((prev) => ({ ...prev, title: event.target.value }))
                  }
                />
              </label>

              <label className="span-2">
                <span>Summary</span>
                <textarea
                  rows="3"
                  value={lessonDraft.summary}
                  onChange={(event) =>
                    setLessonDraft((prev) => ({ ...prev, summary: event.target.value }))
                  }
                />
              </label>

              <label>
                <span>Video URL</span>
                <input
                  type="url"
                  value={lessonDraft.videoUrl}
                  onChange={(event) =>
                    setLessonDraft((prev) => ({ ...prev, videoUrl: event.target.value }))
                  }
                />
              </label>

              <label>
                <span>Documentation URL</span>
                <input
                  type="url"
                  value={lessonDraft.documentationUrl}
                  onChange={(event) =>
                    setLessonDraft((prev) => ({ ...prev, documentationUrl: event.target.value }))
                  }
                />
              </label>

              <label className="span-2">
                <span>Review URL</span>
                <input
                  type="url"
                  value={lessonDraft.reviewUrl}
                  onChange={(event) =>
                    setLessonDraft((prev) => ({ ...prev, reviewUrl: event.target.value }))
                  }
                />
              </label>

              <div className="form-actions span-2">
                <button type="submit" className="btn-icon admin-inline-btn">
                  <FaPlus /> {editingLessonId ? "Update Lesson" : "Create Lesson"}
                </button>
                {editingLessonId && (
                  <button
                    type="button"
                    className="btn-icon admin-inline-btn"
                    onClick={() => {
                      setEditingLessonId(null);
                      setLessonDraft((prev) => ({
                        ...DEFAULT_LESSON_DRAFT,
                        moduleId: prev.moduleId,
                      }));
                    }}
                  >
                    Cancel edit
                  </button>
                )}
              </div>
            </form>

            <div className="admin-list compact">
              {lessonsForCourse.length === 0 ? (
                <p className="empty-text">No lessons for this course yet.</p>
              ) : (
                lessonsForCourse.map((lessonRow) => {
                  const parentModule = modulesForCourse.find(
                    (moduleRow) => moduleRow.id === lessonRow.module_id
                  );

                  return (
                    <article key={lessonRow.id} className="list-item">
                      <div className="list-item-top">
                        <div>
                          <h3>{lessonRow.title}</h3>
                          <p>{parentModule?.title || "Unknown module"}</p>
                        </div>
                        <span className="pill pill-neutral">Order {lessonRow.sort_order}</span>
                      </div>

                      <div className="course-stats-row">
                        <button
                          type="button"
                          className="btn-icon admin-inline-btn"
                          onClick={() => {
                            setEditingLessonId(lessonRow.id);
                            setLessonDraft({
                              moduleId: String(lessonRow.module_id || ""),
                              title: lessonRow.title || "",
                              summary: lessonRow.summary || "",
                              videoUrl: lessonRow.video_url || "",
                              documentationUrl: lessonRow.documentation_url || "",
                              reviewUrl: lessonRow.external_review_url || "",
                              sortOrder: String(lessonRow.sort_order || 1),
                            });
                          }}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className="btn-icon admin-inline-btn danger"
                          onClick={() =>
                            removeByTable({
                              tableName: "short_course_lessons",
                              id: lessonRow.id,
                              successMessage: "Lesson deleted.",
                              targetType: "lesson",
                              title: lessonRow.title,
                            })
                          }
                        >
                          Delete
                        </button>
                      </div>
                    </article>
                  );
                })
              )}
            </div>
          </section>
        </div>
      )}

      {activeTab === "assessments" && (
        <div className="admin-grid-two">
          <section className="admin-panel">
            <div className="admin-panel-head">
              <h2>Quiz and Project Manager</h2>
              <span className="panel-chip">
                {quizzesForCourse.length + projectsForCourse.length} items
              </span>
            </div>

            {!supportsAssessmentLinks && (
              <p className="warning-note">
                Assessment link columns are partially unavailable in this schema version.
              </p>
            )}

            <label className="full-width-control">
              <span>Course</span>
              <select
                value={curriculumCourseKey}
                onChange={(event) => setCurriculumCourseKey(event.target.value)}
              >
                {allCourseKeys.map((course) => (
                  <option key={course.key} value={course.key}>
                    {course.label} ({course.scope})
                  </option>
                ))}
              </select>
            </label>

            <form className="form-grid" onSubmit={submitQuiz}>
              <h3 className="form-heading span-2">Quiz</h3>
              <label>
                <span>Module (optional)</span>
                <select
                  value={quizDraft.moduleId}
                  onChange={(event) =>
                    setQuizDraft((prev) => ({ ...prev, moduleId: event.target.value }))
                  }
                >
                  <option value="">None</option>
                  {modulesForCourse.map((moduleRow) => (
                    <option key={moduleRow.id} value={moduleRow.id}>
                      {moduleRow.title}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                <span>Sort order</span>
                <input
                  type="number"
                  min="1"
                  value={quizDraft.sortOrder}
                  onChange={(event) =>
                    setQuizDraft((prev) => ({ ...prev, sortOrder: event.target.value }))
                  }
                />
              </label>
              <label className="span-2">
                <span>Title</span>
                <input
                  type="text"
                  value={quizDraft.title}
                  onChange={(event) =>
                    setQuizDraft((prev) => ({ ...prev, title: event.target.value }))
                  }
                />
              </label>
              <label>
                <span>Question count</span>
                <input
                  type="number"
                  min="1"
                  value={quizDraft.questionCount}
                  onChange={(event) =>
                    setQuizDraft((prev) => ({ ...prev, questionCount: event.target.value }))
                  }
                />
              </label>
              <label>
                <span>Pass score %</span>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={quizDraft.passScore}
                  onChange={(event) =>
                    setQuizDraft((prev) => ({ ...prev, passScore: event.target.value }))
                  }
                />
              </label>
              <label className="span-2">
                <span>Description</span>
                <textarea
                  rows="2"
                  value={quizDraft.description}
                  onChange={(event) =>
                    setQuizDraft((prev) => ({ ...prev, description: event.target.value }))
                  }
                />
              </label>
              <label>
                <span>Quiz URL</span>
                <input
                  type="url"
                  value={quizDraft.quizUrl}
                  onChange={(event) =>
                    setQuizDraft((prev) => ({ ...prev, quizUrl: event.target.value }))
                  }
                />
              </label>
              <label>
                <span>Review URL</span>
                <input
                  type="url"
                  value={quizDraft.reviewUrl}
                  onChange={(event) =>
                    setQuizDraft((prev) => ({ ...prev, reviewUrl: event.target.value }))
                  }
                />
              </label>
              <div className="form-actions span-2">
                <button type="submit" className="btn-icon admin-inline-btn">
                  <FaPlus /> {editingQuizId ? "Update Quiz" : "Create Quiz"}
                </button>
                {editingQuizId && (
                  <button
                    type="button"
                    className="btn-icon admin-inline-btn"
                    onClick={() => {
                      setEditingQuizId(null);
                      setQuizDraft((prev) => ({
                        ...DEFAULT_QUIZ_DRAFT,
                        moduleId: prev.moduleId,
                      }));
                    }}
                  >
                    Cancel edit
                  </button>
                )}
              </div>
            </form>

            <form className="form-grid" onSubmit={submitProject}>
              <h3 className="form-heading span-2">Project</h3>
              <label>
                <span>Sort order</span>
                <input
                  type="number"
                  min="1"
                  value={projectDraft.sortOrder}
                  onChange={(event) =>
                    setProjectDraft((prev) => ({ ...prev, sortOrder: event.target.value }))
                  }
                />
              </label>
              <label className="span-2">
                <span>Title</span>
                <input
                  type="text"
                  value={projectDraft.title}
                  onChange={(event) =>
                    setProjectDraft((prev) => ({ ...prev, title: event.target.value }))
                  }
                />
              </label>
              <label className="span-2">
                <span>Description</span>
                <textarea
                  rows="2"
                  value={projectDraft.description}
                  onChange={(event) =>
                    setProjectDraft((prev) => ({ ...prev, description: event.target.value }))
                  }
                />
              </label>
              <label className="span-2">
                <span>Submission instructions</span>
                <textarea
                  rows="2"
                  value={projectDraft.submissionInstruction}
                  onChange={(event) =>
                    setProjectDraft((prev) => ({
                      ...prev,
                      submissionInstruction: event.target.value,
                    }))
                  }
                />
              </label>
              <label>
                <span>Project brief URL</span>
                <input
                  type="url"
                  value={projectDraft.projectBriefUrl}
                  onChange={(event) =>
                    setProjectDraft((prev) => ({ ...prev, projectBriefUrl: event.target.value }))
                  }
                />
              </label>
              <label>
                <span>Review URL</span>
                <input
                  type="url"
                  value={projectDraft.reviewUrl}
                  onChange={(event) =>
                    setProjectDraft((prev) => ({ ...prev, reviewUrl: event.target.value }))
                  }
                />
              </label>
              <div className="form-actions span-2">
                <button type="submit" className="btn-icon admin-inline-btn">
                  <FaPlus /> {editingProjectId ? "Update Project" : "Create Project"}
                </button>
                {editingProjectId && (
                  <button
                    type="button"
                    className="btn-icon admin-inline-btn"
                    onClick={() => {
                      setEditingProjectId(null);
                      setProjectDraft(DEFAULT_PROJECT_DRAFT);
                    }}
                  >
                    Cancel edit
                  </button>
                )}
              </div>
            </form>
          </section>

          <section className="admin-panel">
            <div className="admin-panel-head">
              <h2>Test and Assessment Inventory</h2>
              <span className="panel-chip">{testsForCourse.length} tests</span>
            </div>

            <form className="form-grid" onSubmit={submitTest}>
              <h3 className="form-heading span-2">Test</h3>
              <label>
                <span>Sort order</span>
                <input
                  type="number"
                  min="1"
                  value={testDraft.sortOrder}
                  onChange={(event) =>
                    setTestDraft((prev) => ({ ...prev, sortOrder: event.target.value }))
                  }
                />
              </label>
              <label>
                <span>Duration (minutes)</span>
                <input
                  type="number"
                  min="1"
                  value={testDraft.durationMinutes}
                  onChange={(event) =>
                    setTestDraft((prev) => ({ ...prev, durationMinutes: event.target.value }))
                  }
                />
              </label>
              <label>
                <span>Pass score %</span>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={testDraft.passScore}
                  onChange={(event) =>
                    setTestDraft((prev) => ({ ...prev, passScore: event.target.value }))
                  }
                />
              </label>
              <label className="span-2">
                <span>Title</span>
                <input
                  type="text"
                  value={testDraft.title}
                  onChange={(event) =>
                    setTestDraft((prev) => ({ ...prev, title: event.target.value }))
                  }
                />
              </label>
              <label className="span-2">
                <span>Description</span>
                <textarea
                  rows="2"
                  value={testDraft.description}
                  onChange={(event) =>
                    setTestDraft((prev) => ({ ...prev, description: event.target.value }))
                  }
                />
              </label>
              <label>
                <span>Guide URL</span>
                <input
                  type="url"
                  value={testDraft.testGuideUrl}
                  onChange={(event) =>
                    setTestDraft((prev) => ({ ...prev, testGuideUrl: event.target.value }))
                  }
                />
              </label>
              <label>
                <span>Review URL</span>
                <input
                  type="url"
                  value={testDraft.reviewUrl}
                  onChange={(event) =>
                    setTestDraft((prev) => ({ ...prev, reviewUrl: event.target.value }))
                  }
                />
              </label>
              <div className="form-actions span-2">
                <button type="submit" className="btn-icon admin-inline-btn">
                  <FaPlus /> {editingTestId ? "Update Test" : "Create Test"}
                </button>
                {editingTestId && (
                  <button
                    type="button"
                    className="btn-icon admin-inline-btn"
                    onClick={() => {
                      setEditingTestId(null);
                      setTestDraft(DEFAULT_TEST_DRAFT);
                    }}
                  >
                    Cancel edit
                  </button>
                )}
              </div>
            </form>

            <div className="admin-list compact">
              {[...quizzesForCourse, ...projectsForCourse, ...testsForCourse].length === 0 ? (
                <p className="empty-text">No assessments for this course yet.</p>
              ) : (
                <>
                  {quizzesForCourse.map((quizRow) => (
                    <article key={`quiz-${quizRow.id}`} className="list-item">
                      <div className="list-item-top">
                        <div>
                          <h3>{quizRow.title}</h3>
                          <p>
                            Quiz â€¢ {quizRow.question_count} questions â€¢ pass {quizRow.pass_score}%
                          </p>
                        </div>
                        <span className="pill pill-neutral">Order {quizRow.sort_order}</span>
                      </div>
                      <div className="course-stats-row">
                        <button
                          type="button"
                          className="btn-icon admin-inline-btn"
                          onClick={() => {
                            setEditingQuizId(quizRow.id);
                            setQuizDraft({
                              moduleId: quizRow.module_id ? String(quizRow.module_id) : "",
                              title: quizRow.title || "",
                              description: quizRow.description || "",
                              questionCount: String(quizRow.question_count || 10),
                              passScore: String(quizRow.pass_score || 70),
                              sortOrder: String(quizRow.sort_order || 1),
                              quizUrl: quizRow.quiz_url || "",
                              reviewUrl: quizRow.review_url || "",
                            });
                          }}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className="btn-icon admin-inline-btn danger"
                          onClick={() =>
                            removeByTable({
                              tableName: "short_course_quizzes",
                              id: quizRow.id,
                              successMessage: "Quiz deleted.",
                              targetType: "quiz",
                              title: quizRow.title,
                            })
                          }
                        >
                          Delete
                        </button>
                      </div>
                    </article>
                  ))}

                  {projectsForCourse.map((projectRow) => (
                    <article key={`project-${projectRow.id}`} className="list-item">
                      <div className="list-item-top">
                        <div>
                          <h3>{projectRow.title}</h3>
                          <p>Project</p>
                        </div>
                        <span className="pill pill-neutral">Order {projectRow.sort_order}</span>
                      </div>
                      <div className="course-stats-row">
                        <button
                          type="button"
                          className="btn-icon admin-inline-btn"
                          onClick={() => {
                            setEditingProjectId(projectRow.id);
                            setProjectDraft({
                              title: projectRow.title || "",
                              description: projectRow.description || "",
                              submissionInstruction: projectRow.submission_instruction || "",
                              sortOrder: String(projectRow.sort_order || 1),
                              projectBriefUrl: projectRow.project_brief_url || "",
                              reviewUrl: projectRow.review_url || "",
                            });
                          }}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className="btn-icon admin-inline-btn danger"
                          onClick={() =>
                            removeByTable({
                              tableName: "short_course_projects",
                              id: projectRow.id,
                              successMessage: "Project deleted.",
                              targetType: "project",
                              title: projectRow.title,
                            })
                          }
                        >
                          Delete
                        </button>
                      </div>
                    </article>
                  ))}

                  {testsForCourse.map((testRow) => (
                    <article key={`test-${testRow.id}`} className="list-item">
                      <div className="list-item-top">
                        <div>
                          <h3>{testRow.title}</h3>
                          <p>
                            Test â€¢ {testRow.duration_minutes || 0} min â€¢ pass {testRow.pass_score}%
                          </p>
                        </div>
                        <span className="pill pill-neutral">Order {testRow.sort_order}</span>
                      </div>
                      <div className="course-stats-row">
                        <button
                          type="button"
                          className="btn-icon admin-inline-btn"
                          onClick={() => {
                            setEditingTestId(testRow.id);
                            setTestDraft({
                              title: testRow.title || "",
                              description: testRow.description || "",
                              durationMinutes: String(testRow.duration_minutes || 60),
                              passScore: String(testRow.pass_score || 70),
                              sortOrder: String(testRow.sort_order || 1),
                              testGuideUrl: testRow.test_guide_url || "",
                              reviewUrl: testRow.review_url || "",
                            });
                          }}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className="btn-icon admin-inline-btn danger"
                          onClick={() =>
                            removeByTable({
                              tableName: "short_course_tests",
                              id: testRow.id,
                              successMessage: "Test deleted.",
                              targetType: "test",
                              title: testRow.title,
                            })
                          }
                        >
                          Delete
                        </button>
                      </div>
                    </article>
                  ))}
                </>
              )}
            </div>
          </section>
        </div>
      )}

      {activeTab === "moderation" && (
        <section className="admin-panel">
          <div className="admin-panel-head">
            <h2>Rating Moderation Center</h2>
            <span className="panel-chip">{filteredRatings.length} ratings visible</span>
          </div>

          <div className="filter-grid">
            <label>
              <span>
                <FaSearch /> Search
              </span>
              <input
                type="text"
                value={ratingQuery}
                onChange={(event) => setRatingQuery(event.target.value)}
                placeholder="Search by learner or course"
              />
            </label>

            <label>
              <span>
                <FaStar /> Minimum score
              </span>
              <select value={ratingFloor} onChange={(event) => setRatingFloor(event.target.value)}>
                <option value="all">All scores</option>
                <option value="1">1+</option>
                <option value="2">2+</option>
                <option value="3">3+</option>
                <option value="4">4+</option>
                <option value="5">5 only</option>
              </select>
            </label>
          </div>

          <div className="admin-list">
            {filteredRatings.length === 0 ? (
              <p className="empty-text">No ratings found.</p>
            ) : (
              filteredRatings.map((ratingRow) => {
                const parsed = parseCourseIdentity(ratingRow.course_title);
                const profileRow = profileMap.get(ratingRow.user_id);
                return (
                  <article key={ratingRow.id} className="list-item">
                    <div className="list-item-top">
                      <div>
                        <h3>{parsed.title}</h3>
                        <p>{parsed.scope || "Course"}</p>
                      </div>
                      <span className="pill pill-neutral">{ratingRow.rating}/5</span>
                    </div>

                    <div className="admission-grid">
                      <div>
                        <p>
                          <strong>Learner:</strong> {getProfileName(profileRow, ratingRow.user_id)}
                        </p>
                        <p>
                          <strong>Submitted:</strong> {formatDateTime(ratingRow.created_at)}
                        </p>
                      </div>

                      <div className="admission-actions">
                        <button
                          type="button"
                          className="btn-icon admin-inline-btn danger"
                          disabled={removingRatingFor === String(ratingRow.id)}
                          onClick={() => removeRating(ratingRow)}
                        >
                          <FaTrash />
                          {removingRatingFor === String(ratingRow.id)
                            ? "Removing..."
                            : "Remove Rating"}
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })
            )}
          </div>
        </section>
      )}

      {activeTab === "announcements" && (
        <div className="admin-grid-two">
          <section className="admin-panel">
            <div className="admin-panel-head">
              <h2>Announcement Publisher</h2>
              <span className="panel-chip">{announcements.length} announcements</span>
            </div>

            {!supportsAnnouncements && (
              <p className="warning-note">
                Announcements are disabled until the new admin migration is applied.
              </p>
            )}

            <form className="form-grid" onSubmit={submitAnnouncement}>
              <label className="span-2">
                <span>Title</span>
                <input
                  type="text"
                  value={announcementDraft.title}
                  onChange={(event) =>
                    setAnnouncementDraft((prev) => ({ ...prev, title: event.target.value }))
                  }
                  placeholder="Platform maintenance update"
                />
              </label>

              <label>
                <span>Audience</span>
                <select
                  value={announcementDraft.audience}
                  onChange={(event) =>
                    setAnnouncementDraft((prev) => ({ ...prev, audience: event.target.value }))
                  }
                >
                  {ANNOUNCEMENT_AUDIENCE_OPTIONS.map((audienceOption) => (
                    <option key={audienceOption} value={audienceOption}>
                      {audienceOption}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                <span>Status</span>
                <select
                  value={announcementDraft.status}
                  onChange={(event) =>
                    setAnnouncementDraft((prev) => ({ ...prev, status: event.target.value }))
                  }
                >
                  {ANNOUNCEMENT_STATUS_OPTIONS.map((statusOption) => (
                    <option key={statusOption} value={statusOption}>
                      {statusOption}
                    </option>
                  ))}
                </select>
              </label>

              <label className="span-2">
                <span>Message</span>
                <textarea
                  rows="4"
                  value={announcementDraft.message}
                  onChange={(event) =>
                    setAnnouncementDraft((prev) => ({ ...prev, message: event.target.value }))
                  }
                />
              </label>

              <label className="span-2">
                <span>Expires at (optional)</span>
                <input
                  type="datetime-local"
                  value={announcementDraft.expiresAt}
                  onChange={(event) =>
                    setAnnouncementDraft((prev) => ({ ...prev, expiresAt: event.target.value }))
                  }
                />
              </label>

              <div className="form-actions span-2">
                <button type="submit" className="btn-icon admin-inline-btn">
                  <FaPlus /> {editingAnnouncementId ? "Update Announcement" : "Publish Announcement"}
                </button>
                {editingAnnouncementId && (
                  <button
                    type="button"
                    className="btn-icon admin-inline-btn"
                    onClick={() => {
                      setEditingAnnouncementId(null);
                      setAnnouncementDraft(DEFAULT_ANNOUNCEMENT_DRAFT);
                    }}
                  >
                    Cancel edit
                  </button>
                )}
              </div>
            </form>
          </section>

          <section className="admin-panel">
            <div className="admin-panel-head">
              <h2>Announcement Feed</h2>
              <span className="panel-chip">Recent broadcasts</span>
            </div>

            <div className="admin-list compact">
              {announcements.length === 0 ? (
                <p className="empty-text">No announcements created yet.</p>
              ) : (
                announcements.map((announcementRow) => (
                  <article key={announcementRow.id} className="list-item">
                    <div className="list-item-top">
                      <div>
                        <h3>{announcementRow.title}</h3>
                        <p>
                          {announcementRow.audience} audience â€¢ {formatDateTime(announcementRow.created_at)}
                        </p>
                      </div>
                      <span className={`pill ${statusBadgeClass(announcementRow.status)}`}>
                        {announcementRow.status}
                      </span>
                    </div>

                    <p className="announcement-message">{announcementRow.message}</p>
                    <p className="announcement-meta">
                      Expires: {announcementRow.expires_at ? formatDateTime(announcementRow.expires_at) : "Never"}
                    </p>

                    <div className="course-stats-row">
                      <button
                        type="button"
                        className="btn-icon admin-inline-btn"
                        onClick={() => {
                          setEditingAnnouncementId(announcementRow.id);
                          setAnnouncementDraft({
                            title: announcementRow.title || "",
                            message: announcementRow.message || "",
                            audience: announcementRow.audience || "all",
                            status: announcementRow.status || "published",
                            expiresAt: announcementRow.expires_at
                              ? new Date(announcementRow.expires_at)
                                  .toISOString()
                                  .slice(0, 16)
                              : "",
                          });
                        }}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        className="btn-icon admin-inline-btn"
                        onClick={() =>
                          updateAnnouncementStatus(
                            announcementRow,
                            announcementRow.status === "published" ? "archived" : "published"
                          )
                        }
                      >
                        {announcementRow.status === "published" ? "Archive" : "Publish"}
                      </button>
                      <button
                        type="button"
                        className="btn-icon admin-inline-btn danger"
                        onClick={() => deleteAnnouncement(announcementRow)}
                      >
                        Delete
                      </button>
                    </div>
                  </article>
                ))
              )}
            </div>
          </section>
        </div>
      )}

      {activeTab === "activity" && (
        <section className="admin-panel">
          <div className="admin-panel-head">
            <h2>Admin Activity Timeline</h2>
            <span className="panel-chip">{activityLogs.length} events</span>
          </div>

          {!supportsActivityLogs && (
            <p className="warning-note">
              Persistent activity log table is unavailable. Showing only in-session actions.
            </p>
          )}

          {activityLogs.length === 0 ? (
            <p className="empty-text">No activity captured yet.</p>
          ) : (
            <div className="activity-list">
              {activityLogs.map((activity) => {
                const actorProfile = activity.actor_id ? profileMap.get(activity.actor_id) : null;
                const actorName = actorProfile
                  ? getProfileName(actorProfile)
                  : activity.actor_id === user?.id
                  ? "You"
                  : "Admin";

                return (
                  <article key={activity.id} className="activity-item">
                    <div className="activity-dot" />
                    <div className="activity-body">
                      <div className="activity-top">
                        <strong>{activity.description}</strong>
                        <span>{formatDateTime(activity.created_at)}</span>
                      </div>
                      <p>
                        {actorName} ({activity.actor_role || "admin"}) â€¢ {activity.action_type}
                        {activity.target_type ? ` â€¢ ${activity.target_type}` : ""}
                        {activity.target_id ? `:${activity.target_id}` : ""}
                      </p>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      )}
    </section>
  );
}
