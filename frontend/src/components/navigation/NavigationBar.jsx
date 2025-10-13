import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { NotificationBell } from '../NotificationBell';

const NavigationBar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, logout, loading } = useAuth();
  const location = useLocation();

  const isCurrentPath = (path) => {
    return location.pathname === path;
  };

  const getNavigationItems = () => {
    const authNavItems = [
      { name: 'Dashboard', path: '/dashboard', roles: ['admin', 'engineer', 'client', 'contractor'] },
      { name: 'Projects', path: '/projects', roles: ['admin', 'engineer', 'client', 'contractor'] },
      { name: 'Tasks', path: '/tasks', roles: ['admin', 'engineer', 'contractor'] },
      { name: 'Resources', path: '/resources', roles: ['admin', 'engineer'] },
      { name: 'Reports', path: '/reports', roles: ['admin', 'engineer', 'client'] },
      { name: 'Admin', path: '/admin', roles: ['admin'] },
    ];

    const guestNavItems = [
      { name: 'Home', path: '/', roles: [] },
      { name: 'Login', path: '/login', roles: [] },
      { name: 'Register', path: '/register', roles: [] },
    ];

    if (!user) return guestNavItems;
    return authNavItems.filter(item => item.roles.includes(user.role || 'client'));
  };

  // On public routes or when loaded, show navigation items
  // On protected routes while loading, show only public items
  const isProtectedRoute = !['/', '/login', '/register'].includes(location.pathname);
  const showAuthItems = !isProtectedRoute || !loading;
  const filteredNavItems = showAuthItems ? getNavigationItems() : [
    { name: 'Home', path: '/', roles: [] },
    { name: 'Login', path: '/login', roles: [] },
    { name: 'Register', path: '/register', roles: [] }
  ];

  const NavLink = ({ item }) => (
    <Link
      to={item.path}
      className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-150 ease-in-out
        ${isCurrentPath(item.path)
          ? 'bg-blue-700 text-white'
          : 'text-gray-700 hover:bg-blue-50 hover:text-blue-700'
        }`}
    >
      {item.name}
    </Link>
  );

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and Desktop Navigation */}
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link to="/" className="flex items-center space-x-2">
                <img
                  className="h-12 w-auto"
                  src="./src/assets/images/logo-white.png"
                  alt="ConSync"
                />
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden sm:ml-6 sm:flex sm:space-x-4 sm:items-center">
              {filteredNavItems.map(item => (
                <NavLink key={item.path} item={item} />
              ))}
            </div>
          </div>

          {/* User Menu and Mobile Button */}
          <div className="flex items-center">
            {showAuthItems && user && (
              <div className="hidden sm:flex items-center space-x-4">
                <NotificationBell />
                <span className="text-sm text-gray-700">
                  {user.name || user.email}
                </span>
                <button
                  onClick={logout}
                  className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-red-50 hover:text-red-700 transition-colors duration-150"
                >
                  Logout
                </button>
              </div>
            )}

            {/* Mobile menu button */}
            <div className="sm:hidden flex items-center">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:bg-gray-100 focus:outline-none"
              >
                <span className="sr-only">Open main menu</span>
                {!isMobileMenuOpen ? (
                  <svg className="block h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                ) : (
                  <svg className="block h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMobileMenuOpen && (
        <div className="sm:hidden bg-white border-t border-gray-200">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {filteredNavItems.map(item => (
              <Link
                key={item.path}
                to={item.path}
                className={`block px-3 py-2 rounded-md text-base font-medium ${
                  isCurrentPath(item.path)
                    ? 'bg-blue-700 text-white'
                    : 'text-gray-700 hover:bg-blue-50 hover:text-blue-700'
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))}
            {showAuthItems && user && (
              <button
                onClick={() => {
                  logout();
                  setIsMobileMenuOpen(false);
                }}
                className="w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-red-50 hover:text-red-700"
              >
                Logout
              </button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default NavigationBar;