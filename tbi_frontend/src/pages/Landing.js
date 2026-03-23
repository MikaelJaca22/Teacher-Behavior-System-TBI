import React from "react";
import { Link } from "react-router-dom";
import { UserPlus, LogIn } from "lucide-react";
import './Landing.css';

function Landing() {
  return (
    <div className="landing-container">
      {/* Background */}
      <div className="landing-background">
        <div className="landing-overlay" />
        <div className="landing-blob landing-blob-1" />
        <div className="landing-blob landing-blob-2" />
      </div>

      {/* Hero */}
      <div className="landing-hero">
        <img src="/1.png" alt="ACLC Logo" className="landing-logo" />

        <h1 className="landing-title">
          Teacher Behavior Inventory
          <span>ACLC College of Ormoc · Student Portal</span>
        </h1>

        <p className="landing-subtitle">
          Evaluate your teachers securely and help improve the quality of education at{" "}
          <strong>ACLC Ormoc</strong>. Your feedback matters.
        </p>

        <div className="landing-buttons">
          <Link to="/signup" className="landing-btn signup-btn">
            <UserPlus size={18} />
            Sign Up
          </Link>
          <Link to="/login" className="landing-btn login-btn">
            <LogIn size={18} />
            Login
          </Link>
        </div>
      </div>

      <p className="landing-footer">© {new Date().getFullYear()} ACLC College of Ormoc. All rights reserved.</p>
    </div>
  );
}

export default Landing;