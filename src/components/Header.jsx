
import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import logo from "../assets/logo1.png";
import { FaBars, FaTimes, FaSearch, FaUserCircle, FaChevronDown, FaSignOutAlt } from "react-icons/fa";
import { useSearch } from "../context/SearchContext";
import { diplomaLevels, shortCourses } from "../data/courses";
import { useAuth } from "../context/AuthContext";
import Login from "./Login";
import Register from "./Register";
import Modal from "./Modal";
import ThemeSwitcher from "./ThemeSwitcher";

const initialMobileNavDropdownState = {
  courses: false,
  portfolio: false,
};

const Header = () => {
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileNavDropdowns, setMobileNavDropdowns] = useState(
    initialMobileNavDropdownState
  );
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [mobileProfileMenuOpen, setMobileProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef(null);
  const mobileProfilePanelRef = useRef(null);
  const { searchQuery, setSearchQuery } = useSearch();
  const { user, isAdmin, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const normalizedQuery = searchQuery.trim().toLowerCase();
  const navItems = useMemo(
    () => [
      { label: "Home", path: "/" },
      { label: "About", path: "/about" },
      {
        label: "Courses",
        path: "/courses",
        dropdownKey: "courses",
        children: [
          { label: "Diploma Courses", path: "/courses#diploma-courses" },
          { label: "Short Term Courses", path: "/courses#short-term-courses" },
          { label: "On Campus Courses", path: "/courses#on-campus-courses" },
          {
            label: "Online Certification Courses",
            path: "/courses#online-certification-courses",
          },
        ],
      },
      {
        label: "Portfolio",
        path: "/portfolio",
        dropdownKey: "portfolio",
        children: [
          { label: "Films", path: "/portfolio?category=films" },
          { label: "Graphics", path: "/portfolio?category=graphics" },
          { label: "Mobile Apps", path: "/portfolio?category=mobile-apps" },
          { label: "Websites", path: "/portfolio?category=websites" },
          { label: "Video", path: "/portfolio?category=video" },
        ],
      },
      { label: "Gallery", path: "/gallery" },
      { label: "Instructors", path: "/instructors" },
      { label: "Testimonials", path: "/#testimonials" },
      { label: "Blog", path: "/blog" },
      { label: "Contact", path: "/contact" },
    ],
    []
  );

  const courseResults = useMemo(() => {
    if (!normalizedQuery) return [];
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
    }));

    const allCourses = [...diplomaCourses, ...shortCourseResults];
    return allCourses
    .filter((course) => {
      const haystack = [
      course.title,
      course.description,
      ...(course.tools || []),
      ]
      .join(" ")
      .toLowerCase();
      return haystack.includes(normalizedQuery);
    })
    .slice(0, 6);
  }, [normalizedQuery]);

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    if (!searchQuery.trim()) return;
    navigate("/courses");
  };

  const handleCourseSelect = (title) => {
    setSearchQuery(title);
    navigate("/courses");
  };

  const goToProtectedPage = (path) => {
    setMenuOpen(false);
    setProfileMenuOpen(false);
    setMobileProfileMenuOpen(false);
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    navigate(path);
  };

  const handleSignOut = async () => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    navigate("/", { replace: true });
    const { error } = await signOut();
    if (error) {
      window.alert(error.message || "Unable to sign out right now.");
      return;
    }
  };

  const handleSignOutFromMenu = async () => {
    setProfileMenuOpen(false);
    setMobileProfileMenuOpen(false);
    setMenuOpen(false);
    await handleSignOut();
  };

  const profileLabel =
    user?.user_metadata?.full_name ||
    user?.email?.split("@")[0] ||
    "User";

  useEffect(() => {
    setProfileMenuOpen(false);
    setMobileProfileMenuOpen(false);
    setMobileNavDropdowns(initialMobileNavDropdownState);
  }, [location.pathname]);

  useEffect(() => {
    if (!menuOpen) {
      setMobileNavDropdowns(initialMobileNavDropdownState);
    }
  }, [menuOpen]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!profileMenuRef.current) return;
      if (!profileMenuRef.current.contains(event.target)) {
        setProfileMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (menuOpen && mobileProfileMenuOpen && mobileProfilePanelRef.current) {
      mobileProfilePanelRef.current.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    }
  }, [menuOpen, mobileProfileMenuOpen]);

  const closeMobileMenu = () => {
    setMenuOpen(false);
    setMobileNavDropdowns(initialMobileNavDropdownState);
  };

  const toggleMobileNavDropdown = (dropdownKey) => {
    setMobileNavDropdowns((prev) => ({
      ...initialMobileNavDropdownState,
      [dropdownKey]: !prev[dropdownKey],
    }));
  };

  return (
    <header className="fixed top-0 z-50 w-full border-b border-white/10 bg-[#081325]/85 text-white shadow-[0_10px_30px_rgba(2,8,23,0.35)] backdrop-blur-xl">
      <div className="mx-auto flex max-w-[1400px] items-center justify-between gap-2 px-3 py-3 lg:px-5">

        {/* Logo */}
        <Link to="/" className="logo flex min-w-0 shrink-0 cursor-pointer items-center gap-2">
          <img src={logo} alt="Marota Logo" className="h-10 rounded-full ring-2 ring-cyan-300/30 sm:h-11 lg:h-12"/>
          <p className="brand-wordmark block text-sm font-bold uppercase leading-none sm:text-lg lg:text-2xl font-serif">Marota</p>
        </Link>

        <div className="xl:hidden flex-1 flex justify-center px-2 relative">
          <form
            className="flex w-full max-w-[220px] items-center rounded-full border border-slate-600 bg-[#0f2240] px-3 py-1.5"
            onSubmit={handleSearchSubmit}
          >
            <FaSearch className="text-gray-300 mr-2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search..."
              className="no-focus-ring bg-transparent outline-none px-1 py-1 text-sm text-gray-100 w-full placeholder:text-gray-400"
              aria-label="Search courses"
            />
          </form>

          {normalizedQuery && (
            <div className="absolute top-11 left-1/2 -translate-x-1/2 w-[min(84vw,320px)] rounded-xl bg-gray-800 border border-gray-700 shadow-xl overflow-hidden z-[70]">
              {courseResults.length === 0 ? (
                <div className="px-4 py-3 text-sm text-gray-300">No matching courses.</div>
              ) : (
                <ul className="max-h-64 overflow-auto">
                  {courseResults.map((course) => (
                    <li key={`mobile-head-${course.type}-${course.title}-${course.group}`}>
                      <button
                        type="button"
                        onMouseDown={() => handleCourseSelect(course.title)}
                        className="btn-dropdown w-full text-left px-4 py-3 hover:bg-gray-700 transition flex flex-col"
                      >
                        <span className="text-sm font-semibold text-white">{course.title}</span>
                        <span className="text-xs text-gray-400">{course.group} • {course.type}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
        
        {/* Desktop Nav */}
        <nav className="mx-3 hidden items-center gap-1.5 rounded-full border border-white/10 bg-[#112240]/70 px-2 py-1.5 xl:flex 2xl:gap-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;

            if (item.children) {
              return (
                <div key={item.path} className="group relative">
                  <Link
                    to={item.path}
                    className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-[13px] transition-colors hover:bg-cyan-400/10 hover:text-[var(--accent-blue)] ${
                      isActive ? "bg-cyan-400/15 text-[var(--accent-blue)]" : ""
                    }`}
                    aria-haspopup="menu"
                  >
                    <span>{item.label}</span>
                    <FaChevronDown className="text-[10px] transition-transform group-hover:rotate-180 group-focus-within:rotate-180" />
                  </Link>
                  <div className="invisible pointer-events-none absolute left-0 top-full z-[80] mt-2 min-w-[230px] rounded-xl border border-slate-700 bg-[#0f2240] p-2 opacity-0 shadow-2xl transition duration-150 group-hover:visible group-hover:pointer-events-auto group-hover:opacity-100 group-focus-within:visible group-focus-within:pointer-events-auto group-focus-within:opacity-100">
                    {item.children.map((child) => (
                      <Link
                        key={child.path}
                        to={child.path}
                        className="btn-dropdown block rounded-lg px-3 py-2 text-sm text-gray-100 hover:bg-[#17345d]"
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                </div>
              );
            }

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`rounded-full px-2.5 py-1.5 text-[13px] transition-colors hover:bg-cyan-400/10 hover:text-[var(--accent-blue)] ${
                  isActive ? "bg-cyan-400/15 text-[var(--accent-blue)]" : ""
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Search + Auth */}
        <div className="flex items-center gap-1 lg:gap-2 shrink-0">
          {/* Search Bar */}
          <div className="hidden 2xl:block relative">
            <form
              className="flex items-center rounded-full border border-slate-600 bg-[#0f2240] px-2 py-2 transition hover:border-cyan-300/50"
              onSubmit={handleSearchSubmit}
            >
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search courses..."
                className="no-focus-ring w-44 bg-transparent px-2 py-1 text-gray-100 outline-none placeholder:text-gray-400"
                aria-label="Search courses"
              />
              <button
                type="submit"
                className="text-gray-200 mr-2"
                aria-label="Search"
              >
                <FaSearch />
              </button>
            </form>

            {normalizedQuery && (
              <div className="absolute left-0 right-0 mt-2 rounded-xl bg-gray-800 border border-gray-700 shadow-xl overflow-hidden z-50">
                {courseResults.length === 0 ? (
                  <div className="px-4 py-3 text-sm text-gray-300">
                    No matching courses.
                  </div>
                ) : (
                  <ul className="max-h-72 overflow-auto">
                    {courseResults.map((course) => (
                      <li key={`${course.type}-${course.title}-${course.group}`}>
                        <button
                          type="button"
                          onMouseDown={() => handleCourseSelect(course.title)}
                          className="btn-dropdown w-full text-left px-4 py-3 hover:bg-gray-700 transition flex flex-col"
                        >
                          <span className="text-sm font-semibold text-white">
                            {course.title}
                          </span>
                          <span className="text-xs text-gray-400">
                            {course.group} • {course.type}
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>

          {/* Auth Buttons */}
          {user ? (
            <div className="hidden lg:flex items-center gap-2">
              {!isAdmin && (
                <button
                  type="button"
                  onClick={() => goToProtectedPage("/my-courses")}
                  className="px-3 py-2 rounded-lg bg-cyan-600 text-white hover:bg-cyan-500 whitespace-nowrap text-sm"
                >
                  My Courses
                </button>
              )}
              {isAdmin && (
                <button
                  type="button"
                  onClick={() => goToProtectedPage("/admin")}
                  className="px-3 py-2 rounded-lg bg-cyan-600 text-white hover:bg-cyan-500 whitespace-nowrap text-sm"
                >
                  Admin
                </button>
              )}
              <div className="relative" ref={profileMenuRef}>
                <button
                  type="button"
                  onClick={() => setProfileMenuOpen((prev) => !prev)}
                  className="inline-flex items-center gap-2 whitespace-nowrap rounded-lg border border-slate-600 bg-[#13294a] px-3 py-2 text-sm text-gray-100 hover:border-cyan-300/45 hover:bg-[#17345d]"
                  title={user?.email || profileLabel}
                  aria-label="Open profile menu"
                >
                  <FaUserCircle />
                  <span className="hidden 2xl:inline">{profileLabel}</span>
                  <FaChevronDown className={`text-xs transition-transform ${profileMenuOpen ? "rotate-180" : ""}`} />
                </button>

                {profileMenuOpen && (
                  <div className="absolute right-0 mt-2 w-52 rounded-xl border border-slate-700 bg-[#0f2240] p-2 shadow-2xl z-[60]">
                    <div className="px-3 py-2 border-b border-slate-700/70 mb-1">
                      <p className="text-sm font-semibold text-white truncate">{profileLabel}</p>
                      <p className="text-xs text-gray-400 truncate">{user?.email || ""}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => goToProtectedPage("/profile")}
                      className="btn-dropdown w-full text-left px-3 py-2.5 rounded-lg text-sm text-gray-100 hover:bg-[#17345d]"
                    >
                      Profile
                    </button>
                    <button
                      type="button"
                      onClick={handleSignOutFromMenu}
                      className="btn-danger w-full text-left px-3 py-2.5 rounded-lg text-sm"
                    >
                      <span className="inline-flex items-center gap-2">
                        <FaSignOutAlt className="text-xs" />
                        Sign Out
                      </span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="hidden lg:flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setShowLogin(true);
                  setShowRegister(false);
                }}
                className="bg-sky-700 px-3 py-2 rounded-lg text-white hover:bg-sky-600 text-sm whitespace-nowrap"
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowRegister(true);
                  setShowLogin(false);
                }}
                className="btn-signup bg-gradient-to-r from-yellow-300 via-amber-300 to-orange-300 px-3 py-2 rounded-lg text-[#0a192f] font-semibold hover:from-yellow-200 hover:via-amber-200 hover:to-orange-200 text-sm whitespace-nowrap"
              >
                Sign Up
              </button>
            </div>
          )}

          {/* Mobile Menu Button */}
          <button
            className="xl:hidden text-2xl h-10 w-10 inline-flex items-center justify-center rounded-lg border border-white/15 bg-white/5"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
          >
            {menuOpen ? <FaTimes className="text-red-500" /> : <FaBars className="text-yellow-400" />}
          </button>

          <div className="hidden lg:block lg:ml-10 xl:ml-14">
            <ThemeSwitcher compact />
          </div>
        </div>
      </div>

      {/* Mobile Nav */}
      {menuOpen && (
        <div className="xl:hidden flex max-h-[calc(100vh-7.5rem)] overflow-y-auto flex-col items-stretch gap-3 border-t border-white/10 bg-gradient-to-b from-[#0c1f3f]/95 via-[#0d2346]/95 to-[#0a1b36]/95 px-4 py-4 pb-6 backdrop-blur-md">
          <p className="px-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-300/90">
            Quick Navigation
          </p>
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;

            if (item.children) {
              const isExpanded = mobileNavDropdowns[item.dropdownKey];

              return (
                <div
                  key={item.path}
                  className={`overflow-hidden rounded-2xl border transition-colors duration-300 ${
                    isExpanded
                      ? "border-cyan-300/55 bg-[#12335f]/80"
                      : "border-slate-700/70 bg-[#102447]/65"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => toggleMobileNavDropdown(item.dropdownKey)}
                    className={`flex w-full items-center justify-between px-3.5 py-3 text-left transition ${
                      isExpanded ? "bg-cyan-400/10" : "hover:bg-cyan-400/10"
                    }`}
                    aria-expanded={isExpanded}
                    aria-label={`Toggle ${item.label} menu`}
                  >
                    <span>
                      <span
                        className={`block text-sm font-semibold ${
                          isExpanded ? "text-cyan-100" : "text-slate-100"
                        }`}
                      >
                        {item.label}
                      </span>
                      <span className="mt-0.5 block text-[11px] uppercase tracking-[0.13em] text-slate-400">
                        {item.children.length} links
                      </span>
                    </span>
                    <span className="inline-flex items-center gap-2">
                      <span className="rounded-full border border-slate-500/60 bg-slate-800/55 px-2 py-0.5 text-[10px] font-semibold text-slate-200">
                        {item.children.length}
                      </span>
                      <FaChevronDown
                        className={`text-xs text-slate-200 transition-transform duration-300 ${
                          isExpanded ? "rotate-180" : ""
                        }`}
                      />
                    </span>
                  </button>

                  <div
                    className={`grid transition-all duration-300 ease-out ${
                      isExpanded
                        ? "grid-rows-[1fr] opacity-100"
                        : "grid-rows-[0fr] opacity-0"
                    }`}
                  >
                    <div className="overflow-hidden">
                      <div className="space-y-1.5 border-t border-slate-700/70 bg-[#0d223f]/85 p-2.5">
                        <Link
                          to={item.path}
                          onClick={closeMobileMenu}
                          className={`btn-dropdown block rounded-xl border px-3 py-2.5 transition ${
                            isActive
                              ? "border-cyan-300/60 bg-cyan-300/15 text-cyan-100"
                              : "border-slate-600/80 bg-slate-900/35 text-slate-100 hover:border-cyan-300/45 hover:bg-cyan-300/10"
                          }`}
                        >
                          <span className="block text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                            Overview
                          </span>
                          <span className="mt-1 block text-sm font-semibold">
                            View all {item.label}
                          </span>
                        </Link>

                        {item.children.map((child) => (
                          <Link
                            key={child.path}
                            to={child.path}
                            onClick={closeMobileMenu}
                            className="btn-dropdown flex items-center justify-between rounded-xl border border-slate-600/75 bg-slate-900/30 px-3 py-2.5 text-sm text-slate-100 transition hover:border-cyan-300/45 hover:bg-cyan-300/10"
                          >
                            <span>{child.label}</span>
                            <span className="h-1.5 w-1.5 rounded-full bg-cyan-300/85" aria-hidden="true" />
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              );
            }

            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={closeMobileMenu}
                className={`rounded-xl border px-3 py-2.5 text-left text-sm font-semibold transition ${
                  isActive
                    ? "border-cyan-300/60 bg-cyan-300/15 text-cyan-100"
                    : "border-slate-700/75 bg-[#102447]/60 text-slate-100 hover:border-cyan-300/45 hover:bg-cyan-300/10"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        {user ? (
          <div className="flex flex-col items-center gap-3 w-full">
            {!isAdmin && (
              <button
                type="button"
                onClick={() => goToProtectedPage("/my-courses")}
                className="px-3 py-2 rounded-lg w-full bg-cyan-600 text-white inline-flex items-center justify-center hover:bg-cyan-500"
              >
                My Courses
              </button>
            )}
            {isAdmin && (
              <button
                type="button"
                onClick={() => goToProtectedPage("/admin")}
                className="px-3 py-2 rounded-lg w-full bg-cyan-600 text-white inline-flex items-center justify-center hover:bg-cyan-500"
              >
                Admin
              </button>
            )}
            <button
              type="button"
              onClick={() => setMobileProfileMenuOpen((prev) => !prev)}
              className="px-3 py-2 rounded-lg w-full bg-gray-700 text-gray-100 inline-flex items-center justify-center gap-2 hover:bg-gray-600"
              title={user?.email || profileLabel}
            >
              <FaUserCircle />
              <span>{profileLabel}</span>
              <FaChevronDown className={`text-xs transition-transform ${mobileProfileMenuOpen ? "rotate-180" : ""}`} />
            </button>

            {mobileProfileMenuOpen && (
              <div
                ref={mobileProfilePanelRef}
                className="w-full rounded-xl border border-slate-700 bg-[#0f2240] p-2 max-h-[40vh] overflow-y-auto"
              >
                <div className="px-3 py-2 border-b border-slate-700/70 mb-1">
                  <p className="text-sm font-semibold text-white truncate">{profileLabel}</p>
                  <p className="text-xs text-gray-400 truncate">{user?.email || ""}</p>
                </div>
                <button
                  type="button"
                  onClick={() => goToProtectedPage("/profile")}
                  className="btn-dropdown w-full rounded-lg px-3 py-2.5 text-left text-sm text-gray-100 hover:bg-[#17345d]"
                >
                  Profile
                </button>
                <button
                  type="button"
                  onClick={handleSignOutFromMenu}
                  className="btn-danger w-full rounded-lg px-3 py-2.5 text-left text-sm"
                >
                  <span className="inline-flex items-center gap-2">
                    <FaSignOutAlt className="text-xs" />
                    Sign Out
                  </span>
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3 w-full">
            <button
              type="button"
              onClick={() => {
                setMenuOpen(false);
                setShowLogin(true);
                setShowRegister(false);
              }}
              className="bg-sky-700 px-3 py-2 rounded-lg text-white hover:bg-sky-600 w-full"
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setMenuOpen(false);
                setShowRegister(true);
                setShowLogin(false);
              }}
              className="btn-signup bg-gradient-to-r from-yellow-300 via-amber-300 to-orange-300 px-3 py-2 rounded-lg text-[#0a192f] font-semibold hover:from-yellow-200 hover:via-amber-200 hover:to-orange-200 w-full"
            >
              Sign Up
            </button>
          </div>
        )}
        </div>
      )}

      {showLogin && (
        <Modal onClose={() => setShowLogin(false)}>
          <Login
            onLoginSuccess={() => {
              setShowLogin(false);
              navigate("/dashboard");
            }}
            onSwitchToRegister={() => {
              setShowLogin(false);
              setShowRegister(true);
            }}
          />
        </Modal>
      )}

      {showRegister && (
        <Modal onClose={() => setShowRegister(false)}>
          <Register
            onRegisterSuccess={() => {}}
            onSwitchToLogin={() => {
              setShowRegister(false);
              setShowLogin(true);
            }}
          />
        </Modal>
      )}
    </header>
  );
}
export default Header;