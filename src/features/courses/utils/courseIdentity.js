const COURSE_KEY_SEPARATOR = "::";

const normalizePart = (value) =>
  String(value || "")
    .replace(/\s+/g, " ")
    .trim();

export const buildCourseIdentity = ({ title, level, group, type }) => {
  const normalizedTitle = normalizePart(title);
  const normalizedScope = normalizePart(
    level || group || (type === "Short" ? "Short Course" : "Course")
  );

  if (!normalizedTitle) {
    return "";
  }

  return `${normalizedScope}${COURSE_KEY_SEPARATOR}${normalizedTitle}`;
};

export const parseCourseIdentity = (storedValue) => {
  const normalized = normalizePart(storedValue);

  if (!normalized.includes(COURSE_KEY_SEPARATOR)) {
    return {
      key: normalized,
      title: normalized,
      scope: "",
      isComposite: false,
    };
  }

  const [scope, ...rest] = normalized.split(COURSE_KEY_SEPARATOR);
  const title = normalizePart(rest.join(COURSE_KEY_SEPARATOR));

  return {
    key: normalized,
    title: title || normalized,
    scope: normalizePart(scope),
    isComposite: true,
  };
};

export const normalizeCourseIdentity = (storedValue) => parseCourseIdentity(storedValue).key;
