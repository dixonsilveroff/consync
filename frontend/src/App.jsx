import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import AdminPage from "./pages/AdminPage";
import EngineerPage from "./pages/EngineerPage";
import ClientPage from "./pages/ClientPage";
import Unauthorized from "./pages/Unauthorized";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-gray-50">
          <nav className="p-4 bg-white shadow">
            <Link to="/" className="mr-4 text-blue-600">Home</Link>
            <Link to="/dashboard" className="mr-4">Dashboard</Link>
            <Link to="/admin" className="mr-4">Admin</Link>
            <Link to="/engineer" className="mr-4">Engineer</Link>
            <Link to="/client" className="mr-4">Client</Link>
            <Link to="/login" className="mr-4">Login</Link>
            <Link to="/register">Register</Link>
          </nav>

          <Routes>
            <Route path="/" element={<div className="p-8">Welcome to ConSync frontend demo</div>} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/unauthorized" element={<Unauthorized />} />

            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />

            <Route path="/admin" element={
              <ProtectedRoute roles={["Admin", "admin"]}>
                <AdminPage />
              </ProtectedRoute>
            } />

            <Route path="/engineer" element={
              <ProtectedRoute roles={["Project Engineer", "project engineer", "engineer"]}>
                <EngineerPage />
              </ProtectedRoute>
            } />

            <Route path="/client" element={
              <ProtectedRoute roles={["Client"]}>
                <ClientPage />
              </ProtectedRoute>
            } />
          </Routes>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}
