import { useState, useEffect } from "react";
import SemesterBadge from "./SemesterBadge";
import { getCurrentPeriod } from "../api";
import "./Navbar.css";

function Navbar() {
  const [currentPeriod, setCurrentPeriod] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPeriod = async () => {
      try {
        const response = await getCurrentPeriod();
        if (response.data.success) {
          setCurrentPeriod(response.data.current_period);
        }
      } catch (err) {
        console.error("Error fetching current period:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPeriod();
  }, []);

  return (
    <header className="navbar">
      <h2 className="navbar-title">Teacher Evaluation</h2>
      <div className="navbar-right">
        <SemesterBadge period={currentPeriod} loading={loading} />
      </div>
    </header>
  );
}

export default Navbar;
