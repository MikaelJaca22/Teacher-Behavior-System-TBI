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
import ProtectedRoute from "./components/ProtectedRoute";
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
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/student-login" element={<StudentLogin />} />
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/teachers" element={
              <ProtectedRoute>
                <TeacherList />
              </ProtectedRoute>
            } />
            <Route path="/evaluation" element={
              <ProtectedRoute>
                <Evaluation />
              </ProtectedRoute>
            } />
            <Route path="/evaluation/:teacherId" element={
              <ProtectedRoute>
                <Evaluation />
              </ProtectedRoute>
            } />
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
