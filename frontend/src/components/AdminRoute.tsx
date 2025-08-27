import { Navigate, Outlet } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

const useAdminAuth = () => {
  const token = localStorage.getItem("token");
  if (!token) {
    return false;
  }
  try {
    const decodedToken: { isAdmin: boolean } = jwtDecode(token);
    return decodedToken.isAdmin;
  } catch (error) {
    console.error("Error decoding token:", error);
    return false;
  }
};

export const AdminRoute = () => {
  const isAdmin = useAdminAuth();
  return isAdmin ? <Outlet /> : <Navigate to="/" />;
};
