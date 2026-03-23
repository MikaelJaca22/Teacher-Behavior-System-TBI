import React, { useState } from "react";
import { Link } from "react-router-dom";
import { UserPlus, LogIn } from "lucide-react";
import Modal from "../components/Modal";
import LoginForm from "../components/LoginForm";
import SignupForm from "../components/SignupForm";
import './Landing.css';

function Landing() {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isSignupOpen, setIsSignupOpen] = useState(false);

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
          <button onClick={() => setIsSignupOpen(true)} className="landing-btn signup-btn">
            <UserPlus size={18} />
            Sign Up
          </button>
          <button onClick={() => setIsLoginOpen(true)} className="landing-btn login-btn">
            <LogIn size={18} />
            Login
          </button>
        </div>
      </div>

      {/* Modals */}
      <Modal 
        isOpen={isLoginOpen} 
        onClose={() => setIsLoginOpen(false)} 
        title="Sign In"
      >
        <LoginForm onSuccess={() => setIsLoginOpen(false)} />
        <div className="auth-switch" style={{marginTop: '20px', textAlign: 'center'}}>
          <p>
            Don't have an account?{" "}
            <button 
              onClick={() => { setIsLoginOpen(false); setIsSignupOpen(true); }} 
              style={{background: 'none', border: 'none', color: '#007bff', cursor: 'pointer', fontWeight: '600', padding: '0'}}
            >
              Register here
            </button>
          </p>
        </div>
      </Modal>

      <Modal 
        isOpen={isSignupOpen} 
        onClose={() => setIsSignupOpen(false)} 
        title="Create Account"
      >
        <SignupForm onSuccess={() => setIsSignupOpen(false)} />
        <div className="auth-switch" style={{marginTop: '20px', textAlign: 'center'}}>
          <p>
            Already have an account?{" "}
            <button 
              onClick={() => { setIsSignupOpen(false); setIsLoginOpen(true); }} 
              style={{background: 'none', border: 'none', color: '#007bff', cursor: 'pointer', fontWeight: '600', padding: '0'}}
            >
              Sign in here
            </button>
          </p>
        </div>
      </Modal>

      <p className="landing-footer">© {new Date().getFullYear()} ACLC College of Ormoc. All rights reserved.</p>
    </div>
  );
}

export default Landing;