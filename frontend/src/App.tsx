import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { lazy, Suspense } from 'react';
// Lazy loaded pages (route-level code splitting)
const LoginPage = lazy(() => import('./pages/LoginPage').then(m => ({ default: m.LoginPage })));
const SetupPage = lazy(() => import('./pages/SetupPage').then(m => ({ default: m.SetupPage })));
const DashboardPage = lazy(() => import('./pages/DashboardPage').then(m => ({ default: m.DashboardPage })));
const AddVulnerabilityPage = lazy(() => import('./pages/AddVulnerabilityPage').then(m => ({ default: m.AddVulnerabilityPage })));
const EditVulnerabilityPage = lazy(() => import('./pages/EditVulnerabilityPage').then(m => ({ default: m.EditVulnerabilityPage })));
const VulnerabilityDetailPage = lazy(() => import('./pages/VulnerabilityDetailPage').then(m => ({ default: m.VulnerabilityDetailPage })));
const RequestPasswordResetPage = lazy(() => import('./pages/RequestPasswordResetPage').then(m => ({ default: m.RequestPasswordResetPage })));
const ResetPasswordPage = lazy(() => import('./pages/ResetPasswordPage').then(m => ({ default: m.ResetPasswordPage })));
const UserManagementPage = lazy(() => import('./pages/UserManagementPage').then(m => ({ default: m.UserManagementPage })));
import { ProtectedRoute } from "./components/ProtectedRoute";
import { AdminRoute } from "./components/AdminRoute";
import { HelpPage } from "./pages/HelpPage";
import { Footer } from "./components/ui/footer";
import { ToastProvider } from './components/ui/toast';
import { ErrorBoundary } from './components/ErrorBoundary';
import { SetupGuard } from './components/SetupGuard';
import { CommandPaletteProvider } from './components/command-palette/CommandPaletteProvider';
import { OnboardingTour } from './components/onboarding/OnboardingTour';

function App() {
  return (
    <Router>
      <ToastProvider>
        <ErrorBoundary>
          <CommandPaletteProvider>
            <div className="min-h-screen bg-gray-100 dark:bg-gray-950 text-gray-900 dark:text-gray-100 flex">
              {/* Sidebar now provides primary navigation; header removed */}
              <main id="main" className="max-w-6xl mx-auto px-4 pb-10" role="main">
                <SetupGuard>
                  <Suspense fallback={<div className="py-10 text-center text-sm text-gray-500">Loading...</div>}>
                    <Routes>
                      <Route path="/login" element={<LoginPage />} />
                      <Route path="/request-password-reset" element={<RequestPasswordResetPage />} />
                      <Route path="/reset-password" element={<ResetPasswordPage />} />
                      <Route path="/setup" element={<SetupPage />} />
                      <Route element={<ProtectedRoute />}>
                        <Route path="/" element={<DashboardPage />} />
                        <Route path="/vulnerabilities/new" element={<AddVulnerabilityPage />} />
                        <Route path="/vulnerabilities/:id" element={<VulnerabilityDetailPage />} />
                        <Route path="/vulnerabilities/:id/edit" element={<EditVulnerabilityPage />} />
                        <Route path="/help" element={<HelpPage />} />
                        <Route element={<AdminRoute />}>
                          <Route path="/users" element={<UserManagementPage />} />
                        </Route>
                      </Route>
                    </Routes>
                  </Suspense>
                </SetupGuard>
              </main>
              <Footer />
              <OnboardingTour />
            </div>
          </CommandPaletteProvider>
        </ErrorBoundary>
      </ToastProvider>
    </Router>
  );
}

export default App;
