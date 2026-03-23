import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import Modal from "../components/Modal";
import { CheckCircle, XCircle } from "lucide-react";

function StudentLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState("success");
  const [modalMessage, setModalMessage] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await api.post("/login/", {
        email,
        password,
      });

      if (res.data.success) {
        // 🏴‍☠️ Store student
        localStorage.setItem(
          "student",
          JSON.stringify(res.data.student)
        );

        // Sail onward!
        setModalType("success");
        setModalMessage("Login successful! Welcome back.");
        setShowModal(true);
        setTimeout(() => {
          navigate("/evaluation");
        }, 2000);
      }
    } catch (err) {
      setError("Invalid email or password");
      setModalType("error");
      setModalMessage("Invalid email or password. Please try again.");
      setShowModal(true);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    if (modalType === "success") {
      navigate("/evaluation");
    }
  };

  return (
    <div>
      <h2>Student Login</h2>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button type="submit">Login</button>
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
            {modalType === "success" ? "Continue" : "Try Again"}
          </button>
        </div>
      </Modal>
    </div>
  );
}

export default StudentLogin;    
