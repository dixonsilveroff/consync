import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import UserProfileForm from '../components/UserProfileForm';
import ChangePasswordForm from '../components/ChangePasswordForm';
import { User, Lock, Activity, Calendar } from 'lucide-react';

const ProfilePage = () => {
  const { user } = useAuth();
  const [activeSection, setActiveSection] = useState('personal');

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-500">Loading profile...</div>
      </div>
    );
  }

  // Calculate member since date
  const memberSince = user.createdAt 
    ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : 'Recently';

  // Role badge color mapping
  const roleColors = {
    admin: 'bg-purple-100 text-purple-800 border-purple-200',
    engineer: 'bg-blue-100 text-blue-800 border-blue-200',
    client: 'bg-green-100 text-green-800 border-green-200',
    contractor: 'bg-orange-100 text-orange-800 border-orange-200',
  };

  return (
    <div className="min-h-screen bg-gray-50 py-4 sm:py-8">
      <div className="max-w-5xl mx-auto px-3 sm:px-6 lg:px-8">
        {/* Profile Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 mb-4 sm:mb-6">
          <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-6">
            {/* Avatar */}
            <div className="flex-shrink-0 mx-auto sm:mx-0">
              <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl sm:text-3xl font-bold">
                {user.name?.charAt(0).toUpperCase() || 'U'}
              </div>
            </div>

            {/* User Info */}
            <div className="flex-grow text-center sm:text-left w-full">
              <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3 mb-2">
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">{user.name}</h1>
                <span className={`px-3 py-1 rounded-full text-xs font-medium border ${roleColors[user.role] || 'bg-gray-100 text-gray-800 border-gray-200'}`}>
                  {user.role?.charAt(0).toUpperCase() + user.role?.slice(1)}
                </span>
              </div>
              <p className="text-gray-600 mb-1">{user.email}</p>
              {user.phone && (
                <p className="text-gray-600 mb-2">{user.phone}</p>
              )}
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Calendar className="w-4 h-4" />
                <span>Member since {memberSince}</span>
              </div>
            </div>
          </div>

          {/* Bio */}
          {user.bio && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <p className="text-gray-700">{user.bio}</p>
            </div>
          )}
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-4 sm:mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px overflow-x-auto">
              <button
                onClick={() => setActiveSection('personal')}
                className={`flex items-center gap-1 sm:gap-2 px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                  activeSection === 'personal'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <User className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Personal Information</span>
                <span className="sm:hidden">Personal</span>
              </button>
              <button
                onClick={() => setActiveSection('security')}
                className={`flex items-center gap-1 sm:gap-2 px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                  activeSection === 'security'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Lock className="w-3 h-3 sm:w-4 sm:h-4" />
                Security
              </button>
              <button
                onClick={() => setActiveSection('activity')}
                className={`flex items-center gap-1 sm:gap-2 px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                  activeSection === 'activity'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Activity className="w-4 h-4" />
                Activity
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeSection === 'personal' && (
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Update Your Profile</h2>
                <p className="text-gray-600 mb-6">
                  Update your personal information. Your email address cannot be changed.
                </p>
                <UserProfileForm />
              </div>
            )}

            {activeSection === 'security' && (
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Change Password</h2>
                <p className="text-gray-600 mb-6">
                  Update your password to keep your account secure. You will be logged out after changing your password.
                </p>
                <ChangePasswordForm />
              </div>
            )}

            {activeSection === 'activity' && (
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
                  <Activity className="w-12 h-12 text-blue-400 mx-auto mb-3" />
                  <p className="text-gray-600">
                    Activity tracking is coming soon! This will show your recent projects, tasks, and contributions.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
