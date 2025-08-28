import { Navigate, Outlet } from "react-router-dom";
import { MainLayout } from "./layout/MainLayout";
import { jwtDecode } from "jwt-decode";

const useAuth = () => {
  const token = localStorage.getItem("token");
  if (!token) return false;
  try {
    const decoded: any = jwtDecode(token);
    if (decoded.exp && Date.now() / 1000 > decoded.exp) {
      localStorage.removeItem('token');
      return false;
    }
    return true;
  } catch {
    localStorage.removeItem('token');
    return false;
  }
};

export const ProtectedRoute = () => {
  const isAuth = useAuth();
  return isAuth ? (
    <MainLayout>
      <Outlet />
    </MainLayout>
  ) : (
    <Navigate to="/login" />
  );
};
