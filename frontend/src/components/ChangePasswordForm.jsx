import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Lock, Eye, EyeOff, Check, X, Loader2 } from 'lucide-react';

const ChangePasswordForm = () => {
  const { changePassword } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // Password strength requirements
  const requirements = [
    { id: 'length', label: 'At least 8 characters', test: (pwd) => pwd.length >= 8 },
    { id: 'uppercase', label: 'One uppercase letter', test: (pwd) => /[A-Z]/.test(pwd) },
    { id: 'lowercase', label: 'One lowercase letter', test: (pwd) => /[a-z]/.test(pwd) },
    { id: 'number', label: 'One number', test: (pwd) => /[0-9]/.test(pwd) },
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear errors when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const validate = () => {
    const newErrors = {};

    // Current password required
    if (!formData.currentPassword) {
      newErrors.currentPassword = 'Current password is required';
    }

    // New password validation
    if (!formData.newPassword) {
      newErrors.newPassword = 'New password is required';
    } else {
      // Check all requirements
      const failedRequirements = requirements.filter(req => !req.test(formData.newPassword));
      if (failedRequirements.length > 0) {
        newErrors.newPassword = 'Password does not meet all requirements';
      }
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your new password';
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    // Check if new password is same as current
    if (formData.newPassword && formData.currentPassword === formData.newPassword) {
      newErrors.newPassword = 'New password must be different from current password';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validate()) return;

    setLoading(true);

    try {
      await changePassword(formData.currentPassword, formData.newPassword);
      
      // Show success message and redirect to login after a short delay
      alert('Password changed successfully! You will be logged out and redirected to login.');
      
      // Small delay to let user read the message
      setTimeout(() => {
        navigate('/login');
      }, 1500);
    } catch (error) {
      setErrors({
        submit: error.message || 'Failed to change password. Please check your current password and try again.'
      });
      setLoading(false);
    }
  };

  const getPasswordStrength = () => {
    if (!formData.newPassword) return { label: '', color: '', width: '0%' };
    
    const passed = requirements.filter(req => req.test(formData.newPassword)).length;
    const percentage = (passed / requirements.length) * 100;

    if (percentage <= 25) return { label: 'Weak', color: 'bg-red-500', width: '25%' };
    if (percentage <= 50) return { label: 'Fair', color: 'bg-orange-500', width: '50%' };
    if (percentage <= 75) return { label: 'Good', color: 'bg-yellow-500', width: '75%' };
    return { label: 'Strong', color: 'bg-green-500', width: '100%' };
  };

  const strength = getPasswordStrength();

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl">
      {/* Warning Message */}
      <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p className="text-yellow-800 text-sm">
          <strong>Note:</strong> After changing your password, you will be logged out and need to log in again with your new password.
        </p>
      </div>

      {/* Submit Error */}
      {errors.submit && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800">{errors.submit}</p>
        </div>
      )}

      {/* Current Password */}
      <div className="mb-6">
        <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-2">
          Current Password <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Lock className="w-5 h-5 text-gray-400" />
          </div>
          <input
            type={showPasswords.current ? 'text' : 'password'}
            id="currentPassword"
            name="currentPassword"
            value={formData.currentPassword}
            onChange={handleChange}
            className={`w-full pl-10 pr-10 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors ${
              errors.currentPassword ? 'border-red-300 bg-red-50' : 'border-gray-300'
            }`}
            placeholder="Enter your current password"
          />
          <button
            type="button"
            onClick={() => togglePasswordVisibility('current')}
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
          >
            {showPasswords.current ? (
              <EyeOff className="w-5 h-5 text-gray-400 hover:text-gray-600" />
            ) : (
              <Eye className="w-5 h-5 text-gray-400 hover:text-gray-600" />
            )}
          </button>
        </div>
        {errors.currentPassword && (
          <p className="mt-1 text-sm text-red-600">{errors.currentPassword}</p>
        )}
      </div>

      {/* New Password */}
      <div className="mb-6">
        <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-2">
          New Password <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Lock className="w-5 h-5 text-gray-400" />
          </div>
          <input
            type={showPasswords.new ? 'text' : 'password'}
            id="newPassword"
            name="newPassword"
            value={formData.newPassword}
            onChange={handleChange}
            className={`w-full pl-10 pr-10 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors ${
              errors.newPassword ? 'border-red-300 bg-red-50' : 'border-gray-300'
            }`}
            placeholder="Enter your new password"
          />
          <button
            type="button"
            onClick={() => togglePasswordVisibility('new')}
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
          >
            {showPasswords.new ? (
              <EyeOff className="w-5 h-5 text-gray-400 hover:text-gray-600" />
            ) : (
              <Eye className="w-5 h-5 text-gray-400 hover:text-gray-600" />
            )}
          </button>
        </div>
        {errors.newPassword && (
          <p className="mt-1 text-sm text-red-600">{errors.newPassword}</p>
        )}

        {/* Password Strength Indicator */}
        {formData.newPassword && (
          <div className="mt-3">
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs text-gray-600">Password strength:</span>
              <span className={`text-xs font-medium ${
                strength.label === 'Strong' ? 'text-green-600' :
                strength.label === 'Good' ? 'text-yellow-600' :
                strength.label === 'Fair' ? 'text-orange-600' :
                'text-red-600'
              }`}>
                {strength.label}
              </span>
            </div>
            <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className={`h-full ${strength.color} transition-all duration-300`}
                style={{ width: strength.width }}
              ></div>
            </div>
          </div>
        )}

        {/* Password Requirements */}
        {formData.newPassword && (
          <div className="mt-3 space-y-2">
            {requirements.map(req => {
              const passed = req.test(formData.newPassword);
              return (
                <div key={req.id} className="flex items-center gap-2 text-sm">
                  {passed ? (
                    <Check className="w-4 h-4 text-green-500" />
                  ) : (
                    <X className="w-4 h-4 text-gray-400" />
                  )}
                  <span className={passed ? 'text-green-700' : 'text-gray-600'}>
                    {req.label}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Confirm Password */}
      <div className="mb-6">
        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
          Confirm New Password <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Lock className="w-5 h-5 text-gray-400" />
          </div>
          <input
            type={showPasswords.confirm ? 'text' : 'password'}
            id="confirmPassword"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            className={`w-full pl-10 pr-10 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors ${
              errors.confirmPassword ? 'border-red-300 bg-red-50' : 'border-gray-300'
            }`}
            placeholder="Confirm your new password"
          />
          <button
            type="button"
            onClick={() => togglePasswordVisibility('confirm')}
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
          >
            {showPasswords.confirm ? (
              <EyeOff className="w-5 h-5 text-gray-400 hover:text-gray-600" />
            ) : (
              <Eye className="w-5 h-5 text-gray-400 hover:text-gray-600" />
            )}
          </button>
        </div>
        {errors.confirmPassword && (
          <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
        )}
        {formData.confirmPassword && formData.newPassword === formData.confirmPassword && (
          <div className="mt-1 flex items-center gap-2 text-sm text-green-600">
            <Check className="w-4 h-4" />
            <span>Passwords match</span>
          </div>
        )}
      </div>

      {/* Submit Button */}
      <div className="flex items-center gap-4">
        <button
          type="submit"
          disabled={loading}
          className={`flex items-center gap-2 px-6 py-2 rounded-lg font-medium transition-colors ${
            loading
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Changing Password...
            </>
          ) : (
            <>
              <Lock className="w-4 h-4" />
              Change Password
            </>
          )}
        </button>
        
        {!loading && (
          <button
            type="button"
            onClick={() => {
              setFormData({
                currentPassword: '',
                newPassword: '',
                confirmPassword: '',
              });
              setErrors({});
            }}
            className="px-6 py-2 text-gray-700 hover:text-gray-900 font-medium"
          >
            Clear
          </button>
        )}
      </div>
    </form>
  );
};

export default ChangePasswordForm;
