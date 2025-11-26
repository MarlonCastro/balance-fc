import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useDarkMode } from '../hooks/useDarkMode';

interface NavigationProps {
  currentStep?: number;
  totalSteps?: number;
}

export function Navigation({ currentStep, totalSteps }: NavigationProps) {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isDark, toggle } = useDarkMode();

  const getBreadcrumbs = () => {
    const path = location.pathname;
    const crumbs = [];

    // Only show breadcrumbs for non-home pages
    if (path === '/setup') {
      crumbs.push({ label: 'Home', path: '/' });
      crumbs.push({ label: 'Nova Pelada', path: '/setup' });
    } else if (path.startsWith('/draw/')) {
      if (path.includes('/result')) {
        crumbs.push({ label: 'Home', path: '/' });
        crumbs.push({ label: 'Sorteio', path: path.replace('/result', '') });
        crumbs.push({ label: 'Resultado', path: path });
      } else {
        crumbs.push({ label: 'Home', path: '/' });
        crumbs.push({ label: 'Sorteio de Times', path: path });
      }
    }

    return crumbs;
  };

  const breadcrumbs = getBreadcrumbs();
  const progress = currentStep && totalSteps ? (currentStep / totalSteps) * 100 : 0;

  return (
    <nav className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        {/* Main Navigation */}
        <div className="flex justify-between h-12 sm:h-16">
          <div className="flex items-center flex-1 min-w-0">
            {/* Logo */}
            <Link to="/" className="flex-shrink-0 flex items-center">
              <h1 className="text-lg sm:text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                Balance FC
              </h1>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:ml-6 md:flex md:space-x-1">
              <Link
                to="/"
                className={`inline-flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  location.pathname === '/'
                    ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-400'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                Home
              </Link>
              <Link
                to="/setup"
                className={`inline-flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  location.pathname === '/setup'
                    ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-400'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                Nova Pelada
              </Link>
            </div>

            {/* Mobile Breadcrumb - Simplified */}
            {breadcrumbs.length > 0 && (
              <div className="md:hidden ml-3 flex-1 min-w-0">
                <nav className="flex" aria-label="Breadcrumb">
                  <ol className="flex items-center space-x-1 text-xs">
                    {breadcrumbs.length > 1 && (
                      <li className="text-gray-500 dark:text-gray-400 truncate">
                        {breadcrumbs[breadcrumbs.length - 1].label}
                      </li>
                    )}
                  </ol>
                </nav>
              </div>
            )}
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            {/* Dark Mode Toggle */}
            <button
              onClick={(e) => {
                e.preventDefault();
                toggle();
              }}
              className="p-1.5 sm:p-2 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              aria-label="Alternar tema"
            >
              {isDark ? (
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                  />
                </svg>
              ) : (
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                  />
                </svg>
              )}
            </button>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-1.5 sm:p-2 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              ) : (
                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Desktop Breadcrumbs - Hidden on mobile */}
        {breadcrumbs.length > 0 && (
          <div className="hidden md:block py-2">
            <nav className="flex" aria-label="Breadcrumb">
              <ol className="flex items-center space-x-2">
                {breadcrumbs.map((crumb, index) => (
                  <li key={crumb.path} className="flex items-center">
                    {index > 0 && (
                      <svg
                        className="flex-shrink-0 h-5 w-5 text-gray-400 dark:text-gray-500"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                        aria-hidden="true"
                      >
                        <path d="M5.555 17.776l8-16 .894.448-8 16-.894-.448z" />
                      </svg>
                    )}
                    <Link
                      to={crumb.path}
                      className={`ml-2 text-sm font-medium ${
                        index === breadcrumbs.length - 1
                          ? 'text-gray-700 dark:text-gray-300'
                          : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                      }`}
                    >
                      {crumb.label}
                    </Link>
                  </li>
                ))}
              </ol>
            </nav>
          </div>
        )}

        {/* Progress Indicator */}
        {currentStep && totalSteps && (
          <div className="pb-2 sm:pb-3">
            <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400 mb-1">
              <span>Progresso</span>
              <span>
                {currentStep} / {totalSteps}
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className="bg-indigo-600 dark:bg-indigo-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden" id="mobile-menu">
          <div className="pt-2 pb-3 space-y-1">
            <Link
              to="/"
              className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
                location.pathname === '/'
                  ? 'border-indigo-500 text-indigo-700 bg-indigo-50 dark:bg-indigo-900/20 dark:text-indigo-400'
                  : 'border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-200'
              }`}
              onClick={() => setMobileMenuOpen(false)}
            >
              Home
            </Link>
            <Link
              to="/setup"
              className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
                location.pathname === '/setup'
                  ? 'border-indigo-500 text-indigo-700 bg-indigo-50 dark:bg-indigo-900/20 dark:text-indigo-400'
                  : 'border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-200'
              }`}
              onClick={() => setMobileMenuOpen(false)}
            >
              Nova Pelada
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}

