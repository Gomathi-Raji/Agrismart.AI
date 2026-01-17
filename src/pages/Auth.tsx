import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Auth() {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to role-based login since Clerk is removed
    navigate("/role-login");
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-feature flex items-center justify-center">
      <div className="text-center">
        <p>Redirecting to role-based login...</p>
      </div>
    </div>
  );
}