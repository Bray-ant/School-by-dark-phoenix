import { useLocation } from 'react-router-dom';
import { useApp } from '../App';
import Navigation from './Navigation';
import CommandPalette from './CommandPalette';
import ToastContainer from './Toast';
import GlobalCopilot from './GlobalCopilot';
import { useToast } from '../hooks/useToast';
import { Shield } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { commandOpen, setCommandOpen } = useApp();
  const { toasts, removeToast } = useToast();
  const location = useLocation();

  // Full-screen pages that shouldn't show the footer
  const isFullScreenPage = location.pathname === '/visual-lab' || location.pathname === '/dc-lab';

  return (
    <div className="min-h-screen bg-[#060606] text-[#f6f6f6] blueprint-grid flex flex-col">
      <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[100] focus:px-4 focus:py-2 focus:bg-[#3b82f6] focus:text-white focus:rounded-lg focus:text-sm">
        Skip to content
      </a>
      <Navigation />
      <main id="main-content" className={`flex-1 ${isFullScreenPage ? '' : 'pt-16'}`} role="main">
        {children}
      </main>

      {/* Copyright Footer - hidden on full-screen pages */}
      {!isFullScreenPage && (
        <footer className="border-t border-white/5 py-6 px-6 mt-8">
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs text-[#737373]">
              <Shield className="w-3.5 h-3.5 text-[#737373]" />
              <span className="font-medium text-[#a3a3a3]">&copy; Dark Phoenix Inc. All Rights Reserved.</span>
            </div>
            <p className="text-[10px] text-[#525252] text-center md:text-right max-w-md">
              All content, quotes, digital assets, and materials are the exclusive intellectual property
              of Dark Phoenix Inc. Unauthorized reproduction, distribution, modification, publication,
              or commercial use is strictly prohibited without prior written permission.
            </p>
          </div>
        </footer>
      )}

      {commandOpen && (
        <CommandPalette onClose={() => setCommandOpen(false)} />
      )}

      <ToastContainer toasts={toasts} removeToast={removeToast} />

      {/* Global AI Copilot — available on every page */}
      <GlobalCopilot />
    </div>
  );
}
