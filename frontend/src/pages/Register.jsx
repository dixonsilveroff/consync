import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    // role must match backend enum values (lowercase)
    role: "client",
  });
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await register(formData);
      // redirect back if we were sent here from a protected route
      const dest = location.state?.from?.pathname || "/";
      navigate(dest, { replace: true });
      setMessage("User registered and logged in!");
    } catch (err) {
      console.error(err.message || err);
      setMessage(err.message || "Registration failed");
    }
  };

  return (
    <div className="flex items-center justify-center">
      <div className="bg-white p-8 rounded-2xl shadow-md w-96">
        <h2 className="text-2xl font-bold mb-6 text-center text-blue-600">
          Create a ConSync Account
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            name="name"
            placeholder="Full Name"
            value={formData.name}
            onChange={handleChange}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <select
            name="role"
            value={formData.role}
            onChange={handleChange}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {/* Values must match backend enum: ["admin","engineer","client","contractor"] */}
            <option value="client">Client</option>
            <option value="contractor">Contractor</option>
            <option value="engineer">Project Engineer</option>
            <option value="admin">Admin</option>
          </select>
          <button
            type="submit"
            className="w-full bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 transition"
          >
            Register
          </button>
        </form>
        {message && <p className="text-center mt-4 text-sm text-gray-700">{message}</p>}
      </div>
    </div>
  );
}
