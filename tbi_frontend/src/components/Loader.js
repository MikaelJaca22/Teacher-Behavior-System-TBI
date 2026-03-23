import React from "react";
import './Loader.css';

export default function Loader({ visible }) {
  return (
    <div className={`loader-overlay ${visible ? 'show' : 'hide'}`}>
      <div className="loader-content">
        <img src="/1.png" alt="ACLC Logo" className="loader-logo" />
        <p>Loading... Please wait</p>
      </div>
    </div>
  );
}
