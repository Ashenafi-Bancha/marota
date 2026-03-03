import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { FaHome, FaUsers, FaBook, FaStar } from "react-icons/fa";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "../context/AuthContext";
import {
  isMissingApprovalStatusColumnError,
  withDefaultApprovedStatus,
} from "../utils/enrollmentApproval";
import {
  normalizeCourseIdentity,
  parseCourseIdentity,
} from "../utils/courseIdentity";

export default function AdminDashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [updatingRoleFor, setUpdatingRoleFor] = useState("");
  const [updatingApplicationFor, setUpdatingApplicationFor] = useState("");
  const [openingReceiptFor, setOpeningReceiptFor] = useState("");
  const [removingRatingFor, setRemovingRatingFor] = useState("");
  const [statusMessage, setStatusMessage] = useState(null);
  const [supportsApprovalStatus, setSupportsApprovalStatus] = useState(true);
  const [supportsPaymentEvidence, setSupportsPaymentEvidence] = useState(true);
  const [stats, setStats] = useState({
    users: 0,
    enrollments: 0,
    ratings: 0,
    pendingApplications: 0,
  });
  const [profiles, setProfiles] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [ratings, setRatings] = useState([]);

  const profileMap = useMemo(
    () => new Map(profiles.map((profile) => [profile.id, profile])),
    [profiles]
  );

  const userProgressRows = useMemo(
    () =>
      profiles.map((profile) => {
        const userEnrollments = enrollments.filter(
          (enrollment) => enrollment.user_id === profile.id
        );
        const approvedEnrollments = userEnrollments.filter(
          (enrollment) => (enrollment.approval_status || "approved") === "approved"
        );
        const pendingEnrollments = userEnrollments.filter(
          (enrollment) => (enrollment.approval_status || "approved") === "pending"
        );

        const averageProgress =
          approvedEnrollments.length > 0
            ? Math.round(
                approvedEnrollments.reduce(
                  (sum, item) => sum + (item.progress || 0),
                  0
                ) / approvedEnrollments.length
              )
            : 0;

        return {
          profile,
          courses: userEnrollments,
          approvedCount: approvedEnrollments.length,
          pendingCount: pendingEnrollments.length,
          averageProgress,
        };
      }),
    [profiles, enrollments]
  );

  const pendingApplications = useMemo(
    () =>
      enrollments.filter(
        (enrollment) => (enrollment.approval_status || "approved") === "pending"
      ),
    [enrollments]
  );

  const courseOverview = useMemo(() => {
    const map = new Map();

    enrollments.forEach((item) => {
      const key = normalizeCourseIdentity(item.course_title);
      if (!map.has(key)) {
        const parsed = parseCourseIdentity(key);
        map.set(key, {
          courseTitle: key,
          displayTitle: parsed.title,
          displayScope: parsed.scope,
          approvedUsers: 0,
          pendingUsers: 0,
          ratingsCount: 0,
          ratingsTotal: 0,
        });
      }
      const status = item.approval_status || "approved";
      if (status === "approved") {
        map.get(key).approvedUsers += 1;
      }
      if (status === "pending") {
        map.get(key).pendingUsers += 1;
      }
    });

    ratings.forEach((item) => {
      const key = normalizeCourseIdentity(item.course_title);
      if (!map.has(key)) {
        const parsed = parseCourseIdentity(key);
        map.set(key, {
          courseTitle: key,
          displayTitle: parsed.title,
          displayScope: parsed.scope,
          enrolledUsers: 0,
          ratingsCount: 0,
          ratingsTotal: 0,
          approvedUsers: 0,
          pendingUsers: 0,
        });
      }
      map.get(key).ratingsCount += 1;
      map.get(key).ratingsTotal += item.rating || 0;
    });

    return Array.from(map.values())
      .map((item) => ({
        ...item,
        averageRating:
          item.ratingsCount > 0
            ? Number((item.ratingsTotal / item.ratingsCount).toFixed(1))
            : 0,
      }))
      .sort((first, second) => second.approvedUsers - first.approvedUsers);
  }, [enrollments, ratings]);

  const loadAdminData = useCallback(async () => {
    setLoading(true);
    setStatusMessage(null);

    const enrollmentFieldsWithPayment =
      "id, user_id, course_title, progress, approval_status, created_at, payment_method, payment_account_number, payment_sender_name, payment_reference, payment_uploaded_at, receipt_path";

    const [profilesRes, enrollmentsWithStatusRes, ratingsRes] = await Promise.all([
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
    ]);

    let enrollmentsRes = enrollmentsWithStatusRes;
    let approvalStatusAvailable = true;

    if (isMissingApprovalStatusColumnError(enrollmentsWithStatusRes.error)) {
      const fallbackRes = await supabase
        .from("enrollments")
        .select("id, user_id, course_title, progress, created_at")
        .order("created_at", { ascending: false });

      enrollmentsRes = {
        ...fallbackRes,
        data: withDefaultApprovedStatus(fallbackRes.data),
      };
      approvalStatusAvailable = false;
      setSupportsPaymentEvidence(false);
      setStatusMessage({
        type: "info",
        text: "Enrollment approvals are unavailable until the latest migration is applied.",
      });
    } else if (enrollmentsWithStatusRes.error) {
      const normalizedErrorMessage = String(
        enrollmentsWithStatusRes.error.message || ""
      ).toLowerCase();

      if (
        normalizedErrorMessage.includes("payment_method") ||
        normalizedErrorMessage.includes("receipt_path") ||
        normalizedErrorMessage.includes("payment_uploaded_at")
      ) {
        const fallbackRes = await supabase
          .from("enrollments")
          .select("id, user_id, course_title, progress, approval_status, created_at")
          .order("created_at", { ascending: false });

        enrollmentsRes = fallbackRes;
        setSupportsPaymentEvidence(false);
        setStatusMessage({
          type: "info",
          text: "Payment evidence fields are unavailable until the latest migration is applied.",
        });
      } else {
        setSupportsPaymentEvidence(true);
      }
    } else {
      setSupportsPaymentEvidence(true);
    }

    setSupportsApprovalStatus(approvalStatusAvailable);

    if (profilesRes.error || enrollmentsRes.error || ratingsRes.error) {
      setStatusMessage({
        type: "error",
        text:
          profilesRes.error?.message ||
          enrollmentsRes.error?.message ||
          ratingsRes.error?.message ||
          "Unable to load admin data.",
      });
    }

    setProfiles(profilesRes.data || []);
    setEnrollments(enrollmentsRes.data || []);
    setRatings(ratingsRes.data || []);

    setStats({
      users: profilesRes.data?.length || 0,
      enrollments: enrollmentsRes.data?.length || 0,
      ratings: ratingsRes.data?.length || 0,
      pendingApplications:
        enrollmentsRes.data?.filter(
          (item) => (item.approval_status || "approved") === "pending"
        ).length || 0,
    });

    setLoading(false);
  }, []);

  useEffect(() => {
    loadAdminData();
  }, [loadAdminData]);

  const updateUserRole = async (targetUserId, nextRole) => {
    setUpdatingRoleFor(targetUserId);
    setStatusMessage(null);

    const { error } = await supabase
      .from("profiles")
      .update({ role: nextRole })
      .eq("id", targetUserId);

    if (error) {
      setStatusMessage({ type: "error", text: error.message });
      setUpdatingRoleFor("");
      return;
    }

    setProfiles((prev) =>
      prev.map((item) =>
        item.id === targetUserId ? { ...item, role: nextRole } : item
      )
    );

    setStatusMessage({ type: "success", text: `User role updated to ${nextRole}.` });
    setUpdatingRoleFor("");
  };

  const removeRating = async (ratingId) => {
    setRemovingRatingFor(String(ratingId));
    setStatusMessage(null);

    const { error } = await supabase
      .from("course_ratings")
      .delete()
      .eq("id", ratingId);

    if (error) {
      setStatusMessage({ type: "error", text: error.message });
      setRemovingRatingFor("");
      return;
    }

    setRatings((prev) => prev.filter((item) => item.id !== ratingId));
    setStats((prev) => ({ ...prev, ratings: Math.max(0, prev.ratings - 1) }));
    setStatusMessage({ type: "success", text: "Rating removed successfully." });
    setRemovingRatingFor("");
  };

  const updateEnrollmentStatus = async (enrollmentId, nextStatus) => {
    if (!supportsApprovalStatus) {
      setStatusMessage({
        type: "info",
        text: "Approval actions are unavailable until the enrollment migration is applied.",
      });
      return;
    }

    setUpdatingApplicationFor(String(enrollmentId));
    setStatusMessage(null);

    const { error } = await supabase
      .from("enrollments")
      .update({ approval_status: nextStatus })
      .eq("id", enrollmentId);

    if (error) {
      setStatusMessage({ type: "error", text: error.message });
      setUpdatingApplicationFor("");
      return;
    }

    setEnrollments((prev) =>
      prev.map((item) =>
        item.id === enrollmentId ? { ...item, approval_status: nextStatus } : item
      )
    );

    setStats((prev) => ({
      ...prev,
      pendingApplications: Math.max(
        0,
        nextStatus === "pending"
          ? prev.pendingApplications
          : prev.pendingApplications - 1
      ),
    }));

    setStatusMessage({
      type: "success",
      text:
        nextStatus === "approved"
          ? "Enrollment application approved."
          : "Enrollment application rejected.",
    });
    setUpdatingApplicationFor("");
  };

  const openEnrollmentReceipt = async (application) => {
    if (!application?.receipt_path) {
      setStatusMessage({
        type: "info",
        text: "This application has no receipt uploaded.",
      });
      return;
    }

    setOpeningReceiptFor(String(application.id));
    setStatusMessage(null);

    const { data, error } = await supabase.storage
      .from("enrollment-receipts")
      .createSignedUrl(application.receipt_path, 60 * 30);

    if (error || !data?.signedUrl) {
      setStatusMessage({
        type: "error",
        text: error?.message || "Unable to open receipt for this application.",
      });
      setOpeningReceiptFor("");
      return;
    }

    window.open(data.signedUrl, "_blank", "noopener,noreferrer");
    setOpeningReceiptFor("");
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-gray-200">
        Loading admin dashboard...
      </div>
    );
  }

  return (
    <section className="max-w-6xl mx-auto px-4 py-10 text-white">
      <div className="flex flex-col gap-3 mb-8">
        <nav className="text-sm text-gray-400">
          <Link to="/" className="hover:text-cyan-300">
            Home
          </Link>
          <span className="px-2">/</span>
          <span className="text-gray-200">Admin</span>
        </nav>
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-gray-300">Manage platform overview and monitor key activity.</p>
        <div>
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
              statusMessage.type === "error"
                ? "text-red-400"
                : statusMessage.type === "info"
                ? "text-cyan-300"
                : "text-green-400"
            }`}
          >
            {statusMessage.text}
          </p>
        )}
      </div>

      <div className="grid md:grid-cols-4 gap-4">
        <div className="bg-gray-800 rounded-2xl p-6 shadow-lg">
          <div className="text-cyan-300 text-2xl mb-2">
            <FaUsers />
          </div>
          <p className="text-sm text-gray-400">Registered Users</p>
          <p className="text-3xl font-semibold">{stats.users}</p>
        </div>
        <div className="bg-gray-800 rounded-2xl p-6 shadow-lg">
          <div className="text-cyan-300 text-2xl mb-2">
            <FaBook />
          </div>
          <p className="text-sm text-gray-400">Course Enrollments</p>
          <p className="text-3xl font-semibold">{stats.enrollments}</p>
        </div>
        <div className="bg-gray-800 rounded-2xl p-6 shadow-lg">
          <div className="text-cyan-300 text-2xl mb-2">
            <FaStar />
          </div>
          <p className="text-sm text-gray-400">Course Ratings</p>
          <p className="text-3xl font-semibold">{stats.ratings}</p>
        </div>
        <div className="bg-gray-800 rounded-2xl p-6 shadow-lg">
          <div className="text-cyan-300 text-2xl mb-2">
            <FaBook />
          </div>
          <p className="text-sm text-gray-400">Pending Applications</p>
          <p className="text-3xl font-semibold">{stats.pendingApplications}</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mt-8">
        <div className="bg-gray-800 rounded-2xl p-6 shadow-lg">
          <h2 className="text-xl font-semibold mb-4">User Role Management</h2>
          <div className="space-y-3 max-h-[420px] overflow-auto pr-1">
            {profiles.length === 0 ? (
              <p className="text-sm text-gray-400">No users found.</p>
            ) : (
              profiles.map((profile) => {
                const currentRole = String(profile.role || "student").toLowerCase();
                const isUpdating = updatingRoleFor === profile.id;
                const isSelf = profile.id === user?.id;

                return (
                  <div
                    key={profile.id}
                    className="border border-gray-700 rounded-xl p-3 flex items-center justify-between gap-3"
                  >
                    <div>
                      <p className="font-medium text-white">
                        {profile.full_name || `User ${profile.id.slice(0, 8)}`}
                      </p>
                      <p className="text-xs text-gray-400">ID: {profile.id.slice(0, 8)}...</p>
                      <p className="text-xs text-cyan-300 mt-1">Role: {currentRole}</p>
                    </div>
                    <div className="flex gap-2">
                      {currentRole !== "admin" ? (
                        <button
                          type="button"
                          disabled={isUpdating || isSelf}
                          onClick={() => updateUserRole(profile.id, "admin")}
                          className="px-3 py-1.5 text-xs rounded-lg bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50"
                        >
                          Make Admin
                        </button>
                      ) : (
                        <button
                          type="button"
                          disabled={isUpdating || isSelf}
                          onClick={() => updateUserRole(profile.id, "student")}
                          className="px-3 py-1.5 text-xs rounded-lg bg-gray-700 hover:bg-gray-600 disabled:opacity-50"
                        >
                          Remove Admin
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className="bg-gray-800 rounded-2xl p-6 shadow-lg">
          <h2 className="text-xl font-semibold mb-4">Enrollment Applications</h2>
          {!supportsApprovalStatus && (
            <p className="text-sm text-cyan-300 mb-3">
              Apply the latest database migration to enable approve/reject workflow.
            </p>
          )}
          {!supportsPaymentEvidence && (
            <p className="text-sm text-amber-300 mb-3">
              Payment evidence fields are not available yet. Apply the latest migration.
            </p>
          )}
          <div className="space-y-2 max-h-[420px] overflow-auto pr-1">
            {pendingApplications.length === 0 ? (
              <p className="text-sm text-gray-400">No pending applications.</p>
            ) : (
              pendingApplications.map((application) => {
                const profile = profileMap.get(application.user_id);
                const isUpdating = updatingApplicationFor === String(application.id);

                return (
                  <div
                    key={application.id}
                    className="border border-gray-700 rounded-xl px-3 py-3"
                  >
                    <p className="text-sm text-white font-medium">
                      {parseCourseIdentity(application.course_title).title}
                    </p>
                    <p className="text-xs text-cyan-300 mt-1">
                      {parseCourseIdentity(application.course_title).scope || "Course"}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      Applicant: {profile?.full_name || `User ${String(application.user_id).slice(0, 8)}`}
                    </p>
                    {application.payment_method && (
                      <p className="text-xs text-gray-300 mt-2">
                        Payment: {String(application.payment_method).toUpperCase()} • Account {application.payment_account_number || "-"}
                      </p>
                    )}
                    {application.payment_sender_name && (
                      <p className="text-xs text-gray-300 mt-1">
                        Sender: {application.payment_sender_name}
                      </p>
                    )}
                    {application.payment_reference && (
                      <p className="text-xs text-gray-300 mt-1">
                        Ref: {application.payment_reference}
                      </p>
                    )}
                    {application.payment_uploaded_at && (
                      <p className="text-xs text-gray-400 mt-1">
                        Uploaded: {new Date(application.payment_uploaded_at).toLocaleString()}
                      </p>
                    )}
                    <div className="flex gap-2 mt-3">
                      <button
                        type="button"
                        disabled={!application.receipt_path || openingReceiptFor === String(application.id)}
                        onClick={() => openEnrollmentReceipt(application)}
                        className="px-3 py-1.5 text-xs rounded-lg bg-cyan-700 hover:bg-cyan-600 disabled:opacity-50"
                      >
                        {openingReceiptFor === String(application.id)
                          ? "Opening receipt..."
                          : "View Receipt"}
                      </button>
                      <button
                        type="button"
                        disabled={isUpdating || !supportsApprovalStatus}
                        onClick={() => updateEnrollmentStatus(application.id, "approved")}
                        className="px-3 py-1.5 text-xs rounded-lg bg-green-600 hover:bg-green-500 disabled:opacity-50"
                      >
                        Approve
                      </button>
                      <button
                        type="button"
                        disabled={isUpdating || !supportsApprovalStatus}
                        onClick={() => updateEnrollmentStatus(application.id, "rejected")}
                        className="px-3 py-1.5 text-xs rounded-lg bg-red-600 hover:bg-red-500 disabled:opacity-50"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      <div className="bg-gray-800 rounded-2xl p-6 shadow-lg mt-8">
        <h2 className="text-xl font-semibold mb-4">Registered Users & Progress</h2>
        <div className="space-y-3 max-h-[460px] overflow-auto pr-1">
          {userProgressRows.length === 0 ? (
            <p className="text-sm text-gray-400">No registered users found.</p>
          ) : (
            userProgressRows.map((row) => (
              <div key={row.profile.id} className="border border-gray-700 rounded-xl p-4">
                <div className="flex flex-wrap items-center gap-3 justify-between">
                  <div>
                    <p className="font-medium text-white">
                      {row.profile.full_name || `User ${row.profile.id.slice(0, 8)}`}
                    </p>
                    <p className="text-xs text-gray-400">ID: {row.profile.id.slice(0, 8)}...</p>
                  </div>
                  <div className="text-xs text-gray-300 flex flex-wrap gap-2">
                    <span className="px-2 py-1 rounded-full bg-gray-700">
                      Approved: {row.approvedCount}
                    </span>
                    <span className="px-2 py-1 rounded-full bg-amber-700 text-amber-100">
                      Pending: {row.pendingCount}
                    </span>
                    <span className="px-2 py-1 rounded-full bg-cyan-800 text-cyan-100">
                      Avg Progress: {row.averageProgress}%
                    </span>
                  </div>
                </div>

                {row.courses.length === 0 ? (
                  <p className="text-xs text-gray-400 mt-3">No course applications yet.</p>
                ) : (
                  <div className="mt-3 space-y-2">
                    {row.courses.map((course) => {
                      const status = course.approval_status || "approved";
                      return (
                        <div
                          key={course.id}
                          className="flex flex-wrap items-center justify-between gap-2 text-xs bg-gray-900/60 rounded-lg px-3 py-2"
                        >
                          <span className="text-gray-200">{parseCourseIdentity(course.course_title).title}</span>
                          <span className="text-cyan-300">{parseCourseIdentity(course.course_title).scope || "Course"}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-gray-400">Progress {course.progress || 0}%</span>
                            <span
                              className={`px-2 py-0.5 rounded-full font-semibold ${
                                status === "approved"
                                  ? "bg-green-700 text-green-100"
                                  : status === "pending"
                                  ? "bg-amber-700 text-amber-100"
                                  : "bg-red-700 text-red-100"
                              }`}
                            >
                              {status.toUpperCase()}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mt-8">
        <div className="bg-gray-800 rounded-2xl p-6 shadow-lg">
          <h2 className="text-xl font-semibold mb-4">Course Management</h2>
          <div className="space-y-3 max-h-[220px] overflow-auto pr-1 mb-6">
            {courseOverview.length === 0 ? (
              <p className="text-sm text-gray-400">No course activity yet.</p>
            ) : (
              courseOverview.map((course) => (
                <div key={course.courseTitle} className="border border-gray-700 rounded-xl p-3">
                  <p className="font-medium text-white">{course.displayTitle}</p>
                  <p className="text-xs text-cyan-300 mt-1">{course.displayScope || "Course"}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    Approved: {course.approvedUsers} • Pending: {course.pendingUsers} • Ratings: {course.ratingsCount} • Avg: {course.averageRating || "-"}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-gray-800 rounded-2xl p-6 shadow-lg">
          <h3 className="text-sm uppercase tracking-wide text-gray-400 mb-3">Rating Moderation</h3>
          <div className="space-y-2 max-h-[180px] overflow-auto pr-1">
            {ratings.length === 0 ? (
              <p className="text-sm text-gray-400">No ratings to moderate.</p>
            ) : (
              ratings.slice(0, 25).map((rating) => (
                <div
                  key={rating.id}
                  className="border border-gray-700 rounded-xl px-3 py-2 flex items-center justify-between gap-3"
                >
                  <div>
                    <p className="text-sm text-white">{parseCourseIdentity(rating.course_title).title}</p>
                    <p className="text-xs text-cyan-300 mt-0.5">
                      {parseCourseIdentity(rating.course_title).scope || "Course"}
                    </p>
                    <p className="text-xs text-gray-400">
                      User {String(rating.user_id).slice(0, 8)}... • {rating.rating}/5
                    </p>
                  </div>
                  <button
                    type="button"
                    disabled={removingRatingFor === String(rating.id)}
                    onClick={() => removeRating(rating.id)}
                    className="px-3 py-1.5 text-xs rounded-lg bg-red-600 hover:bg-red-500 disabled:opacity-50"
                  >
                    Remove
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
