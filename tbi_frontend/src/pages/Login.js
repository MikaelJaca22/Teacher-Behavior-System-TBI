import LoginForm from "../components/LoginForm";
import './Login.css';
import { Link } from "react-router-dom";

function Login() {
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
          <LoginForm />
          <div className="auth-switch">
            <p>
              Don't have an account?{" "}
              <Link to="/signup" className="auth-link">Register here</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
