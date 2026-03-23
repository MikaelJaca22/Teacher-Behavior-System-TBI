import SignupForm from "../components/SignupForm";
import './Login.css';
import { Link } from "react-router-dom";

function Signup() {
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
          <SignupForm />
          <div className="auth-switch">
            <p>
              Already have an account?{" "}
              <Link to="/login" className="auth-link">Sign in here</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Signup;