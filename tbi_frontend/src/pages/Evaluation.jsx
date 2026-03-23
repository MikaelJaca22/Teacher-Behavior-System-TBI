import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

function Evaluation() {
  const navigate = useNavigate();

  useEffect(() => {
    const student = localStorage.getItem("student");
    if (!student) {
      navigate("/");
    }
  }, []);

  return <h1>Welcome to Evaluation 📝</h1>;
}

export default Evaluation;
