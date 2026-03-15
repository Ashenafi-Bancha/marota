import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { supabase } from "../shared/lib/supabaseClient";
import { useAuth } from "../features/auth/context/AuthProvider";
import { parseCourseIdentity } from "../features/courses/utils/courseIdentity";
import { isMissingApprovalStatusColumnError } from "../features/courses/utils/enrollmentApproval";

const toPercent = (completed, total) => {
  if (!total) return 0;
  return Math.round((completed / total) * 100);
};

export default function CourseLearning() {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const { courseKey = "" } = useParams();

  const decodedCourseKey = useMemo(() => decodeURIComponent(courseKey), [courseKey]);
  const parsedCourse = useMemo(
    () => parseCourseIdentity(decodedCourseKey),
    [decodedCourseKey]
  );

  const [loading, setLoading] = useState(true);
  const [accessMessage, setAccessMessage] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [modules, setModules] = useState([]);
  const [lessonsByModule, setLessonsByModule] = useState({});
  const [quizzes, setQuizzes] = useState([]);
  const [projects, setProjects] = useState([]);
  const [tests, setTests] = useState([]);
  const [progressMap, setProgressMap] = useState({});
  const [savingLessonId, setSavingLessonId] = useState(null);
  const [selectedLessonId, setSelectedLessonId] = useState(null);

  const fetchLearningContent = useCallback(async () => {
    if (!user || !decodedCourseKey) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setAccessMessage("");
    setStatusMessage("");

    let enrollmentRes = await supabase
      .from("enrollments")
      .select("course_title, approval_status")
      .eq("user_id", user.id)
      .eq("course_title", decodedCourseKey)
      .maybeSingle();

    if (isMissingApprovalStatusColumnError(enrollmentRes.error)) {
      enrollmentRes = await supabase
        .from("enrollments")
        .select("course_title")
        .eq("user_id", user.id)
        .eq("course_title", decodedCourseKey)
        .maybeSingle();

      if (enrollmentRes.data) {
        enrollmentRes = {
          ...enrollmentRes,
          data: {
            ...enrollmentRes.data,
            approval_status: "approved",
          },
        };
      }
    }

    if (enrollmentRes.error) {
      setAccessMessage(enrollmentRes.error.message);
      setLoading(false);
      return;
    }

    if (!isAdmin) {
      const approvalStatus = enrollmentRes.data?.approval_status || "pending";
      if (!enrollmentRes.data || approvalStatus !== "approved") {
        setAccessMessage(
          "You can access this learning content after your enrollment is approved."
        );
        setLoading(false);
        return;
      }
    }

    const [modulesRes, quizzesRes, projectsRes, testsRes] = await Promise.all([
      supabase
        .from("short_course_modules")
        .select("id, title, description, sort_order")
        .eq("course_key", decodedCourseKey)
        .order("sort_order", { ascending: true }),
      supabase
        .from("short_course_quizzes")
        .select("id, title, description, question_count, pass_score, sort_order, quiz_url, review_url")
        .eq("course_key", decodedCourseKey)
        .order("sort_order", { ascending: true }),
      supabase
        .from("short_course_projects")
        .select("id, title, description, submission_instruction, sort_order, project_brief_url, review_url")
        .eq("course_key", decodedCourseKey)
        .order("sort_order", { ascending: true }),
      supabase
        .from("short_course_tests")
        .select("id, title, description, duration_minutes, pass_score, sort_order, test_guide_url, review_url")
        .eq("course_key", decodedCourseKey)
        .order("sort_order", { ascending: true }),
    ]);

    if (modulesRes.error || quizzesRes.error || projectsRes.error || testsRes.error) {
      setStatusMessage(
        modulesRes.error?.message ||
          quizzesRes.error?.message ||
          projectsRes.error?.message ||
          testsRes.error?.message ||
          "Unable to load course content right now."
      );
      setLoading(false);
      return;
    }

    const moduleRows = modulesRes.data || [];
    const moduleIds = moduleRows.map((module) => module.id);

    const lessonsRes =
      moduleIds.length > 0
        ? await supabase
            .from("short_course_lessons")
            .select(
              "id, module_id, title, summary, video_url, documentation_url, external_review_url, sort_order"
            )
            .in("module_id", moduleIds)
            .order("sort_order", { ascending: true })
        : { data: [], error: null };

    if (lessonsRes.error) {
      setStatusMessage(lessonsRes.error.message);
      setLoading(false);
      return;
    }

    const lessonRows = lessonsRes.data || [];
    const lessonIds = lessonRows.map((lesson) => lesson.id);

    const progressRes =
      lessonIds.length > 0
        ? await supabase
            .from("short_course_user_lesson_progress")
            .select("lesson_id, completed")
            .eq("user_id", user.id)
            .in("lesson_id", lessonIds)
        : { data: [], error: null };

    if (progressRes.error) {
      setStatusMessage(progressRes.error.message);
      setLoading(false);
      return;
    }

    const groupedLessons = lessonRows.reduce((acc, lesson) => {
      if (!acc[lesson.module_id]) {
        acc[lesson.module_id] = [];
      }
      acc[lesson.module_id].push(lesson);
      return acc;
    }, {});

    const nextProgressMap = (progressRes.data || []).reduce((acc, row) => {
      acc[row.lesson_id] = Boolean(row.completed);
      return acc;
    }, {});

    setModules(moduleRows);
    setLessonsByModule(groupedLessons);
    setQuizzes(quizzesRes.data || []);
    setProjects(projectsRes.data || []);
    setTests(testsRes.data || []);
    setProgressMap(nextProgressMap);
    setLoading(false);
  }, [decodedCourseKey, isAdmin, user]);

  useEffect(() => {
    fetchLearningContent();
  }, [fetchLearningContent]);

  const allLessons = useMemo(
    () => Object.values(lessonsByModule).flat(),
    [lessonsByModule]
  );

  const completedLessons = useMemo(
    () => allLessons.filter((lesson) => progressMap[lesson.id]).length,
    [allLessons, progressMap]
  );

  const completionPercent = useMemo(
    () => toPercent(completedLessons, allLessons.length),
    [allLessons.length, completedLessons]
  );

  useEffect(() => {
    if (!allLessons.length) {
      setSelectedLessonId(null);
      return;
    }

    const selectedStillExists = allLessons.some((lesson) => lesson.id === selectedLessonId);
    if (!selectedStillExists) {
      setSelectedLessonId(allLessons[0].id);
    }
  }, [allLessons, selectedLessonId]);

  const selectedLesson = useMemo(
    () => allLessons.find((lesson) => lesson.id === selectedLessonId) || null,
    [allLessons, selectedLessonId]
  );

  const selectedModule = useMemo(() => {
    if (!selectedLesson) return null;
    return modules.find((module) => module.id === selectedLesson.module_id) || null;
  }, [modules, selectedLesson]);

  const hasCurriculum =
    modules.length > 0 || quizzes.length > 0 || projects.length > 0 || tests.length > 0;

  const updateEnrollmentProgress = useCallback(
    async (nextProgress) => {
      if (!user || !decodedCourseKey || isAdmin) return;

      await supabase
        .from("enrollments")
        .update({ progress: nextProgress })
        .eq("user_id", user.id)
        .eq("course_title", decodedCourseKey);
    },
    [decodedCourseKey, isAdmin, user]
  );

  const toggleLessonCompletion = async (lessonId) => {
    if (!user) return;
    setSavingLessonId(lessonId);
    setStatusMessage("");

    const currentlyCompleted = Boolean(progressMap[lessonId]);

    if (currentlyCompleted) {
      const { error } = await supabase
        .from("short_course_user_lesson_progress")
        .delete()
        .eq("user_id", user.id)
        .eq("lesson_id", lessonId);

      if (error) {
        setSavingLessonId(null);
        setStatusMessage(error.message);
        return;
      }
    } else {
      const { error } = await supabase
        .from("short_course_user_lesson_progress")
        .upsert(
          {
            user_id: user.id,
            lesson_id: lessonId,
            completed: true,
            completed_at: new Date().toISOString(),
          },
          { onConflict: "user_id,lesson_id" }
        );

      if (error) {
        setSavingLessonId(null);
        setStatusMessage(error.message);
        return;
      }
    }

    const nextProgressMap = {
      ...progressMap,
      [lessonId]: !currentlyCompleted,
    };

    if (currentlyCompleted) {
      delete nextProgressMap[lessonId];
    }

    const nextCompletedCount = allLessons.filter(
      (lesson) => nextProgressMap[lesson.id]
    ).length;

    const nextProgress = toPercent(nextCompletedCount, allLessons.length);

    setProgressMap(nextProgressMap);
    await updateEnrollmentProgress(nextProgress);
    setSavingLessonId(null);
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-gray-200">
        Loading learning content...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <section className="max-w-6xl mx-auto px-4 py-10 text-white">
      <nav className="text-sm text-gray-400 mb-4">
        <Link to="/dashboard" className="hover:text-cyan-300">
          Dashboard
        </Link>
        <span className="px-2">/</span>
        <Link to="/my-courses" className="hover:text-cyan-300">
          My Courses
        </Link>
        <span className="px-2">/</span>
        <span className="text-gray-200">{parsedCourse.title || "Learning"}</span>
      </nav>

      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-6">
        <div>
          <h1 className="text-3xl font-bold">{parsedCourse.title || "Course Learning"}</h1>
          <p className="text-gray-300 mt-1">
            {parsedCourse.scope || "Short Course"} â€¢ MVP learning workspace
          </p>
        </div>
        <Link
          to="/my-courses"
          className="inline-flex items-center justify-center px-4 py-2 rounded-full bg-gray-700 text-gray-100 hover:bg-gray-600"
        >
          Back to My Courses
        </Link>
      </div>

      {accessMessage ? (
        <div className="bg-gray-800 border border-gray-700 rounded-2xl p-6 text-gray-200">
          {accessMessage}
        </div>
      ) : !hasCurriculum ? (
        <div className="bg-gray-800 border border-gray-700 rounded-2xl p-6 text-gray-200">
          <p className="text-lg font-semibold text-white">Coming Soon</p>
          <p className="text-gray-300 mt-2">
            Curriculum is in progress for this short course. We are working on it.
          </p>
        </div>
      ) : (
        <>
          <div className="bg-gray-800 rounded-2xl p-5 mb-6 border border-gray-700">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
              <div>
                <p className="text-sm text-gray-400">Course completion</p>
                <p className="text-3xl font-semibold text-white">{completionPercent}%</p>
                <p className="text-sm text-gray-300 mt-1">
                  {completedLessons} of {allLessons.length} lessons completed
                </p>
              </div>
              <div className="text-sm text-gray-300">
                {modules.length} modules â€¢ {allLessons.length} lessons
              </div>
            </div>
            <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden mt-3">
              <div
                className="h-full bg-cyan-400"
                style={{ width: `${completionPercent}%` }}
              />
            </div>
          </div>

          {statusMessage && (
            <p className="text-sm text-red-400 mb-5">{statusMessage}</p>
          )}

          <div className="grid lg:grid-cols-12 gap-6">
            <aside className="lg:col-span-4 bg-gray-800 rounded-2xl border border-gray-700 p-4 h-fit">
              <h2 className="text-lg font-semibold text-white">Curriculum</h2>
              <p className="text-xs text-gray-400 mt-1">Select a lesson to continue learning.</p>

              <div className="mt-4 space-y-4 max-h-[70vh] overflow-auto pr-1">
                {modules.map((module) => {
                  const moduleLessons = lessonsByModule[module.id] || [];
                  const moduleCompleted = moduleLessons.filter((lesson) => progressMap[lesson.id]).length;

                  return (
                    <div key={module.id} className="bg-gray-900 border border-gray-700 rounded-xl p-3">
                      <h3 className="text-sm font-semibold text-white">{module.title}</h3>
                      <p className="text-xs text-gray-400 mt-1">{moduleCompleted}/{moduleLessons.length} completed</p>

                      <div className="mt-3 space-y-2">
                        {moduleLessons.length === 0 ? (
                          <p className="text-xs text-gray-500">No lessons yet.</p>
                        ) : (
                          moduleLessons.map((lesson, lessonIndex) => {
                            const completed = Boolean(progressMap[lesson.id]);
                            const selected = selectedLessonId === lesson.id;

                            return (
                              <button
                                key={lesson.id}
                                type="button"
                                onClick={() => setSelectedLessonId(lesson.id)}
                                className={`w-full text-left px-3 py-2 rounded-lg border transition ${
                                  selected
                                    ? "bg-cyan-500/20 border-cyan-400 text-cyan-100"
                                    : "bg-gray-800 border-gray-700 text-gray-200 hover:border-gray-500"
                                }`}
                              >
                                <div className="flex items-center justify-between gap-2">
                                  <span className="text-xs font-medium">
                                    {lessonIndex + 1}. {lesson.title}
                                  </span>
                                  {completed && <span className="text-[10px] text-green-300">Done</span>}
                                </div>
                              </button>
                            );
                          })
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </aside>

            <main className="lg:col-span-8 space-y-6">
              <section className="bg-gray-800 rounded-2xl border border-gray-700 p-5">
                {selectedLesson ? (
                  <>
                    <p className="text-xs text-cyan-300 mb-2">{selectedModule?.title || "Module"}</p>
                    <h2 className="text-2xl font-semibold text-white">{selectedLesson.title}</h2>
                    <p className="text-gray-300 mt-2">{selectedLesson.summary}</p>

                    <div className="mt-4 flex flex-wrap gap-3 text-sm">
                      {selectedLesson.video_url && (
                        <a
                          href={selectedLesson.video_url}
                          target="_blank"
                          rel="noreferrer"
                          className="px-3 py-2 rounded-lg bg-gray-900 border border-gray-700 text-cyan-300 hover:text-cyan-200"
                        >
                          Watch video
                        </a>
                      )}
                      {selectedLesson.documentation_url && (
                        <a
                          href={selectedLesson.documentation_url}
                          target="_blank"
                          rel="noreferrer"
                          className="px-3 py-2 rounded-lg bg-gray-900 border border-gray-700 text-cyan-300 hover:text-cyan-200"
                        >
                          Read documentation
                        </a>
                      )}
                      {selectedLesson.external_review_url && (
                        <a
                          href={selectedLesson.external_review_url}
                          target="_blank"
                          rel="noreferrer"
                          className="px-3 py-2 rounded-lg bg-gray-900 border border-gray-700 text-cyan-300 hover:text-cyan-200"
                        >
                          Review resource
                        </a>
                      )}
                    </div>

                    <div className="mt-5">
                      <button
                        type="button"
                        disabled={savingLessonId === selectedLesson.id}
                        onClick={() => toggleLessonCompletion(selectedLesson.id)}
                        className={`px-4 py-2 rounded-full text-xs font-semibold ${
                          progressMap[selectedLesson.id]
                            ? "bg-green-600 text-white hover:bg-green-500"
                            : "bg-cyan-500 text-white hover:bg-cyan-400"
                        } disabled:opacity-60 disabled:cursor-not-allowed`}
                      >
                        {savingLessonId === selectedLesson.id
                          ? "Saving..."
                          : progressMap[selectedLesson.id]
                          ? "Completed"
                          : "Mark Complete"}
                      </button>
                    </div>
                  </>
                ) : (
                  <p className="text-gray-300">Select a lesson from the curriculum to begin.</p>
                )}
              </section>

              <section className="bg-gray-800 rounded-2xl border border-gray-700 p-5">
                <h3 className="text-lg font-semibold text-white mb-3">Assessments</h3>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="bg-gray-900 border border-gray-700 rounded-xl p-4">
                    <h4 className="text-sm font-semibold text-white">Quizzes</h4>
                    {quizzes.length === 0 ? (
                      <p className="text-xs text-gray-400 mt-2">No quiz published yet.</p>
                    ) : (
                      quizzes.map((quiz) => (
                        <div key={quiz.id} className="mt-3 text-xs text-gray-300 space-y-1">
                          <p className="font-medium text-gray-100">{quiz.title}</p>
                          <p>{quiz.question_count} questions â€¢ Pass {quiz.pass_score}%</p>
                          <div className="flex flex-wrap gap-2">
                            {quiz.quiz_url && (
                              <a href={quiz.quiz_url} target="_blank" rel="noreferrer" className="text-cyan-300 hover:text-cyan-200">
                                Open
                              </a>
                            )}
                            {quiz.review_url && (
                              <a href={quiz.review_url} target="_blank" rel="noreferrer" className="text-cyan-300 hover:text-cyan-200">
                                Review
                              </a>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  <div className="bg-gray-900 border border-gray-700 rounded-xl p-4">
                    <h4 className="text-sm font-semibold text-white">Projects</h4>
                    {projects.length === 0 ? (
                      <p className="text-xs text-gray-400 mt-2">No project published yet.</p>
                    ) : (
                      projects.map((project) => (
                        <div key={project.id} className="mt-3 text-xs text-gray-300 space-y-1">
                          <p className="font-medium text-gray-100">{project.title}</p>
                          <p>{project.description}</p>
                          <div className="flex flex-wrap gap-2">
                            {project.project_brief_url && (
                              <a href={project.project_brief_url} target="_blank" rel="noreferrer" className="text-cyan-300 hover:text-cyan-200">
                                Brief
                              </a>
                            )}
                            {project.review_url && (
                              <a href={project.review_url} target="_blank" rel="noreferrer" className="text-cyan-300 hover:text-cyan-200">
                                Review
                              </a>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  <div className="bg-gray-900 border border-gray-700 rounded-xl p-4">
                    <h4 className="text-sm font-semibold text-white">Tests</h4>
                    {tests.length === 0 ? (
                      <p className="text-xs text-gray-400 mt-2">No final test published yet.</p>
                    ) : (
                      tests.map((test) => (
                        <div key={test.id} className="mt-3 text-xs text-gray-300 space-y-1">
                          <p className="font-medium text-gray-100">{test.title}</p>
                          <p>{test.duration_minutes ? `${test.duration_minutes} min â€¢ ` : ""}Pass {test.pass_score}%</p>
                          <div className="flex flex-wrap gap-2">
                            {test.test_guide_url && (
                              <a href={test.test_guide_url} target="_blank" rel="noreferrer" className="text-cyan-300 hover:text-cyan-200">
                                Open
                              </a>
                            )}
                            {test.review_url && (
                              <a href={test.review_url} target="_blank" rel="noreferrer" className="text-cyan-300 hover:text-cyan-200">
                                Review
                              </a>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </section>
            </main>
          </div>
        </>
      )}
    </section>
  );
}
