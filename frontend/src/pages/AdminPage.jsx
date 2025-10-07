import { useAuth } from "../context/AuthContext";

export default function AdminPage() {
  const { user, logout } = useAuth();
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold">Admin Dashboard</h1>
      <p className="mt-4">Welcome, {user?.name} ({user?.role})</p>
      <button onClick={logout} className="mt-4 px-4 py-2 bg-red-500 text-white rounded">Logout</button>
    </div>
  );
}
