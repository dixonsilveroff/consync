import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../api/apiClient';
import UserProfileForm from '../components/UserProfileForm';
import ChangePasswordForm from '../components/ChangePasswordForm';
import { User, Lock, Activity, Calendar, Building2, Users, Mail, Phone, Globe, MapPin, AlertCircle, ExternalLink } from 'lucide-react';

const ProfilePage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('personal');
  const [organization, setOrganization] = useState(null);
  const [teamMembers, setTeamMembers] = useState([]);
  const [loadingOrg, setLoadingOrg] = useState(false);

  // Fetch organization data for contractors
  useEffect(() => {
    const fetchOrganizationData = async () => {
      if (user?.role !== 'contractor' || !user?.organization) return;

      setLoadingOrg(true);
      try {
        // Fetch organization details
        const orgResponse = await api.get(`/api/organizations/${user.organization}`);
        setOrganization(orgResponse.data);

        // Fetch team members (users in the same organization)
        if (orgResponse.data?.members && orgResponse.data.members.length > 0) {
          const membersResponse = await api.get(`/api/organizations/${user.organization}/members`);
          setTeamMembers(membersResponse.data.members || []);
        }
      } catch (error) {
        console.error('Failed to fetch organization data:', error);
      } finally {
        setLoadingOrg(false);
      }
    };

    fetchOrganizationData();
  }, [user]);

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
              
              {/* Organization tab - Contractors only */}
              {user.role === 'contractor' && (
                <>
                  <button
                    onClick={() => setActiveSection('organization')}
                    className={`flex items-center gap-1 sm:gap-2 px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                      activeSection === 'organization'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Building2 className="w-3 h-3 sm:w-4 sm:h-4" />
                    Organization
                  </button>
                  <button
                    onClick={() => setActiveSection('team')}
                    className={`flex items-center gap-1 sm:gap-2 px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                      activeSection === 'team'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Users className="w-3 h-3 sm:w-4 sm:h-4" />
                    Team
                  </button>
                </>
              )}
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

            {/* Organization Section - Contractors only */}
            {activeSection === 'organization' && user.role === 'contractor' && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">Organization Details</h2>
                  {!user.onboardingCompleted && (
                    <button
                      onClick={() => navigate('/dashboard')}
                      className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                    >
                      Complete Onboarding
                    </button>
                  )}
                </div>

                {!user.organization ? (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <h3 className="font-semibold text-yellow-900 mb-1">No Organization Yet</h3>
                        <p className="text-yellow-800 mb-3">
                          Complete your onboarding to create your organization profile and start inviting team members.
                        </p>
                        <button
                          onClick={() => navigate('/dashboard')}
                          className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors text-sm font-medium"
                        >
                          Complete Onboarding
                        </button>
                      </div>
                    </div>
                  </div>
                ) : loadingOrg ? (
                  <div className="text-center py-8">
                    <div className="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-gray-600 mt-2">Loading organization...</p>
                  </div>
                ) : organization ? (
                  <div className="space-y-6">
                    {/* Organization Info Card */}
                    <div className="bg-gradient-to-br from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-6">
                      <div className="flex items-start gap-4">
                        <div className="w-16 h-16 bg-blue-600 rounded-lg flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
                          {organization.name?.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-grow">
                          <h3 className="text-xl font-bold text-gray-900 mb-1">{organization.name}</h3>
                          <p className="text-gray-600 mb-3">{organization.industry}</p>
                          {organization.description && (
                            <p className="text-gray-700 mb-3">{organization.description}</p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Contact Information */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {organization.location && (
                        <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                          <MapPin className="w-5 h-5 text-gray-600 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium text-gray-700">Location</p>
                            <p className="text-gray-900">{organization.location}</p>
                          </div>
                        </div>
                      )}

                      {organization.phone && (
                        <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                          <Phone className="w-5 h-5 text-gray-600 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium text-gray-700">Phone</p>
                            <a href={`tel:${organization.phone}`} className="text-blue-600 hover:underline">
                              {organization.phone}
                            </a>
                          </div>
                        </div>
                      )}

                      {organization.email && (
                        <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                          <Mail className="w-5 h-5 text-gray-600 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium text-gray-700">Email</p>
                            <a href={`mailto:${organization.email}`} className="text-blue-600 hover:underline">
                              {organization.email}
                            </a>
                          </div>
                        </div>
                      )}

                      {organization.website && (
                        <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                          <Globe className="w-5 h-5 text-gray-600 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium text-gray-700">Website</p>
                            <a 
                              href={organization.website.startsWith('http') ? organization.website : `https://${organization.website}`}
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline flex items-center gap-1"
                            >
                              {organization.website}
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Quick Stats */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                        <p className="text-2xl font-bold text-green-700">
                          {organization.members?.length || 0}
                        </p>
                        <p className="text-sm text-green-600 font-medium">Team Members</p>
                      </div>
                      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 text-center">
                        <p className="text-2xl font-bold text-purple-700">
                          {organization.active ? 'Active' : 'Inactive'}
                        </p>
                        <p className="text-sm text-purple-600 font-medium">Status</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-600">Failed to load organization details</p>
                  </div>
                )}
              </div>
            )}

            {/* Team Section - Contractors only */}
            {activeSection === 'team' && user.role === 'contractor' && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">Team Members</h2>
                  <button
                    onClick={() => navigate('/invite-team')}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                  >
                    <Mail className="w-4 h-4" />
                    Invite Team
                  </button>
                </div>

                {!user.organization ? (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <h3 className="font-semibold text-yellow-900 mb-1">No Organization Yet</h3>
                        <p className="text-yellow-800 mb-3">
                          Create your organization first to start building your team.
                        </p>
                        <button
                          onClick={() => navigate('/dashboard')}
                          className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors text-sm font-medium"
                        >
                          Complete Onboarding
                        </button>
                      </div>
                    </div>
                  </div>
                ) : loadingOrg ? (
                  <div className="text-center py-8">
                    <div className="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-gray-600 mt-2">Loading team members...</p>
                  </div>
                ) : teamMembers.length > 0 ? (
                  <div className="space-y-3">
                    {teamMembers.map((member) => (
                      <div 
                        key={member._id || member.id}
                        className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-blue-300 transition-colors"
                      >
                        {/* Avatar */}
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-lg font-bold flex-shrink-0">
                          {member.name?.charAt(0).toUpperCase() || 'U'}
                        </div>

                        {/* Member Info */}
                        <div className="flex-grow">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold text-gray-900">{member.name}</h4>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                              member.role === 'contractor' ? 'bg-orange-100 text-orange-700' :
                              member.role === 'engineer' ? 'bg-blue-100 text-blue-700' :
                              member.role === 'client' ? 'bg-green-100 text-green-700' :
                              'bg-gray-100 text-gray-700'
                            }`}>
                              {member.role?.charAt(0).toUpperCase() + member.role?.slice(1)}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600">{member.email}</p>
                          {member.phone && (
                            <p className="text-sm text-gray-500">{member.phone}</p>
                          )}
                        </div>

                        {/* Contact Actions */}
                        <div className="flex items-center gap-2">
                          <a
                            href={`mailto:${member.email}`}
                            className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Send email"
                          >
                            <Mail className="w-4 h-4" />
                          </a>
                          {member.phone && (
                            <a
                              href={`tel:${member.phone}`}
                              className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                              title="Call"
                            >
                              <Phone className="w-4 h-4" />
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
                    <Users className="w-12 h-12 text-blue-400 mx-auto mb-3" />
                    <h3 className="font-semibold text-gray-900 mb-2">No Team Members Yet</h3>
                    <p className="text-gray-600 mb-4">
                      Start building your team by inviting engineers and clients to collaborate on your projects.
                    </p>
                    <button
                      onClick={() => navigate('/invite-team')}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                    >
                      <Mail className="w-4 h-4" />
                      Invite Your First Team Member
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
