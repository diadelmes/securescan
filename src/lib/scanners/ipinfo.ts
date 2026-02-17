import type { IPInfoResult } from "@/types/scan";

export async function getIPInfo(ip: string): Promise<IPInfoResult> {
  const token = process.env.IPINFO_TOKEN;
  const url = `https://ipinfo.io/${ip}/json${token ? `?token=${token}` : ""}`;

  const res = await fetch(url);
  if (!res.ok) throw new Error(`IPInfo error: ${res.status}`);

  const data = await res.json();

  // Check privacy flags (requires paid plan)
  let isVpn = false, isProxy = false, isTor = false, isHosting = false;
  if (data.privacy) {
    isVpn = data.privacy.vpn ?? false;
    isProxy = data.privacy.proxy ?? false;
    isTor = data.privacy.tor ?? false;
    isHosting = data.privacy.hosting ?? false;
  }

  // Map country code to emoji flag
  const countryFlag = data.country
    ? data.country
        .toUpperCase()
        .replace(/./g, (c: string) => String.fromCodePoint(127397 + c.charCodeAt(0)))
    : undefined;

  return {
    ip: data.ip,
    hostname: data.hostname,
    city: data.city,
    region: data.region,
    country: data.country,
    countryFlag,
    org: data.org,
    timezone: data.timezone,
    loc: data.loc,
    isVpn,
    isProxy,
    isTor,
    isHosting,
    abuse: data.abuse ? { email: data.abuse.email, phone: data.abuse.phone } : undefined,
  };
}

// Resolve domain to IP
export async function resolveToIP(domain: string): Promise<string> {
  try {
    const res = await fetch(`https://dns.google/resolve?name=${domain}&type=A`);
    const data = await res.json();
    return data.Answer?.[0]?.data ?? domain;
  } catch {
    return domain;
  }
}
