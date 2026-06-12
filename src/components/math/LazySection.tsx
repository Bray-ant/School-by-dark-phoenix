interface LazySectionProps { children: React.ReactNode; }

export default function LazySection({ children }: LazySectionProps) {
  return <div>{children}</div>;
}
