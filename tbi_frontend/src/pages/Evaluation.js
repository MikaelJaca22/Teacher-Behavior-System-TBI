import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  User,
  BookOpen,
  Info,
  MessageSquare,
  Send,
  X,
  Loader2,
  AlertCircle,
 
} from "lucide-react";
import DashboardLayout from "../components/DashboardLayout";
import api from "../api";
import "./Evaluation.css";

function Evaluation() {
  const navigate = useNavigate();
  const { teacherId } = useParams();

  const [teachers, setTeachers] = useState([]);
  const [teachersLoading, setTeachersLoading] = useState(true);
  const [teachersError, setTeachersError] = useState(null);
  const [selectedTeacher, setSelectedTeacher] = useState("");
  const [teacher, setTeacher] = useState(null);
  const [teacherLoading, setTeacherLoading] = useState(false);
  const [answers, setAnswers] = useState({});
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  const [studentInfo, setStudentInfo] = useState({
    email: "", uid: "", firstName: "", lastName: "", studentID: "",
  });

  // Load student data (Placeholder - adjust to your new configuration)
  useEffect(() => {
    const fetchStudentData = async () => {
      // TODO: Implement student data fetching from your own backend
      setStudentInfo({
        email: "student@example.com",
        uid: "placeholder-uid",
        firstName: "Student",
        lastName: "Name",
        studentID: "2024-00001",
      });
    };
    fetchStudentData();
  }, []);

  // Load teachers
  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        setTeachersLoading(true);
        const res = await api.get("/teachers/");
        const teachersList = res.data.teachers || [];
        setTeachers(teachersList);
        
        // If teacherId is in URL, set it as selected teacher
        if (teacherId) {
          setSelectedTeacher(teacherId);
        }
      } catch {
        setTeachersError("Failed to load teachers.");
      } finally {
        setTeachersLoading(false);
      }
    };
    fetchTeachers();
  }, [teacherId]);

  // Load selected teacher details
  useEffect(() => {
    if (!selectedTeacher) { setTeacher(null); return; }
    const fetchTeacher = async () => {
      try {
        setTeacherLoading(true);
        const res = await api.get(`/teachers/${selectedTeacher}/`);
        setTeacher(res.data.teacher);
      } catch {
        setTeacher(null);
      } finally {
        setTeacherLoading(false);
      }
    };
    fetchTeacher();
  }, [selectedTeacher]);

  const sections = {
    "A. Class Management": [
      "Conducts class on time",
      "Sets clear classroom rules",
      "Treats students with respect",
      "Encourages student participation",
    ],
    "B. Delivery of Instruction": [
      "Explains lessons clearly",
      "Uses appropriate teaching materials",
      "Stimulates student interest",
      "Organizes lessons well",
    ],
    "C. Mastery of Subject Matter": [
      "Demonstrates mastery of the subject",
      "Relates lessons to real-life situations",
      "Answers questions clearly",
    ],
  };

  const totalQuestions = Object.values(sections).flat().length;
  const answeredCount = Object.keys(answers).length;
  const allAnswered = answeredCount === totalQuestions;

  const handleChange = (question, value) => {
    setAnswers((prev) => ({ ...prev, [question]: value }));
  };

  const handleSubmit = async () => {
    if (!allAnswered) { alert("Please answer all questions before submitting."); return; }
    if (!selectedTeacher) { alert("Please select a teacher."); return; }

    try {
      setSubmitting(true);
      setSubmitError(null);

      const ratings = Object.values(answers).map(Number);
      const rating = Math.round(ratings.reduce((a, b) => a + b, 0) / ratings.length);
      const allQuestions = Object.values(sections).flat();
      const answersArray = allQuestions.map((q, i) => ({
        question_number: i + 1,
        rating: Number(answers[q]),
      }));

      await api.post("/evaluations/", {
        teacher_id: parseInt(selectedTeacher),
        rating,
        comments: comment || "",
        answers: answersArray,
        student_email: studentInfo.email,
        student_id: studentInfo.studentID || studentInfo.uid,
        student_first_name: studentInfo.firstName,
        student_last_name: studentInfo.lastName,
      });

      alert("Evaluation submitted successfully!");
      navigate("/dashboard");
    } catch (err) {
      const msg = err.response?.data?.error || "Failed to submit. Please try again.";
      setSubmitError(msg);
      alert(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (window.confirm("Cancel evaluation? Your progress will be lost.")) navigate("/dashboard");
  };

  if (teachersLoading) {
    return (
      <DashboardLayout>
        <div className="evaluation-page">
          <div className="eval-state">
            <Loader2 size={32} className="spin" />
            <p>Loading teachers…</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (teachersError) {
    return (
      <DashboardLayout>
        <div className="evaluation-page">
          <div className="eval-state">
            <AlertCircle size={32} color="#e30613" />
            <p>{teachersError}</p>
            <button className="btn-submit" onClick={() => navigate("/dashboard")}>
              Return to Dashboard
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="evaluation-page">
        <h2 className="eval-title">Evaluation Form</h2>

        {/* Student Info */}
        {studentInfo.email && (
          <div className="student-info-card">
            <User size={20} className="student-icon" />
            <div>
              <strong>
                {studentInfo.firstName} {studentInfo.lastName}
                {studentInfo.studentID && ` · ID: ${studentInfo.studentID}`}
              </strong>
              <small>{studentInfo.email}</small>
            </div>
          </div>
        )}

        {/* Teacher Selection */}
        <div className="card">
          <h3><User size={15} /> Select Teacher</h3>
          <select
            value={selectedTeacher}
            onChange={(e) => { setSelectedTeacher(e.target.value); setAnswers({}); setComment(""); }}
            className="teacher-select"
            disabled={submitting}
          >
            <option value="">— Select a Teacher —</option>
            {teachers.map((t) => (
              <option key={t.id} value={t.id}>{t.name} · {t.subject}</option>
            ))}
          </select>
        </div>

        {/* Teacher Details */}
        {teacherLoading && (
          <div className="eval-state" style={{ padding: "1rem" }}>
            <Loader2 size={20} className="spin" />
          </div>
        )}

        {teacher && !teacherLoading && (
          <div className="card">
            <h3><BookOpen size={15} /> Subject Details</h3>
            <div className="details-grid">
              <p><strong>Faculty:</strong> {teacher.name}</p>
              <p><strong>Department:</strong> {teacher.department}</p>
              <p><strong>Subject:</strong> {teacher.subject}</p>
              <p><strong>Period:</strong> 1st Semester</p>
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="card">
          <h3><Info size={15} /> Instructions</h3>
          <p style={{ fontSize: "0.875rem", color: "#555", margin: "0 0 0.75rem" }}>
            Rate your instructor honestly. Select the number that best reflects your experience.
          </p>
          <div className="legend">
            {[["5","Excellent"],["4","Very Good"],["3","Good"],["2","Fair"],["1","Poor"]].map(([n, label]) => (
              <div className="legend-item" key={n}>
                <span className="legend-badge">{n}</span>
                {label}
              </div>
            ))}
          </div>
          {selectedTeacher && (
            <p style={{ fontSize: "0.8rem", color: "#6b7280", marginTop: "0.75rem", marginBottom: 0 }}>
              Progress: {answeredCount} / {totalQuestions} answered
            </p>
          )}
        </div>

        {/* Sections */}
        {selectedTeacher && Object.entries(sections).map(([section, questions]) => (
          <div className="card" key={section}>
            <h3>{section}</h3>
            {questions.map((q, i) => (
              <div className="question-row" key={i}>
                <p className="question-text">{i + 1}. {q}</p>
                <div className="rating">
                  {[5, 4, 3, 2, 1].map((num) => (
                    <React.Fragment key={num}>
                      <input
                        type="radio"
                        id={`${q}-${num}`}
                        name={q}
                        value={num}
                        checked={answers[q] === num}
                        onChange={() => handleChange(q, num)}
                        disabled={submitting}
                      />
                      <label htmlFor={`${q}-${num}`}>{num}</label>
                    </React.Fragment>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ))}

        {/* Comments */}
        {selectedTeacher && (
          <div className="card">
            <h3><MessageSquare size={15} /> Comments & Suggestions <span style={{ fontWeight: 400, color: "#9ca3af" }}>(Optional)</span></h3>
            <textarea
              className="comment-textarea"
              placeholder="Share any additional feedback…"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              disabled={submitting}
            />
          </div>
        )}

        {/* Error */}
        {submitError && (
          <div className="error-banner">
            <AlertCircle size={16} />
            {submitError}
          </div>
        )}

        {/* Actions */}
        <div className="eval-actions">
          <button className="btn-cancel" onClick={handleCancel} disabled={submitting}>
            <X size={15} /> Cancel
          </button>
          <button
            className="btn-submit"
            onClick={handleSubmit}
            disabled={submitting || !selectedTeacher || !allAnswered}
          >
            {submitting
              ? <><Loader2 size={15} className="spin" /> Submitting…</>
              : <><Send size={15} /> Submit Evaluation</>
            }
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default Evaluation;