import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { LoginPage } from "./pages/LoginPage";
import { DashboardPage } from "./pages/DashboardPage";
import { AddVulnerabilityPage } from "./pages/AddVulnerabilityPage";
import { EditVulnerabilityPage } from "./pages/EditVulnerabilityPage";
import { UserManagementPage } from "./pages/UserManagementPage";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { AdminRoute } from "./components/AdminRoute";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/vulnerabilities/new" element={<AddVulnerabilityPage />} />
          <Route path="/vulnerabilities/:id/edit" element={<EditVulnerabilityPage />} />
          <Route element={<AdminRoute />}>
            <Route path="/users" element={<UserManagementPage />} />
          </Route>
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
