import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Shield, Search, Globe, Wifi, Lock, CheckCircle2, AlertTriangle } from "lucide-react";

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col">
      <section className="flex flex-1 flex-col items-center justify-center px-4 py-24 text-center">
        <div className="mx-auto max-w-3xl animate-fade-in">
          <div className="mb-6 inline-flex items-center rounded-full border bg-red-50 dark:bg-red-950/30 px-4 py-1.5 text-sm font-medium text-red-700 dark:text-red-400">
            <Shield className="mr-2 h-3.5 w-3.5" />Güvenlik Analiz Platformu
          </div>
          <h1 className="mb-6 text-5xl font-bold tracking-tight sm:text-6xl">
            URL, IP ve{" "}
            <span className="bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">domain güvenliğini</span>{" "}
            analiz et
          </h1>
          <p className="mb-10 text-lg text-muted-foreground max-w-2xl mx-auto">
            VirusTotal, Shodan, SSL kontrolü, WHOIS — hepsi tek platformda.
          </p>
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Button size="lg" asChild className="rounded-full px-8 bg-red-600 hover:bg-red-700">
              <Link href="/scan"><Shield className="mr-2 h-4 w-4" />Taramaya Başla</Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="rounded-full px-8">
              <Link href="/register">Ücretsiz Hesap Aç</Link>
            </Button>
          </div>
        </div>
      </section>
      <section className="border-t bg-muted/40 px-4 py-24">
        <div className="mx-auto max-w-5xl">
          <h2 className="mb-12 text-center text-3xl font-bold">5 farklı güvenlik kaynağı</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { icon: Shield, color: "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400", title: "VirusTotal", desc: "70+ antivirüs motoruyla zararlı yazılım taraması" },
              { icon: Wifi, color: "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400", title: "IP Analizi", desc: "Konum, ISP, VPN/Proxy/TOR tespiti" },
              { icon: Lock, color: "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400", title: "SSL Kontrolü", desc: "Sertifika geçerliliği ve süre kontrolü" },
              { icon: Globe, color: "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400", title: "WHOIS", desc: "Domain kayıt ve sahiplik bilgileri" },
              { icon: Search, color: "bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400", title: "Shodan", desc: "Açık portlar ve CVE güvenlik açıkları" },
              { icon: AlertTriangle, color: "bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400", title: "Tehdit Skoru", desc: "Tüm sonuçları birleştiren risk değerlendirmesi" },
            ].map((f) => (
              <div key={f.title} className="rounded-xl border bg-card p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className={`mb-4 flex h-11 w-11 items-center justify-center rounded-xl ${f.color}`}>
                  <f.icon className="h-5 w-5" />
                </div>
                <h3 className="mb-2 font-semibold">{f.title}</h3>
                <p className="text-sm text-muted-foreground">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="border-t px-4 py-24 text-center">
        <div className="mx-auto max-w-xl">
          <h2 className="mb-4 text-3xl font-bold">Güvenliği hemen kontrol et</h2>
          <Button size="lg" asChild className="rounded-full px-10 bg-red-600 hover:bg-red-700">
            <Link href="/scan">Ücretsiz Tara <ArrowRight className="ml-2 h-4 w-4" /></Link>
          </Button>
        </div>
      </section>
    </main>
  );
}
