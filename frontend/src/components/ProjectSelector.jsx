import { useState, useEffect } from 'react';
import api from '../api/apiClient';

export default function ProjectSelector({ onProjectSelect, selectedProjectId = null }) {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await api.get('/api/projects?status=active&limit=100');
        const projectsData = res.data?.data || [];
        setProjects(Array.isArray(projectsData) ? projectsData : []);
      } catch (error) {
        console.error('Failed to fetch projects:', error);
        setProjects([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  const handleChange = (e) => {
    const projectId = e.target.value;
    onProjectSelect(projectId || null);
  };

  if (loading) {
    return (
      <select 
        disabled 
        className="px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-400"
      >
        <option>Loading projects...</option>
      </select>
    );
  }

  return (
    <select
      value={selectedProjectId || ''}
      onChange={handleChange}
      className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
    >
      <option value="">All Projects (Aggregated)</option>
      {projects.map((project) => (
        <option key={project._id} value={project._id}>
          {project.title}
        </option>
      ))}
    </select>
  );
}
