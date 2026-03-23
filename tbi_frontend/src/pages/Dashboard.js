import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../lib/firebase";
import DashboardLayout from "../components/DashboardLayout";
import api from "../api";
import { 
  ClipboardList, 
  Info, 
  Loader2, 
  GraduationCap, 
  ChevronRight 
} from "lucide-react";
import "./Dashboard.css";

function Dashboard() {
  const [userName, setUserName] = useState("Student");
  const navigate = useNavigate();
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Listen for auth state changes and fetch user data from Firestore
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
    const fetchTeachers = async () => {
      try {
        setLoading(true);
        const response = await api.get("/teachers/");
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
  }, []);

  const handleTeacherClick = (teacherId) => {
    navigate(`/evaluation/${teacherId}`);
  };

  return (
    <DashboardLayout>
      <div className="dashboard-page">
        {/* Hero */}
        <div className="dashboard-hero">
          <h2 className="dashboard-title">Welcome, {userName} 👋</h2>
          <p className="dashboard-subtitle">
            Select a teacher from the sidebar or the list below to begin your evaluation.
          </p>
        </div>

        {/* Info Cards */}
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

        {/* Teachers Section */}
        <div className="teachers-section">
          <h3 className="teachers-heading">Available Teachers</h3>

          {loading && (
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

          {!loading && !error && (
            <div className="teachers-grid">
              {teachers.length === 0 ? (
                <div className="state-box">
                  <GraduationCap size={32} opacity={0.4} />
                  <p>No teachers available.</p>
                </div>
              ) : (
                teachers.map((teacher) => (
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