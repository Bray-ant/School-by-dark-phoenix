"use client";
import Link from 'next/link';
import { Home, BookOpen, Gamepad2, FlaskConical, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-6" role="main" aria-labelledby="not-found-title">
      <div className="max-w-md text-center space-y-6">
        <div className="space-y-2">
          <h1 id="not-found-title" className="text-6xl font-bold bg-gradient-to-r from-[#3b82f6] to-[#8b5cf6] bg-clip-text text-transparent">
            404
          </h1>
          <p className="text-lg font-medium">Page not found</p>
          <p className="text-sm text-[#737373]">
            The page you're looking for doesn't exist or has been moved.
          </p>
        </div>

        <div className="space-y-2">
          <p className="text-xs text-[#737373] uppercase tracking-wider font-medium">Try one of these instead</p>
          <div className="grid grid-cols-2 gap-2">
            <Link
              href="/"
              className="flex items-center gap-2 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-sm hover:bg-white/10 transition-colors"
            >
              <Home className="w-4 h-4 text-[#3b82f6]" />
              <span>Home</span>
            </Link>
            <Link
              href="/dc-circuit/dc-fundamentals"
              className="flex items-center gap-2 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-sm hover:bg-white/10 transition-colors"
            >
              <BookOpen className="w-4 h-4 text-[#10b981]" />
              <span>DC Circuits</span>
            </Link>
            <Link
              href="/games"
              className="flex items-center gap-2 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-sm hover:bg-white/10 transition-colors"
            >
              <Gamepad2 className="w-4 h-4 text-[#ec4899]" />
              <span>Games</span>
            </Link>
            <Link
              href="/dc-lab"
              className="flex items-center gap-2 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-sm hover:bg-white/10 transition-colors"
            >
              <FlaskConical className="w-4 h-4 text-[#f59e0b]" />
              <span>Lab</span>
            </Link>
          </div>
        </div>

        <button
          onClick={() => window.history.back()}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm text-[#737373] hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Go back
        </button>
      </div>
    </div>
  );
}
