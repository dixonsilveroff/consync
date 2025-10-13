import { useState, useEffect } from 'react';
import api from '../api/apiClient';
import ProjectCard from '../components/ProjectCard';
import ProjectCardSkeleton from '../components/ProjectCardSkeleton';
import AddProjectModal from '../components/AddProjectModal';
import { useAuth } from '../context/AuthContext';
import { Plus } from 'lucide-react';

export default function ProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const { user, loading: authLoading } = useAuth();

  const fetchProjects = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/api/projects');
      console.log('Projects response:', res.data);
      setProjects(res.data.data || []);
    } catch (error) {
      console.error('Failed to fetch projects:', error);
      setError('Failed to load projects. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Only fetch projects when auth is ready and we have a user
    if (!authLoading && user) {
      fetchProjects();
    }
  }, [authLoading, user]);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-semibold text-gray-800">Projects</h1>
        {!authLoading && (user?.role === 'admin' || user?.role === 'engineer') && (
          <button
            onClick={() => setOpenModal(true)}
            className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            <Plus className="w-5 h-5 mr-1" /> Add Project
          </button>
        )}
      </div>
      {error ? (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-4">
          {error}
        </div>
      ) : null}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {authLoading || loading ? (
          <>
            <ProjectCardSkeleton />
            <ProjectCardSkeleton />
            <ProjectCardSkeleton />
            <ProjectCardSkeleton />
            <ProjectCardSkeleton />
            <ProjectCardSkeleton />
          </>
        ) : projects.length === 0 ? (
          <div className="col-span-full text-center py-8 text-gray-500">
            No projects found.
          </div>
        ) : (
          projects.map((p) => (
            <ProjectCard key={p._id} project={p} refresh={fetchProjects} />
          ))
        )}
      </div>
      {openModal && <AddProjectModal close={() => setOpenModal(false)} refresh={fetchProjects} />}
    </div>
  );
}