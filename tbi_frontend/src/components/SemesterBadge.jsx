import { Calendar, AlertCircle } from "lucide-react";
import "./SemesterBadge.css";

function SemesterBadge({ period, loading }) {
  if (loading) {
    return (
      <div className="semester-badge semester-badge-loading">
        <div className="badge-skeleton"></div>
      </div>
    );
  }

  if (!period) {
    return (
      <div className="semester-badge semester-badge-warning">
        <AlertCircle size={14} />
        <span>No Active Period</span>
      </div>
    );
  }

  const formatSemester = (semester) => {
    if (semester === "first") return "1st Sem";
    if (semester === "second") return "2nd Sem";
    return semester;
  };

  return (
    <div className="semester-badge">
      <Calendar size={14} />
      <span>{formatSemester(period.semester)} {period.academic_year}</span>
      <span className="badge-dot"></span>
    </div>
  );
}

export default SemesterBadge;
