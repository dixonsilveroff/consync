import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { useAuth } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import NavigationBar from "./components/navigation/NavigationBar";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import AdminPage from "./pages/AdminPage";
import EngineerPage from "./pages/EngineerPage";
import ClientPage from "./pages/ClientPage";
import Unauthorized from "./pages/Unauthorized";

const AppContent = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      {user && <NavigationBar />}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className={user ? 'mt-6' : 'mt-0'}>
          <Routes>
            <Route path="/" element={
              <div className="text-center py-12">
                <h1 className="text-4xl font-bold text-gray-900 mb-4">
                  Welcome to ConSync
                </h1>
                <p className="text-xl text-gray-600">
                  Construction Lifecycle Management System
                </p>
              </div>
            } />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
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
          </Routes>
        </div>
      </main>
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </AuthProvider>
  );
}
