import { Navigate, Outlet } from "react-router-dom";
import { MainLayout } from "./layout/MainLayout";

const useAuth = () => {
  const token = localStorage.getItem("token");
  return token != null;
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
