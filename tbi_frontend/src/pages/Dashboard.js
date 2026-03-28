import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../lib/firebase";
import DashboardLayout from "../components/DashboardLayout";
import SemesterBanner from "../components/SemesterBanner";
import api, { getCurrentPeriod, getTeachers } from "../api";
import { 
  ClipboardList, 
  Info, 
  Loader2, 
  GraduationCap, 
  ChevronRight,
  Search,
  X
} from "lucide-react";
import "./Dashboard.css";

function Dashboard() {
  const [userName, setUserName] = useState("Student");
  const navigate = useNavigate();
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [periodLoading, setPeriodLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPeriod, setCurrentPeriod] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            const fullName = `${userData.firstName || ""} ${userData.lastName || ""}`.trim();
            setUserName(fullName || userData.studentID || "Student");
          }
        } catch (err) {
          console.error("Error fetching user data:", err);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchPeriod = async () => {
      try {
        const response = await getCurrentPeriod();
        if (response.data.success) {
          setCurrentPeriod(response.data.current_period);
        }
      } catch (err) {
        console.error("Error fetching current period:", err);
      } finally {
        setPeriodLoading(false);
      }
    };

    fetchPeriod();
  }, []);

  useEffect(() => {
    const fetchTeachers = async () => {
      if (!currentPeriod) return;
      
      try {
        setLoading(true);
        const response = await getTeachers(currentPeriod.id);
        setTeachers(response.data?.teachers || []);
        setError(null);
      } catch (err) {
        console.error("Error fetching teachers:", err);
        setError("Failed to load teachers. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    fetchTeachers();
  }, [currentPeriod]);

  const handleTeacherClick = (teacherId) => {
    if (currentPeriod) {
      navigate(`/evaluation/${teacherId}?period_id=${currentPeriod.id}`);
    } else {
      navigate(`/evaluation/${teacherId}`);
    }
  };

  const filteredTeachers = teachers.filter((teacher) =>
    teacher.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const clearSearch = () => {
    setSearchTerm("");
  };

  return (
    <DashboardLayout>
      <div className="dashboard-page">
        <div className="dashboard-hero">
          <h2 className="dashboard-title">Welcome, {userName}</h2>
          <p className="dashboard-subtitle">
            Select a teacher from the sidebar or the list below to begin your evaluation.
          </p>
        </div>

        <SemesterBanner period={currentPeriod} loading={periodLoading} />

        <div className="dashboard-cards">
          <div className="info-card">
            <div className="info-card-icon">
              <ClipboardList size={22} />
            </div>
            <div>
              <h3>Evaluation Reminder</h3>
              <p>
                Your feedback helps improve teaching quality at{" "}
                <strong>ACLC College of Ormoc</strong>.
              </p>
            </div>
          </div>

          <div className="info-card">
            <div className="info-card-icon">
              <Info size={22} />
            </div>
            <div>
              <h3>Instructions</h3>
              <p>Choose a teacher → Answer all questions → Submit your evaluation.</p>
            </div>
          </div>
        </div>

        <div className="teachers-section">
          <h3 className="teachers-heading">Available Teachers</h3>
          
          <div className="search-bar-container">
            <Search size={18} className="search-icon" />
            <input
              type="text"
              placeholder="Search teacher by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            {searchTerm && (
              <button className="clear-search-btn" onClick={clearSearch}>
                <X size={16} />
              </button>
            )}
          </div>
          {searchTerm && (
            <p className="search-results-count">
              {filteredTeachers.length} {filteredTeachers.length === 1 ? "result" : "results"} for "{searchTerm}"
            </p>
          )}

          {(loading || periodLoading) && (
            <div className="state-box">
              <Loader2 size={28} className="spin" />
              <p>Loading teachers…</p>
            </div>
          )}

          {error && (
            <div className="state-box error-box">
              <p>{error}</p>
            </div>
          )}

          {!loading && !periodLoading && !error && (
            <div className="teachers-grid">
              {filteredTeachers.length === 0 ? (
                <div className="state-box">
                  <GraduationCap size={32} opacity={0.4} />
                  <p>{searchTerm ? "No teachers found matching your search." : "No teachers available."}</p>
                </div>
              ) : (
                filteredTeachers.map((teacher) => (
                  <div
                    key={teacher.id}
                    className="teacher-card"
                    onClick={() => handleTeacherClick(teacher.id)}
                  >
                    <div className="teacher-card-avatar">
                      <GraduationCap size={24} />
                    </div>
                    <div className="teacher-card-info">
                      <h4>{teacher.name}</h4>
                      <p>{teacher.subject}</p>
                    </div>
                    <button className="evaluate-btn" aria-label="Evaluate">
                      <ChevronRight size={18} />
                    </button>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

export default Dashboard;
