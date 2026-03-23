import React, { useState, useEffect } from "react";
import { Toaster } from "react-hot-toast";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import TeacherList from "./pages/TeacherList";
import Evaluation from "./pages/Evaluation";
import StudentLogin from "./pages/StudentLogin";
import Loader from "./components/Loader";
import './styles.css';

function AppWrapper() {
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [displayLocation, setDisplayLocation] = useState(location);

  useEffect(() => {
    setLoading(true);

    const timer = setTimeout(() => {
      setDisplayLocation(location);
      setLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, [location]);

  return (
    <>
      <Loader visible={loading} />

      {!loading && (
        <div className="page-fade">
          <Routes location={displayLocation}>
            <Route path="/" element={<Landing />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/student-login" element={<StudentLogin />} />
            <Route path="/teachers" element={<TeacherList />} />
            <Route path="/evaluation" element={<Evaluation />} />
            <Route path="/evaluation/:teacherId" element={<Evaluation />} />
          </Routes>
        </div>
      )}
    </>
  );
}



function App() {
  return (
    <Router>
      <Toaster position="top-center" reverseOrder={false} />
      <AppWrapper />
    </Router>
  );
}

export default App;
