export type ScanType = "url" | "ip" | "domain";
export type ScanStatus = "pending" | "running" | "completed" | "failed";
export type ThreatLevel = "clean" | "low" | "medium" | "high" | "critical";

// VirusTotal result
export interface VirusTotalResult {
  total: number;
  malicious: number;
  suspicious: number;
  undetected: number;
  harmless: number;
  permalink: string;
  scanDate: string;
  engines: Record<string, { category: string; result: string | null }>;
}

// IP Info result
export interface IPInfoResult {
  ip: string;
  hostname?: string;
  city?: string;
  region?: string;
  country?: string;
  countryFlag?: string;
  org?: string;
  timezone?: string;
  loc?: string; // "lat,lng"
  isVpn?: boolean;
  isProxy?: boolean;
  isTor?: boolean;
  isHosting?: boolean;
  abuse?: { email: string; phone: string };
}

// SSL result
export interface SSLResult {
  valid: boolean;
  host: string;
  validFrom: string;
  validTo: string;
  daysRemaining: number;
  issuer: string;
  subject: string;
  protocol: string;
  selfSigned: boolean;
}

// WHOIS result
export interface WHOISResult {
  domainName: string;
  registrar?: string;
  registrantName?: string;
  registrantOrg?: string;
  registrantCountry?: string;
  createdDate?: string;
  updatedDate?: string;
  expiresDate?: string;
  nameServers?: string[];
  status?: string[];
  dnssec?: string;
}

// Shodan result
export interface ShodanResult {
  ip: string;
  hostnames: string[];
  country: string;
  city?: string;
  org?: string;
  isp?: string;
  ports: number[];
  vulns?: string[];
  services: {
    port: number;
    protocol: string;
    banner?: string;
    product?: string;
    version?: string;
    cpe?: string[];
  }[];
  lastUpdate?: string;
}

// Full scan record
export interface Scan {
  id: string;
  user_id: string | null;
  target: string;
  scan_type: ScanType;
  status: ScanStatus;
  threat_level: ThreatLevel | null;
  virustotal_result: VirusTotalResult | null;
  ip_info_result: IPInfoResult | null;
  ssl_result: SSLResult | null;
  whois_result: WHOISResult | null;
  shodan_result: ShodanResult | null;
  summary: string | null;
  malicious_count: number;
  suspicious_count: number;
  clean_count: number;
  duration_ms: number | null;
  created_at: string;
  completed_at: string | null;
}

export interface ScanRequest {
  target: string;
  scanType: ScanType;
  options: {
    virustotal: boolean;
    ipinfo: boolean;
    ssl: boolean;
    whois: boolean;
    shodan: boolean;
  };
}

export const THREAT_LEVEL_CONFIG: Record<ThreatLevel, { label: string; color: string; bg: string; icon: string }> = {
  clean:    { label: "Temiz",    color: "text-green-600",  bg: "bg-green-100 dark:bg-green-900/30",  icon: "✅" },
  low:      { label: "Düşük",   color: "text-yellow-600", bg: "bg-yellow-100 dark:bg-yellow-900/30", icon: "⚠️" },
  medium:   { label: "Orta",    color: "text-orange-600", bg: "bg-orange-100 dark:bg-orange-900/30", icon: "🔶" },
  high:     { label: "Yüksek",  color: "text-red-600",    bg: "bg-red-100 dark:bg-red-900/30",      icon: "🚨" },
  critical: { label: "Kritik",  color: "text-red-700",    bg: "bg-red-200 dark:bg-red-900/50",      icon: "☠️" },
};
