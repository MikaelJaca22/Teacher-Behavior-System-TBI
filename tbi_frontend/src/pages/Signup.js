import { auth, db } from "../lib/firebase";
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { UserPlus, AlertCircle, Loader2 } from "lucide-react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import './Login.css';

function Signup() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    firstName: "", lastName: "", studentID: "",
    email: "", password: "", confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const set = (field) => (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (form.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    try {
      const cred = await createUserWithEmailAndPassword(auth, form.email, form.password);
      await setDoc(doc(db, "users", cred.user.uid), {
        firstName: form.firstName,
        lastName: form.lastName,
        studentID: form.studentID,
        email: form.email,
      });
      alert("Registration successful!");
      navigate("/login");
    } catch (err) {
      console.error(err);
      setError(err.message.replace("Firebase: ", ""));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-left">
        <img src="/1.png" alt="ACLC Logo" className="login-banner" />
        <h1>Join TBI System</h1>
        <h1>ACLC Ormoc Student Portal</h1>
      </div>

      <div className="login-right">
        <div className="login-form-container">
          <h2>Sign Up</h2>

          <form onSubmit={handleSubmit}>
            <div className="name-grid">
              <div className="input-group">
                <label>First Name</label>
                <input type="text" placeholder="Juan" value={form.firstName} onChange={set("firstName")} required />
              </div>
              <div className="input-group">
                <label>Last Name</label>
                <input type="text" placeholder="Dela Cruz" value={form.lastName} onChange={set("lastName")} required />
              </div>
            </div>

            <div className="input-group">
              <label>Student ID</label>
              <input type="text" placeholder="e.g. 2024-00001" value={form.studentID} onChange={set("studentID")} required />
            </div>

            <div className="input-group">
              <label>Email</label>
              <input type="email" placeholder="you@example.com" value={form.email} onChange={set("email")} required />
            </div>

            <div className="input-group">
              <label>Password</label>
              <input type="password" placeholder="Min. 6 characters" value={form.password} onChange={set("password")} required autoComplete="new-password" />
            </div>

            <div className="input-group">
              <label>Confirm Password</label>
              <input type="password" placeholder="Repeat password" value={form.confirmPassword} onChange={set("confirmPassword")} required autoComplete="new-password" />
            </div>

            {error && (
              <p className="error">
                <AlertCircle size={14} /> {error}
              </p>
            )}

            <button type="submit" className="login-submit" disabled={loading}>
              {loading
                ? <><Loader2 size={16} className="spin" /> Creating account…</>
                : <><UserPlus size={16} /> Sign Up</>
              }
            </button>

            <div className="auth-switch">
              <p>
                Already have an account?{" "}
                <Link to="/login" className="auth-link">Sign in here</Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Signup;