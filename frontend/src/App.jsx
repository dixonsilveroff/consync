import Login from "./pages/Login";
import Register from "./pages/Register";

export default function App() {
  return (
    <div className="flex h-screen items-center justify-center bg-gray-100">
      <h1 className="text-3xl font-bold text-blue-600">ConSync Frontend Works!</h1>
      <Login />
      <Register />
    </div>
  );
}
