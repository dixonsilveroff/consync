import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Save, Loader2 } from 'lucide-react';

const UserProfileForm = () => {
  const { user, updateProfile } = useAuth();
  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    bio: user?.bio || '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
    // Clear success message when user starts editing
    if (success) setSuccess(false);
  };

  const validate = () => {
    const newErrors = {};

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    // Phone validation (optional but must be valid format if provided)
    if (formData.phone.trim()) {
      const phoneRegex = /^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/;
      if (!phoneRegex.test(formData.phone.trim())) {
        newErrors.phone = 'Please enter a valid phone number';
      }
    }

    // Bio validation
    if (formData.bio.length > 500) {
      newErrors.bio = 'Bio must be 500 characters or less';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validate()) return;

    setLoading(true);
    setSuccess(false);

    try {
      await updateProfile({
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        bio: formData.bio.trim(),
      });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 5000);
    } catch (error) {
      setErrors({
        submit: error.message || 'Failed to update profile. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  };

  const isFormChanged = () => {
    return (
      formData.name !== (user?.name || '') ||
      formData.phone !== (user?.phone || '') ||
      formData.bio !== (user?.bio || '')
    );
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl">
      {/* Success Message */}
      {success && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <p className="text-green-800 font-medium">Profile updated successfully!</p>
        </div>
      )}

      {/* Submit Error */}
      {errors.submit && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800">{errors.submit}</p>
        </div>
      )}

      {/* Name Field */}
      <div className="mb-6">
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
          Full Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors ${
            errors.name ? 'border-red-300 bg-red-50' : 'border-gray-300'
          }`}
          placeholder="Enter your full name"
        />
        {errors.name && (
          <p className="mt-1 text-sm text-red-600">{errors.name}</p>
        )}
      </div>

      {/* Email Field (Read-only) */}
      <div className="mb-6">
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
          Email Address
        </label>
        <input
          type="email"
          id="email"
          value={user?.email || ''}
          disabled
          className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
        />
        <p className="mt-1 text-xs text-gray-500">Email address cannot be changed</p>
      </div>

      {/* Phone Field */}
      <div className="mb-6">
        <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
          Phone Number
        </label>
        <input
          type="tel"
          id="phone"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors ${
            errors.phone ? 'border-red-300 bg-red-50' : 'border-gray-300'
          }`}
          placeholder="+234 123 456 7890"
        />
        {errors.phone && (
          <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
        )}
      </div>

      {/* Role Field (Read-only) */}
      <div className="mb-6">
        <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-2">
          Role
        </label>
        <input
          type="text"
          id="role"
          value={user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : ''}
          disabled
          className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
        />
        <p className="mt-1 text-xs text-gray-500">Role is assigned by administrators</p>
      </div>

      {/* Bio Field */}
      <div className="mb-6">
        <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-2">
          Bio
        </label>
        <textarea
          id="bio"
          name="bio"
          value={formData.bio}
          onChange={handleChange}
          rows={4}
          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors resize-none ${
            errors.bio ? 'border-red-300 bg-red-50' : 'border-gray-300'
          }`}
          placeholder="Tell us a bit about yourself..."
          maxLength={500}
        />
        <div className="flex justify-between mt-1">
          {errors.bio ? (
            <p className="text-sm text-red-600">{errors.bio}</p>
          ) : (
            <p className="text-xs text-gray-500">A brief description about yourself</p>
          )}
          <p className="text-xs text-gray-500">
            {formData.bio.length}/500
          </p>
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex items-center gap-4">
        <button
          type="submit"
          disabled={loading || !isFormChanged()}
          className={`flex items-center gap-2 px-6 py-2 rounded-lg font-medium transition-colors ${
            loading || !isFormChanged()
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              Save Changes
            </>
          )}
        </button>
        
        {isFormChanged() && !loading && (
          <button
            type="button"
            onClick={() => {
              setFormData({
                name: user?.name || '',
                phone: user?.phone || '',
                bio: user?.bio || '',
              });
              setErrors({});
              setSuccess(false);
            }}
            className="px-6 py-2 text-gray-700 hover:text-gray-900 font-medium"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
};

export default UserProfileForm;
