import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  LayoutDashboard,
  Users,
  ChevronDown,
  ChevronUp,
  LogOut,
  Menu,
  X,
  GraduationCap,
} from "lucide-react";
import api from "../api";
import "./Sidebar.css";

function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [showTeachers, setShowTeachers] = useState(false);
  const [teachers, setTeachers] = useState([]);
  const [isOpen, setIsOpen] = useState(false); // mobile drawer
  const [isCollapsed, setIsCollapsed] = useState(false); // desktop collapse

  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        const response = await api.get("/teachers/");
        setTeachers(response.data.teachers || []);
      } catch (err) {
        console.error("Error fetching teachers:", err);
      }
    };
    if (showTeachers) fetchTeachers();
  }, [showTeachers]);

  // Close mobile drawer on route change
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  const handleTeacherClick = (teacherId) => {
    navigate(`/evaluation/${teacherId}`);
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const sidebarContent = (
    <>
      {/* Header */}
      <div className="sidebar-header">
        <img src="/1.png" alt="ACLC Logo" />
        {!isCollapsed && (
          <div className="sidebar-header-text">
            <h3>ACLC Ormoc</h3>
            <span>Student Portal</span>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="sidebar-nav">
        <Link
          to="/dashboard"
          className={`sidebar-link ${location.pathname === "/dashboard" ? "active" : ""}`}
          title="Dashboard"
        >
          <LayoutDashboard size={18} />
          {!isCollapsed && <span>Dashboard</span>}
        </Link>

        <button
          className={`dropdown-btn ${location.pathname.includes("/evaluation") ? "active" : ""}`}
          onClick={() => setShowTeachers(!showTeachers)}
          title="Teachers"
        >
          <div className="dropdown-btn-left">
            <Users size={18} />
            {!isCollapsed && <span>Teachers</span>}
          </div>
          {!isCollapsed && (
            showTeachers ? <ChevronUp size={14} /> : <ChevronDown size={14} />
          )}
        </button>

        {showTeachers && (
          <div className="dropdown-menu">
            {teachers.length === 0 ? (
              <span className="dropdown-empty">No teachers available</span>
            ) : (
              teachers.map((teacher) => (
                <span
                  key={teacher.id}
                  onClick={() => handleTeacherClick(teacher.id)}
                  className="dropdown-item"
                >
                  <GraduationCap size={14} />
                  {!isCollapsed && teacher.name}
                </span>
              ))
            )}
          </div>
        )}
      </nav>

      {/* Logout */}
      <button className="logout-btn" onClick={handleLogout} title="Logout">
        <LogOut size={18} />
        {!isCollapsed && <span>Logout</span>}
      </button>
    </>
  );

  return (
    <>
      {/* Mobile top bar burger */}
      <button
        className="mobile-burger"
        onClick={() => setIsOpen(true)}
        aria-label="Open menu"
      >
        <Menu size={22} />
      </button>

      {/* Mobile overlay */}
      {isOpen && (
        <div className="sidebar-overlay" onClick={() => setIsOpen(false)} />
      )}

      {/* Mobile drawer */}
      <aside className={`sidebar sidebar-mobile ${isOpen ? "open" : ""}`}>
        <button
          className="sidebar-close-btn"
          onClick={() => setIsOpen(false)}
          aria-label="Close menu"
        >
          <X size={20} />
        </button>
        {sidebarContent}
      </aside>

      {/* Desktop sidebar */}
      <aside className={`sidebar sidebar-desktop ${isCollapsed ? "collapsed" : ""}`}>
        <button
          className="collapse-btn"
          onClick={() => setIsCollapsed(!isCollapsed)}
          aria-label="Toggle sidebar"
        >
          {isCollapsed ? <Menu size={18} /> : <X size={18} />}
        </button>
        {sidebarContent}
      </aside>
    </>
  );
}

export default Sidebar;