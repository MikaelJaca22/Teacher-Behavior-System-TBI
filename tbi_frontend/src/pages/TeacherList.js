import React from "react";

function TeacherList() {
  const teachers = ["Mr. Santos", "Ms. Reyes", "Mr. Cruz"];

  return (
    <div className="teacher-list">
  <h2>Teacher List</h2>
  <ul>
    {teachers.map((t, i) => (
      <li key={i}>
        {t} <button>Evaluate</button>
      </li>
    ))}
  </ul>
</div>

  );
}

export default TeacherList;
