import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export function ErrorPage() {

    const navigate=useNavigate();

    useEffect(() => {
        const timeout = setTimeout(() => {
            navigate(-1); // Navigate to previous page
            }, 3000);

            return () => clearTimeout(timeout); // Cleanup on unmount
        }, [navigate]);

  return (
     <div style={{ padding: "2rem", textAlign: "center" }}>
        <h2>404 - Page Not Found</h2>
        <p>Redirecting to the previous page in 3 seconds...</p>
        </div>
  );
}