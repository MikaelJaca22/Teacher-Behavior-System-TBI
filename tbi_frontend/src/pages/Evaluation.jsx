import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../lib/firebase";
import { getCurrentPeriod } from "../api";
import { Calendar, BookOpen, AlertCircle } from "lucide-react";
import "./Evaluation.css";

function Evaluation() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [currentPeriod, setCurrentPeriod] = useState(null);
  const [loading, setLoading] = useState(true);
  const [teacherName, setTeacherName] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        navigate("/");
        return;
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [navigate]);

  useEffect(() => {
    const fetchPeriodAndTeacher = async () => {
      try {
        const periodId = searchParams.get("period_id");
        
        if (periodId) {
          const response = await getCurrentPeriod();
          if (response.data.success) {
            setCurrentPeriod(response.data.current_period);
          }
        } else {
          const response = await getCurrentPeriod();
          if (response.data.success) {
            setCurrentPeriod(response.data.current_period);
          }
        }
      } catch (err) {
        console.error("Error fetching period:", err);
      }
    };

    fetchPeriodAndTeacher();
  }, [searchParams]);

  const formatSemester = (semester) => {
    if (semester === "first") return "1st Semester";
    if (semester === "second") return "2nd Semester";
    if (semester === "summer") return "Summer Term";
    return semester;
  };

  if (loading) {
    return (
      <div className="evaluation-page">
        <div className="evaluation-loading">
          <div className="spinner"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="evaluation-page">
      <div className="evaluation-container">
        <div className="evaluation-header">
          <h1>Teacher Evaluation</h1>
          <p className="evaluation-subtitle">
            Student Evaluation of Faculty Performance
          </p>
        </div>

        <div className="evaluation-context">
          <div className="context-item">
            <div className="context-icon">
              <Calendar size={20} />
            </div>
            <div className="context-content">
              <span className="context-label">Evaluation Period</span>
              <span className="context-value">
                {currentPeriod 
                  ? `${formatSemester(currentPeriod.semester)}, AY ${currentPeriod.academic_year}`
                  : "Loading..."
                }
              </span>
            </div>
          </div>

          {currentPeriod?.start_date && currentPeriod?.end_date && (
            <div className="context-item context-item-dates">
              <div className="context-icon">
                <BookOpen size={20} />
              </div>
              <div className="context-content">
                <span className="context-label">Period Duration</span>
                <span className="context-value">
                  {new Date(currentPeriod.start_date).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric"
                  })} - {new Date(currentPeriod.end_date).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric"
                  })}
                </span>
              </div>
            </div>
          )}
        </div>

        <div className="evaluation-info-box">
          <AlertCircle size={18} />
          <div>
            <p>
              <strong>Instructions:</strong> This questionnaire is designed to gather your feedback 
              to help improve the teaching-learning process. Your responses will be treated with 
              utmost confidentiality.
            </p>
          </div>
        </div>

        <div className="evaluation-placeholder">
          <h2>Evaluation Form Coming Soon</h2>
          <p>The detailed evaluation questions will appear here.</p>
          <p className="evaluation-placeholder-note">
            Rating Scale: 1 - Failed to be Observed | 2 - Below Standard | 3 - Meets Expectations | 4 - Above Expectations | 5 - Exceeds Expectations
          </p>
        </div>
      </div>
    </div>
  );
}

export default Evaluation;
