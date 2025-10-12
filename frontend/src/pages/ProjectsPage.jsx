import { useState, useEffect } from 'react';
import axios from 'axios';
import ProjectCard from '../components/ProjectCard';
import AddProjectModal from '../components/AddProjectModal';
import { useAuth } from '../context/AuthContext';
import { Plus } from 'lucide-react';

export default function ProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const { user } = useAuth();

  const fetchProjects = async () => {
    const res = await axios.get('/api/projects', { withCredentials: true });
    setProjects(res.data.data || []);
  };

  useEffect(() => { fetchProjects(); }, []);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-semibold text-gray-800">Projects</h1>
        {user?.role === 'admin' && (
          <button
            onClick={() => setOpenModal(true)}
            className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            <Plus className="w-5 h-5 mr-1" /> Add Project
          </button>
        )}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {projects.map((p) => (
          <ProjectCard key={p._id} project={p} refresh={fetchProjects} />
        ))}
      </div>
      {openModal && <AddProjectModal close={() => setOpenModal(false)} refresh={fetchProjects} />}
    </div>
  );
}