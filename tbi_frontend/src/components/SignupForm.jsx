import { auth, db } from "../lib/firebase";
import React, { useState } from "react";
import { UserPlus, AlertCircle, Loader2 } from "lucide-react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import toast from "react-hot-toast";
import '../pages/Login.css';
import { useNavigate } from "react-router-dom";

function SignupForm({ onSuccess }) {
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
      toast.error("Passwords do not match.");
      return;
    }

    if (form.password.length < 6) {
      setError("Password must be at least 6 characters.");
      toast.error("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    try {
      const cred = await createUserWithEmailAndPassword(auth, form.email, form.password);
      const fullName = `${form.firstName} ${form.lastName}`.trim();
      await setDoc(doc(db, "users", cred.user.uid), {
        firstName: form.firstName,
        lastName: form.lastName,
        studentID: form.studentID,
        email: form.email,
        createdAt: new Date().toISOString(),
      });
      if (onSuccess) onSuccess(fullName);
      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } catch (err) {
      console.error(err);
      const errorMessage = err.message.replace("Firebase: ", "");
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-form-container" style={{boxShadow: 'none', padding: '0'}}>
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
      </form>
    </div>
  );
}

export default SignupForm;
