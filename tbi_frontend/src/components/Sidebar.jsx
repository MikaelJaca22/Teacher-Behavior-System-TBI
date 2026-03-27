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
import { auth } from "../lib/firebase";
import { signOut } from "firebase/auth";
import toast from "react-hot-toast";
import api from "../api";
import "./Sidebar.css";

function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [showTeachers, setShowTeachers] = useState(false);
  const [teachers, setTeachers] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

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

  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  const handleTeacherClick = (teacherId) => {
    navigate(`/evaluation/${teacherId}`);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      localStorage.clear();
      toast.success("Logged out successfully!");
      setTimeout(() => {
        navigate("/");
      }, 1000);
    } catch (err) {
      console.error("Logout error:", err);
      localStorage.clear();
      navigate("/");
    }
  };

  const sidebarContent = (
    <>
      <div className="sidebar-header">
        <img src="/1.png" alt="ACLC Logo" />
        {!isCollapsed && (
          <div className="sidebar-header-text">
            <h3>ACLC Ormoc</h3>
            <span>Student Portal</span>
          </div>
        )}
      </div>

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

      <button className="logout-btn" onClick={handleLogout} title="Logout">
        <LogOut size={18} />
        {!isCollapsed && <span>Logout</span>}
      </button>
    </>
  );

  return (
    <>
      <button
        className="mobile-burger"
        onClick={() => setIsOpen(true)}
        aria-label="Open menu"
      >
        <Menu size={22} />
      </button>

      {isOpen && (
        <div className="sidebar-overlay" onClick={() => setIsOpen(false)} />
      )}

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
