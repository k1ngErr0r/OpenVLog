import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { LoginPage } from "./pages/LoginPage";
import { SetupPage } from './pages/SetupPage';
import { DashboardPage } from "./pages/DashboardPage";
import { AddVulnerabilityPage } from "./pages/AddVulnerabilityPage";
import { EditVulnerabilityPage } from "./pages/EditVulnerabilityPage";
import { UserManagementPage } from "./pages/UserManagementPage";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { AdminRoute } from "./components/AdminRoute";
import { HelpPage } from "./pages/HelpPage";
import { Header } from "./components/ui/header";
import { Footer } from "./components/ui/footer";
import { ToastProvider } from './components/ui/toast';
import { ErrorBoundary } from './components/ErrorBoundary';
import { SetupGuard } from './components/SetupGuard';

function App() {
  return (
    <Router>
      <ToastProvider>
        <ErrorBoundary>
          <div className="min-h-screen bg-gray-100 dark:bg-gray-950 text-gray-900 dark:text-gray-100">
            <Header />
            <main id="main" className="max-w-6xl mx-auto px-4 pb-10" role="main">
              <SetupGuard>
                <Routes>
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/setup" element={<SetupPage />} />
                  <Route element={<ProtectedRoute />}>
                    <Route path="/" element={<DashboardPage />} />
                    <Route path="/vulnerabilities/new" element={<AddVulnerabilityPage />} />
                    <Route path="/vulnerabilities/:id/edit" element={<EditVulnerabilityPage />} />
                    <Route path="/help" element={<HelpPage />} />
                    <Route element={<AdminRoute />}>
                      <Route path="/users" element={<UserManagementPage />} />
                    </Route>
                  </Route>
                </Routes>
              </SetupGuard>
            </main>
            <Footer />
          </div>
        </ErrorBoundary>
      </ToastProvider>
    </Router>
  );
}

export default App;
