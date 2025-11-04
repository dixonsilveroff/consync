import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ToastProvider } from "./context/ToastContext";
import ErrorBoundary from "./components/ErrorBoundary";
import ProtectedRoute from "./components/ProtectedRoute";
import NavigationBar from "./components/navigation/NavigationBar";
import LoadingScreen from "./components/LoadingScreen";

// Lazy load pages for better performance
const LandingPage = lazy(() => import("./pages/LandingPage"));
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const AdminPage = lazy(() => import("./pages/AdminPage"));
const EngineerPage = lazy(() => import("./pages/EngineerPage"));
const ClientPage = lazy(() => import("./pages/ClientPage"));
const Unauthorized = lazy(() => import("./pages/Unauthorized"));
const ProjectsPage = lazy(() => import("./pages/ProjectsPage"));
const ProjectDetails = lazy(() => import("./pages/ProjectDetails"));
const TasksPage = lazy(() => import("./pages/TasksPage"));
const ResourcesPage = lazy(() => import("./pages/ResourcesPage"));
const ProfilePage = lazy(() => import("./pages/ProfilePage"));
const InviteTeam = lazy(() => import("./pages/InviteTeam"));
const AcceptInvitation = lazy(() => import("./pages/AcceptInvitation"));

const AppContent = () => {
  const location = useLocation();
  const isLandingPage = location.pathname === '/';
  const isAuthPage = ['/login', '/register'].includes(location.pathname);
  const isAcceptInvitePage = location.pathname.startsWith('/accept-invite/');

  return (
    <div className="min-h-screen bg-gray-50">
      {!isLandingPage && !isAuthPage && !isAcceptInvitePage && <NavigationBar />}
      <main className={!isLandingPage && !isAuthPage && !isAcceptInvitePage ? "max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6" : ""}>
        <div className={!isLandingPage && !isAuthPage && !isAcceptInvitePage ? "mt-4 sm:mt-6" : ""}>
          <Suspense fallback={<LoadingScreen />}>
            <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/accept-invite/:token" element={<AcceptInvitation />} />
            <Route path="/unauthorized" element={<Unauthorized />} />

            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />

            <Route path="/admin" element={
              <ProtectedRoute roles={["admin"]}>
                <AdminPage />
              </ProtectedRoute>
            } />

            <Route path="/engineer" element={
              <ProtectedRoute roles={["engineer"]}>
                <EngineerPage />
              </ProtectedRoute>
            } />

            <Route path="/client" element={
              <ProtectedRoute roles={["client"]}>
                <ClientPage />
              </ProtectedRoute>
            } />

            <Route path="/projects" element={
              <ProtectedRoute>
                <ProjectsPage />
              </ProtectedRoute>
            } />
            
            <Route path="/projects/:id" element={
              <ProtectedRoute>
                <ProjectDetails />
              </ProtectedRoute>
            } />

            <Route path="/tasks" element={
              <ProtectedRoute>
                <TasksPage />
              </ProtectedRoute>
            } />

            <Route path="/resources" element={
              <ProtectedRoute roles={["admin", "engineer"]}>
                <ResourcesPage />
              </ProtectedRoute>
            } />

            <Route path="/profile" element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            } />

            <Route path="/invite-team" element={
              <ProtectedRoute roles={["contractor"]}>
                <InviteTeam />
              </ProtectedRoute>
            } />
          </Routes>
          </Suspense>
        </div>
      </main>
    </div>
  );
};

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <ToastProvider>
          <BrowserRouter>
            <AppContent />
          </BrowserRouter>
        </ToastProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}
