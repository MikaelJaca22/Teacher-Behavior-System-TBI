import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";

function StudentLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
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
        navigate("/evaluation");
      }
    } catch (err) {
      setError("Invalid email or password");
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
    </div>
  );
}

export default StudentLogin;    
