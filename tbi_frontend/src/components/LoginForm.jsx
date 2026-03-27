import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { LogIn, AlertCircle, Loader2, CheckCircle, XCircle } from "lucide-react";
import { auth, db } from "../lib/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { collection, query, where, getDocs } from "firebase/firestore";
import toast from "react-hot-toast";
import '../pages/Login.css';

function LoginForm({ onSuccess }) {
  const navigate = useNavigate();
  const [studentID, setStudentID] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const q = query(collection(db, "users"), where("studentID", "==", studentID));
      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        setError("Student ID not found.");
        toast.error("Student ID not found.");
        setLoading(false);
        return;
      }

      const userData = snapshot.docs[0].data();
      const fullName = `${userData.firstName || ""} ${userData.lastName || ""}`.trim();
      const email = userData.email;
      
      await signInWithEmailAndPassword(auth, email, password);
      if (onSuccess) onSuccess(fullName);
      setTimeout(() => {
        navigate("/dashboard");
      }, 1500);
    } catch (err) {
      console.error("Firebase Login Error:", err.code, err.message);
      let msg = "Login failed. Please try again.";
      if (err.code === "auth/wrong-password" || err.code === "auth/invalid-credential") {
        msg = "Invalid password. Please try again.";
      } else if (err.code === "auth/user-not-found") {
        msg = "Account not found for this Student ID.";
      } else if (err.code === "auth/too-many-requests") {
        msg = "Too many failed attempts. Please try again later.";
      }
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-form-container" style={{boxShadow: 'none', padding: '0'}}>
      <form onSubmit={handleLogin}>
        <div className="input-group">
          <label>Student ID</label>
          <input
            type="text"
            placeholder="Enter your Student ID"
            value={studentID}
            onChange={(e) => setStudentID(e.target.value)}
            required
            autoComplete="username"
          />
        </div>

        <div className="input-group">
          <label>Password</label>
          <input
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
          />
        </div>

        {error && (
          <p className="error">
            <AlertCircle size={14} /> {error}
          </p>
        )}

        <button type="submit" className="login-submit" disabled={loading}>
          {loading
            ? <><Loader2 size={16} className="spin" /> Signing in…</>
            : <><LogIn size={16} /> Login</>
          }
        </button>
      </form>
    </div>
  );
}

export default LoginForm;
