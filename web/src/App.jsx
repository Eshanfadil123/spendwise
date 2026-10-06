import React, { useState } from 'react';
import { useAuth } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import DashboardPage from './pages/DashboardPage';

function App() {
  const { user, loading } = useAuth();
  const [authView, setAuthView] = useState('login'); // 'login' | 'signup'

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="flex flex-col items-center space-y-3">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">Loading SpendWise...</p>
        </div>
      </div>
    );
  }

  if (user) {
    return <DashboardPage />;
  }

  if (authView === 'signup') {
    return <SignupPage onSwitchToLogin={() => setAuthView('login')} />;
  }

  return <LoginPage onSwitchToSignup={() => setAuthView('signup')} />;
}

export default App;
