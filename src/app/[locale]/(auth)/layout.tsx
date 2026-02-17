import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="container relative flex min-h-screen flex-col items-center justify-center">
      <Link
        href="/"
        className="absolute left-4 top-4 flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground md:left-8 md:top-8"
      >
        ← Back to home
      </Link>
      <div className="w-full max-w-[400px]">
        {/* Logo */}
        <div className="mb-8 flex justify-center">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <span className="text-lg font-bold">N</span>
          </div>
        </div>
        {children}
      </div>
    </div>
  );
}
