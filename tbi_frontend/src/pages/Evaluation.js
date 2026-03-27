import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../lib/firebase";
import {
  User,
  BookOpen,
  Info,
  MessageSquare,
  Send,
  X,
  Loader2,
  AlertCircle,
  Search,
  ChevronDown,
  Check,
  XCircle,
  CheckCircle,
} from "lucide-react";
import toast from "react-hot-toast";
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
  const [searchTerm, setSearchTerm] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [studentInfo, setStudentInfo] = useState({});
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  // Filter teachers based on search term
  const filteredTeachers = teachers.filter(teacher => 
    teacher.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    teacher.subject.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Load student data from Firebase/Firestore
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setStudentInfo({
              email: userData.email,
              uid: firebaseUser.uid,
              firstName: userData.firstName,
              lastName: userData.lastName,
              studentID: userData.studentID,
            });
          }
        } catch (err) {
          console.error("Error fetching student data:", err);
        }
      } else {
        // Not logged in
        navigate("/login");
      }
    });
    return () => unsubscribe();
  }, [navigate]);

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

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (isDropdownOpen && !e.target.closest('.teacher-search-dropdown')) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isDropdownOpen]);

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
    if (!allAnswered) { toast.error("Please answer all questions before submitting."); return; }
    if (!selectedTeacher) { toast.error("Please select a teacher."); return; }

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

      toast.success("Evaluation submitted successfully!");
      setTimeout(() => {
        navigate("/dashboard");
      }, 2000);
    } catch (err) {
      const msg = err.response?.data?.error || "Failed to submit. Please try again.";
      setSubmitError(msg);
      toast.error(msg);
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

        {/* Teacher Search & Selection */}
        <div className="card">
          <h3><User size={15} /> Select Teacher</h3>
          
          <div className="teacher-search-dropdown">
            <div 
              className={`teacher-search-input ${isDropdownOpen ? 'active' : ''} ${selectedTeacher ? 'has-value' : ''}`}
              onClick={() => !submitting && setIsDropdownOpen(!isDropdownOpen)}
            >
              {selectedTeacher ? (
                <span className="selected-teacher-name">
                  {teacher?.name || <Loader2 size={14} className="spin" />}
                </span>
              ) : (
                <span className="search-placeholder-text">Search for a teacher...</span>
              )}
              <div className="search-input-actions">
                {selectedTeacher && (
                  <button 
                    className="clear-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedTeacher("");
                      setTeacher(null);
                      setAnswers({});
                      setComment("");
                    }}
                    disabled={submitting}
                  >
                    <XCircle size={16} />
                  </button>
                )}
                <ChevronDown size={18} className={`chevron ${isDropdownOpen ? 'open' : ''}`} />
              </div>
            </div>

            {isDropdownOpen && (
              <div className="teacher-dropdown-menu">
                <div className="search-box">
                  <Search size={16} />
                  <input
                    type="text"
                    placeholder="Search by name or subject..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    autoFocus
                    disabled={submitting}
                  />
                  {searchTerm && (
                    <button 
                      className="clear-search-btn"
                      onClick={() => setSearchTerm("")}
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>
                
                <div className="teacher-list">
                  {filteredTeachers.length > 0 ? (
                    filteredTeachers.map((t) => (
                      <div
                        key={t.id}
                        className={`teacher-option ${selectedTeacher === t.id ? 'selected' : ''}`}
                        onClick={() => {
                          setSelectedTeacher(t.id);
                          setSearchTerm("");
                          setIsDropdownOpen(false);
                          setAnswers({});
                          setComment("");
                        }}
                      >
                        <div className="teacher-option-info">
                          <span className="teacher-option-name">{t.name}</span>
                          <span className="teacher-option-subject">{t.subject}</span>
                        </div>
                        {selectedTeacher === t.id && <Check size={16} className="check-icon" />}
                      </div>
                    ))
                  ) : (
                    <div className="no-results-dropdown">
                      <p>No teachers found</p>
                      <span>Try a different search term</span>
                    </div>
                  )}
                </div>
                
                <div className="dropdown-footer">
                  <span>{filteredTeachers.length} teacher{filteredTeachers.length !== 1 ? 's' : ''} available</span>
                </div>
              </div>
            )}
          </div>
          
          {selectedTeacher && !teacherLoading && (
            <div className="selected-teacher-badge">
              <Check size={14} />
              Selected: {teacher?.name} · {teacher?.subject}
            </div>
          )}
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