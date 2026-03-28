import { GraduationCap, Calendar, Info, X } from "lucide-react";
import { useState } from "react";
import "./SemesterBanner.css";

function SemesterBanner({ period, loading }) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed || !period) return null;

  if (loading) {
    return (
      <div className="semester-banner">
        <div className="semester-banner-skeleton">
          <div className="skeleton-icon"></div>
          <div className="skeleton-content">
            <div className="skeleton-line skeleton-line-title"></div>
            <div className="skeleton-line skeleton-line-subtitle"></div>
          </div>
        </div>
      </div>
    );
  }

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric"
    });
  };

  const formatSemester = (semester) => {
    if (semester === "first") return "1st Semester";
    if (semester === "second") return "2nd Semester";
    if (semester === "summer") return "Summer Term";
    return semester;
  };

  return (
    <div className="semester-banner">
      <div className="semester-banner-icon">
        <GraduationCap size={22} />
      </div>
      <div className="semester-banner-content">
        <h4>Current Evaluation Period</h4>
        <p className="semester-info">
          <span className="semester-name">
            {formatSemester(period.semester)}, AY {period.academic_year}
          </span>
          <span className="semester-dates">
            <Calendar size={12} />
            {formatDate(period.start_date)} - {formatDate(period.end_date)}
          </span>
        </p>
        <p className="semester-note">
          <Info size={12} />
          Your evaluation will be recorded for this semester
        </p>
      </div>
      <button 
        className="semester-banner-close" 
        onClick={() => setDismissed(true)}
        aria-label="Dismiss"
      >
        <X size={16} />
      </button>
    </div>
  );
}

export default SemesterBanner;
