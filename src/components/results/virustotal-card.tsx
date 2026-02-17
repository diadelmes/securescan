"use client";

import { Shield, MapPin, Lock, Globe, Server, AlertTriangle, ExternalLink, CheckCircle2, XCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// ================================
// Shared helpers
// ================================
function ResultRow({ label, value, mono = false }: { label: string; value?: string | number | null; mono?: boolean }) {
  if (!value && value !== 0) return null;
  return (
    <div className="flex items-start justify-between gap-4 py-1.5 border-b last:border-0 text-sm">
      <span className="text-muted-foreground shrink-0">{label}</span>
      <span className={`text-right ${mono ? "font-mono text-xs" : ""}`}>{value}</span>
    </div>
  );
}

function CardError({ error }: { error: string }) {
  return (
    <div className="flex items-center gap-2 rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
      <AlertTriangle className="h-4 w-4 shrink-0" />
      {error}
    </div>
  );
}

// ================================
// VirusTotal Card
// ================================
export function VirusTotalCard({ data, error }: { data: any; error?: string | null }) {
  const total = Object.keys(data.engines ?? {}).length;
  const maliciousEngines = Object.entries(data.engines ?? {})
    .filter(([, v]: any) => v.category === "malicious")
    .slice(0, 8);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Shield className="h-4 w-4 text-red-500" />
          VirusTotal
          <a href={data.permalink} target="_blank" rel="noopener noreferrer" className="ml-auto">
            <ExternalLink className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground" />
          </a>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {error && <CardError error={error} />}
        <div className="grid grid-cols-4 gap-2">
          {[
            { label: "Zararlı", value: data.malicious, color: "text-red-600 bg-red-50 dark:bg-red-900/20" },
            { label: "Şüpheli", value: data.suspicious, color: "text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20" },
            { label: "Temiz", value: data.harmless, color: "text-green-600 bg-green-50 dark:bg-green-900/20" },
            { label: "Toplam", value: total, color: "text-blue-600 bg-blue-50 dark:bg-blue-900/20" },
          ].map((s) => (
            <div key={s.label} className={`rounded-lg p-2 text-center ${s.color}`}>
              <p className="text-xl font-bold">{s.value}</p>
              <p className="text-xs">{s.label}</p>
            </div>
          ))}
        </div>
        {maliciousEngines.length > 0 && (
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-1.5">Zararlı İşaretleyen Motorlar</p>
            <div className="flex flex-wrap gap-1.5">
              {maliciousEngines.map(([name]) => (
                <span key={name} className="rounded-md bg-red-100 px-2 py-0.5 text-xs text-red-700 dark:bg-red-900/30 dark:text-red-300">
                  {name}
                </span>
              ))}
              {Object.keys(data.engines ?? {}).filter((_, __, arr) => arr.length > 8).length > 0 && (
                <span className="text-xs text-muted-foreground">...</span>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ================================
// IP Info Card
// ================================
export function IPInfoCard({ data, error }: { data: any; error?: string | null }) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <MapPin className="h-4 w-4 text-blue-500" />
          IP Analizi
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {error && <CardError error={error} />}
        <ResultRow label="IP Adresi" value={data.ip} mono />
        <ResultRow label="Konum" value={[data.countryFlag, data.city, data.region, data.country].filter(Boolean).join(" ")} />
        <ResultRow label="ISP/Org" value={data.org} />
        <ResultRow label="Zaman Dilimi" value={data.timezone} />
        <ResultRow label="Koordinat" value={data.loc} mono />
        {(data.isVpn || data.isProxy || data.isTor || data.isHosting) && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {data.isTor && <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs text-red-700 dark:bg-red-900/30 dark:text-red-300">🧅 TOR</span>}
            {data.isProxy && <span className="rounded-full bg-orange-100 px-2 py-0.5 text-xs text-orange-700 dark:bg-orange-900/30 dark:text-orange-300">🔒 Proxy</span>}
            {data.isVpn && <span className="rounded-full bg-yellow-100 px-2 py-0.5 text-xs text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300">🛡️ VPN</span>}
            {data.isHosting && <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">🖥️ Hosting</span>}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ================================
// SSL Card
// ================================
export function SSLCard({ data, error }: { data: any; error?: string | null }) {
  const isExpiringSoon = data.daysRemaining < 30;
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Lock className="h-4 w-4 text-green-500" />
          SSL Sertifikası
          <div className="ml-auto">
            {data.valid
              ? <CheckCircle2 className="h-4 w-4 text-green-500" />
              : <XCircle className="h-4 w-4 text-red-500" />}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {error && <CardError error={error} />}
        <div className={`rounded-lg px-3 py-2 text-sm font-medium ${
          data.valid && !isExpiringSoon
            ? "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400"
            : isExpiringSoon
            ? "bg-yellow-50 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400"
            : "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400"
        }`}>
          {data.valid
            ? isExpiringSoon
              ? `⚠️ ${data.daysRemaining} gün içinde süresi doluyor`
              : `✅ Geçerli — ${data.daysRemaining} gün kaldı`
            : "❌ Geçersiz sertifika"}
        </div>
        <ResultRow label="Verilen" value={data.issuer} />
        <ResultRow label="Konu" value={data.subject} />
        <ResultRow label="Geçerlilik" value={`${new Date(data.validFrom).toLocaleDateString("tr-TR")} — ${new Date(data.validTo).toLocaleDateString("tr-TR")}`} />
        <ResultRow label="Protokol" value={data.protocol} mono />
        {data.selfSigned && (
          <span className="inline-block rounded-full bg-orange-100 px-2 py-0.5 text-xs text-orange-700">Self-signed</span>
        )}
      </CardContent>
    </Card>
  );
}

// ================================
// WHOIS Card
// ================================
export function WHOISCard({ data, error }: { data: any; error?: string | null }) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Globe className="h-4 w-4 text-purple-500" />
          WHOIS
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {error && <CardError error={error} />}
        <ResultRow label="Domain" value={data.domainName} mono />
        <ResultRow label="Registrar" value={data.registrar} />
        <ResultRow label="Sahibi" value={data.registrantName ?? data.registrantOrg} />
        <ResultRow label="Ülke" value={data.registrantCountry} />
        <ResultRow label="Oluşturma" value={data.createdDate} />
        <ResultRow label="Son Güncelleme" value={data.updatedDate} />
        <ResultRow label="Bitiş" value={data.expiresDate} />
        <ResultRow label="DNSSEC" value={data.dnssec} />
        {data.nameServers && data.nameServers.length > 0 && (
          <div>
            <p className="text-xs text-muted-foreground mb-1">Name Servers</p>
            {data.nameServers.slice(0, 4).map((ns: string) => (
              <p key={ns} className="font-mono text-xs text-muted-foreground">{ns}</p>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ================================
// Shodan Card
// ================================
export function ShodanCard({ data, error }: { data: any; error?: string | null }) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Server className="h-4 w-4 text-orange-500" />
          Shodan
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {error && <CardError error={error} />}
        <ResultRow label="IP" value={data.ip} mono />
        <ResultRow label="Org" value={data.org} />
        <ResultRow label="ISP" value={data.isp} />
        <ResultRow label="Konum" value={[data.city, data.country].filter(Boolean).join(", ")} />

        {data.ports?.length > 0 && (
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-1.5">Açık Portlar ({data.ports.length})</p>
            <div className="flex flex-wrap gap-1">
              {data.ports.map((port: number) => (
                <span key={port} className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">{port}</span>
              ))}
            </div>
          </div>
        )}

        {data.vulns?.length > 0 && (
          <div>
            <p className="text-xs font-medium text-red-600 mb-1.5">⚠️ CVE Güvenlik Açıkları ({data.vulns.length})</p>
            <div className="flex flex-wrap gap-1">
              {data.vulns.slice(0, 6).map((cve: string) => (
                <a
                  key={cve}
                  href={`https://nvd.nist.gov/vuln/detail/${cve}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded bg-red-100 px-1.5 py-0.5 font-mono text-xs text-red-700 hover:underline dark:bg-red-900/30 dark:text-red-300"
                >
                  {cve}
                </a>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
