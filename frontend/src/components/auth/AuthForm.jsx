import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import InputField from './InputField';
import ConSyncLogo from '../../assets/images/logo-white.png';

const AuthForm = ({
  isLogin = true,
  formData,
  errors,
  handleChange,
  handleSubmit,
  isLoading
}) => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <img src={ConSyncLogo} alt="ConSync Logo" className="h-12 w-auto" />
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          {isLogin ? 'Sign in to ConSync' : 'Create your account'}
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          {isLogin ? (
            <>
              New to ConSync?{' '}
              <Link to="/register" className="font-medium text-blue-600 hover:text-blue-500">
                Create an account
              </Link>
            </>
          ) : (
            <>
              Already have an account?{' '}
              <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500">
                Sign in
              </Link>
            </>
          )}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-xl rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {!isLogin && (
              <>
                <InputField
                  label="Full Name"
                  name="fullName"
                  value={formData.fullName || ''}
                  onChange={handleChange}
                  error={errors.fullName}
                  required
                  autoComplete="name"
                />
                <InputField
                  label="Company"
                  name="company"
                  value={formData.company || ''}
                  onChange={handleChange}
                  error={errors.company}
                  required
                />
              </>
            )}
            
            <InputField
              label="Email address"
              type="email"
              name="email"
              value={formData.email || ''}
              onChange={handleChange}
              error={errors.email}
              required
              autoComplete="email"
            />
            
            <InputField
              label="Password"
              type="password"
              name="password"
              value={formData.password || ''}
              onChange={handleChange}
              error={errors.password}
              required
              autoComplete={isLogin ? "current-password" : "new-password"}
            />

            {!isLogin && (
              <InputField
                label="Confirm Password"
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword || ''}
                onChange={handleChange}
                error={errors.confirmPassword}
                required
                autoComplete="new-password"
              />
            )}

            {isLogin && (
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                    Remember me
                  </label>
                </div>

                <div className="text-sm">
                  <Link to="/forgot-password" className="font-medium text-blue-600 hover:text-blue-500">
                    Forgot your password?
                  </Link>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className={`
                w-full flex justify-center py-2 px-4 border border-transparent rounded-md
                shadow-sm text-sm font-medium text-white bg-blue-600 
                transition-all duration-200 ease-in-out
                ${isLoading 
                  ? 'opacity-75 cursor-not-allowed'
                  : 'hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                }
              `}
            >
              {isLoading ? (
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                <>{isLogin ? 'Sign in' : 'Create account'}</>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

AuthForm.propTypes = {
  isLogin: PropTypes.bool,
  formData: PropTypes.object.isRequired,
  errors: PropTypes.object.isRequired,
  handleChange: PropTypes.func.isRequired,
  handleSubmit: PropTypes.func.isRequired,
  isLoading: PropTypes.bool.isRequired
};

export default AuthForm;