"use client";

export default function PageLoader() {
  return (
    <div className="min-h-[50vh] flex items-center justify-center" role="status" aria-label="Loading page">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-3 border-[#8b5cf6] border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-[#737373]">Loading...</p>
      </div>
    </div>
  );
}
