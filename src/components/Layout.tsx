import { createContext, useContext } from 'react';
import type { ReactNode } from 'react';
import { Navigation } from './Navigation';
import { ToastContainer } from './ui/Toast';
import { useToast } from '../hooks/useToast';

interface LayoutProps {
  children: ReactNode;
  currentStep?: number;
  totalSteps?: number;
}

const ToastContext = createContext<ReturnType<typeof useToast> | null>(null);

export function useToastContext() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToastContext must be used within Layout');
  }
  return context;
}

export function Layout({ children, currentStep, totalSteps }: LayoutProps) {
  const toast = useToast();

  return (
    <ToastContext.Provider value={toast}>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 transition-colors">
        <Navigation currentStep={currentStep} totalSteps={totalSteps} />
        
        <main className="max-w-7xl mx-auto py-4 sm:py-6 px-4 sm:px-6 lg:px-8">
          <div className="space-y-6">
            {children}
          </div>
        </main>

        <ToastContainer toasts={toast.toasts} onRemove={toast.removeToast} />
      </div>
    </ToastContext.Provider>
  );
}
