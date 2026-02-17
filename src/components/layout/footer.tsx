import Link from "next/link";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t py-8">
      <div className="container flex flex-col items-center justify-between gap-4 sm:flex-row">
        <p className="text-sm text-muted-foreground">
          © {currentYear} {process.env.NEXT_PUBLIC_APP_NAME ?? "MyApp"}. Tüm hakları saklıdır.
        </p>
        <nav className="flex items-center gap-6 text-sm text-muted-foreground">
          <Link href="/privacy" className="hover:text-foreground">Gizlilik</Link>
          <Link href="/terms" className="hover:text-foreground">Kullanım Şartları</Link>
          <Link href="https://github.com" target="_blank" rel="noopener noreferrer" className="hover:text-foreground">
            GitHub
          </Link>
        </nav>
      </div>
    </footer>
  );
}
