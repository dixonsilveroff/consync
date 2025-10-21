import { Component } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log error to console in development
    console.error('Error caught by boundary:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo,
    });

    // In production, you would send this to an error tracking service
    // e.g., Sentry, LogRocket, etc.
    if (import.meta.env.PROD) {
      // TODO: Send to error tracking service
      // trackError(error, errorInfo);
    }
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
          <div className="max-w-2xl w-full">
            <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-8">
              {/* Error Icon */}
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                  <AlertTriangle className="w-10 h-10 text-red-600" />
                </div>
              </div>

              {/* Error Title */}
              <h1 className="text-3xl font-bold text-gray-900 text-center mb-4">
                Oops! Something went wrong
              </h1>

              {/* Error Message */}
              <p className="text-gray-600 text-center mb-8">
                We apologize for the inconvenience. An unexpected error has occurred.
                {!import.meta.env.PROD && ' Check the console for more details.'}
              </p>

              {/* Error Details (Development Only) */}
              {!import.meta.env.PROD && this.state.error && (
                <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <h3 className="font-semibold text-red-800 mb-2">Error Details:</h3>
                  <pre className="text-sm text-red-700 overflow-x-auto whitespace-pre-wrap">
                    {this.state.error.toString()}
                  </pre>
                  {this.state.errorInfo && (
                    <details className="mt-3">
                      <summary className="cursor-pointer text-sm font-medium text-red-800 hover:text-red-900">
                        Component Stack
                      </summary>
                      <pre className="mt-2 text-xs text-red-600 overflow-x-auto whitespace-pre-wrap">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    </details>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={this.handleReset}
                  className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  <RefreshCw className="w-5 h-5" />
                  Try Again
                </button>
                <button
                  onClick={this.handleGoHome}
                  className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                >
                  <Home className="w-5 h-5" />
                  Go to Home
                </button>
              </div>

              {/* Support Message */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <p className="text-sm text-gray-500 text-center">
                  If this problem persists, please contact support at{' '}
                  <a
                    href="mailto:dixonsilverofficial@gmail.com"
                    className="text-blue-600 hover:text-blue-700 underline"
                  >
                    dixonsilverofficial@gmail.com
                  </a>
                </p>
              </div>
            </div>

            {/* Additional Help */}
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-500">
                <span className="font-medium">Helpful tips:</span> Try refreshing the page,
                clearing your browser cache, or using a different browser.
              </p>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
