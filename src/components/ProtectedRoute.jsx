import { Navigate, Outlet } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { toast } from "react-toastify";

const ProtectedRoute = ({ requiredRoles = [] }) => {
  const token = localStorage.getItem("token");

  if (!token) {
    toast.error("Vous devez vous connecter pour accéder à cette page");
    return <Navigate to="/" replace />;
  }

  try {
    const decoded = jwtDecode(token);
    
    if (decoded.exp * 1000 < Date.now()) {
      localStorage.removeItem("token");
      toast.error("Session expirée, veuillez vous reconnecter");
      return <Navigate to="/" replace />;
    }

    if (requiredRoles.length > 0) {
      const userRoles = decoded.roles || [];
      if (!requiredRoles.some(role => userRoles.includes(role))) {
        toast.error("Vous n'avez pas les droits nécessaires");
        return <Navigate to="/" replace />;
      }
    }
  } catch (error) {
    localStorage.removeItem("token");
    toast.error("Session invalide, veuillez vous reconnecter");
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;