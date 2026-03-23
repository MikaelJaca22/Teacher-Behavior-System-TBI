import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { LogIn, AlertCircle, Loader2, CheckCircle, XCircle } from "lucide-react";
import { auth, db } from "../lib/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { collection, query, where, getDocs } from "firebase/firestore";
import toast from "react-hot-toast";
import Modal from "./Modal";
import '../pages/Login.css';

function LoginForm({ onSuccess }) {
  const navigate = useNavigate();
  const [studentID, setStudentID] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState("success"); // "success" or "error"
  const [modalMessage, setModalMessage] = useState("");

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
        // toast.error("Student ID not found."); // Original toast
        setModalType("error");
        setModalMessage("Student ID not found.");
        setShowModal(true);
        setLoading(false);
        return;
      }

      const email = snapshot.docs[0].data().email;
      await signInWithEmailAndPassword(auth, email, password);
      setModalType("success");
      setModalMessage("Welcome back! Signing you in...");
      setShowModal(true);
      if (onSuccess) onSuccess();
      // Delay navigation to let user see the modal
      setTimeout(() => {
        navigate("/dashboard");
      }, 2000);
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
      // toast.error(msg); // Optional: if we want to also keep toast
      setModalType("error");
      setModalMessage(msg);
      setShowModal(true);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    if (modalType === "success") {
      navigate("/dashboard");
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

      <Modal
        isOpen={showModal}
        onClose={handleCloseModal}
        title={modalType === "success" ? "Success" : "Error"}
      >
        <div className="modal-inner-content">
          {modalType === "success" ? (
            <CheckCircle size={48} color="#4caf50" className="modal-icon" />
          ) : (
            <XCircle size={48} color="#f44336" className="modal-icon" />
          )}
          <p className="modal-text">{modalMessage}</p>
          <button className="modal-action-btn" onClick={handleCloseModal}>
            {modalType === "success" ? "Continue to Dashboard" : "Try Again"}
          </button>
        </div>
      </Modal>
    </div>
  );
}

export default LoginForm;
