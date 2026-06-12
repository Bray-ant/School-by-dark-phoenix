import { useState, useEffect, useRef } from 'react';

interface LazySectionProps {
  children: React.ReactNode;
}

export default function LazySection({ children }: LazySectionProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShouldRender(true);
          obs.disconnect();
        }
      },
      { rootMargin: '200px' }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div ref={ref}>
      {shouldRender ? children : <div className="h-64 flex items-center justify-center"><div className="w-6 h-6 border-2 border-[#00d4ff]/20 border-t-[#00d4ff] rounded-full animate-spin" /></div>}
    </div>
  );
}
