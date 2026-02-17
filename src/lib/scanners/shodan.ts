import type { ShodanResult } from "@/types/scan";

const SHODAN_BASE = "https://api.shodan.io";

export async function scanShodan(ip: string): Promise<ShodanResult> {
  const apiKey = process.env.SHODAN_API_KEY;
  if (!apiKey) throw new Error("Shodan API key not configured");

  const res = await fetch(`${SHODAN_BASE}/shodan/host/${ip}?key=${apiKey}`);

  if (res.status === 404) {
    return {
      ip,
      hostnames: [],
      country: "Bilinmiyor",
      ports: [],
      services: [],
      vulns: [],
    };
  }

  if (!res.ok) throw new Error(`Shodan error: ${res.status}`);

  const data = await res.json();

  const services = (data.data ?? []).map((svc: any) => ({
    port: svc.port,
    protocol: svc.transport ?? "tcp",
    banner: svc.data ? svc.data.slice(0, 200) : undefined,
    product: svc.product,
    version: svc.version,
    cpe: svc.cpe ?? [],
  }));

  return {
    ip: data.ip_str ?? ip,
    hostnames: data.hostnames ?? [],
    country: data.country_name ?? "Bilinmiyor",
    city: data.city,
    org: data.org,
    isp: data.isp,
    ports: data.ports ?? [],
    vulns: data.vulns ? Object.keys(data.vulns) : [],
    services,
    lastUpdate: data.last_update,
  };
}

// Resolve domain hostname to IP via Shodan
export async function shodanResolve(hostnames: string[]): Promise<Record<string, string>> {
  const apiKey = process.env.SHODAN_API_KEY;
  if (!apiKey) return {};

  const query = hostnames.join(",");
  const res = await fetch(`${SHODAN_BASE}/dns/resolve?hostnames=${query}&key=${apiKey}`);
  if (!res.ok) return {};
  return res.json();
}
