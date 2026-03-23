import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { LogIn, AlertCircle, Loader2 } from "lucide-react";
import { auth, db } from "../lib/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { collection, query, where, getDocs } from "firebase/firestore";
import './Login.css';

function Login() {
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
        setLoading(false);
        return;
      }

      const email = snapshot.docs[0].data().email;
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/dashboard");
    } catch (err) {
      console.error("Firebase Login Error:", err.code, err.message);
      if (err.code === "auth/wrong-password" || err.code === "auth/invalid-credential") {
        setError("Invalid password. Please try again.");
      } else if (err.code === "auth/user-not-found") {
        setError("Account not found for this Student ID.");
      } else if (err.code === "auth/too-many-requests") {
        setError("Too many failed attempts. Please try again later.");
      } else {
        setError(`Login failed: ${err.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-left">
        <img src="/1.png" alt="ACLC Logo" className="login-banner" />
        <h1>Teacher Behavior Inventory</h1>
        <h1>ACLC Ormoc Student Portal</h1>
      </div>

      <div className="login-right">
        <div className="login-form-container">
          <h2>Sign In</h2>

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

            <div className="auth-switch">
              <p>
                Don't have an account?{" "}
                <Link to="/signup" className="auth-link">Register here</Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Login;