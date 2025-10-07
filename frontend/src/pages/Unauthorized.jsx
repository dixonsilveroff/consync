import { Link } from "react-router-dom";

export default function Unauthorized() {
  return (
    <div className="flex items-center justify-center h-screen bg-gray-50">
      <div className="bg-white p-8 rounded shadow-md w-96 text-center">
        <h2 className="text-2xl font-bold mb-4 text-red-600">Unauthorized</h2>
        <p className="mb-4">You do not have access to this page.</p>
        <Link to="/" className="text-blue-600 hover:underline">Go home</Link>
      </div>
    </div>
  );
}
