export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-center gap-3 mb-8">
          <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
            <rect width="36" height="36" rx="8" fill="#3b82f6" />
            <path d="M8 26 L8 14 L14 10 L14 22 Z" fill="white" opacity="0.9" />
            <path d="M15 26 L15 12 L21 8 L21 22 Z" fill="white" />
            <path d="M22 26 L22 16 L28 12 L28 26 Z" fill="white" opacity="0.9" />
            <circle cx="28" cy="10" r="3" fill="#60a5fa" />
          </svg>
          <span className="text-white text-2xl font-bold tracking-tight">
            Velerity Sales OS
          </span>
        </div>
        {children}
      </div>
    </div>
  );
}
