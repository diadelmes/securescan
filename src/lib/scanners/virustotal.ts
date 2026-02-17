import type { VirusTotalResult } from "@/types/scan";

const VT_BASE = "https://www.virustotal.com/api/v3";
const API_KEY = process.env.VIRUSTOTAL_API_KEY!;

function getHeaders() {
  return { "x-apikey": API_KEY, "Content-Type": "application/json" };
}

// Determine threat level based on malicious count
export function calcThreatLevel(malicious: number, total: number) {
  if (malicious === 0) return "clean";
  const ratio = malicious / total;
  if (malicious <= 2) return "low";
  if (ratio < 0.1) return "medium";
  if (ratio < 0.3) return "high";
  return "critical";
}

export async function scanUrl(url: string): Promise<VirusTotalResult> {
  // Step 1: Submit URL for scanning
  const submitRes = await fetch(`${VT_BASE}/urls`, {
    method: "POST",
    headers: getHeaders(),
    body: new URLSearchParams({ url }),
  });

  if (!submitRes.ok) throw new Error(`VirusTotal submit error: ${submitRes.status}`);
  const submitData = await submitRes.json();
  const analysisId = submitData.data?.id;
  if (!analysisId) throw new Error("No analysis ID returned");

  // Step 2: Poll for results (max 30s)
  for (let i = 0; i < 10; i++) {
    await new Promise((r) => setTimeout(r, 3000));
    const res = await fetch(`${VT_BASE}/analyses/${analysisId}`, { headers: getHeaders() });
    const data = await res.json();

    if (data.data?.attributes?.status === "completed") {
      const stats = data.data.attributes.stats;
      const engines = data.data.attributes.results ?? {};

      return {
        total: Object.keys(engines).length,
        malicious: stats.malicious ?? 0,
        suspicious: stats.suspicious ?? 0,
        undetected: stats.undetected ?? 0,
        harmless: stats.harmless ?? 0,
        permalink: `https://www.virustotal.com/gui/url/${analysisId}`,
        scanDate: new Date().toISOString(),
        engines: Object.fromEntries(
          Object.entries(engines).map(([name, val]: [string, any]) => [
            name,
            { category: val.category, result: val.result },
          ])
        ),
      };
    }
  }

  throw new Error("VirusTotal scan timed out");
}

export async function scanDomain(domain: string): Promise<VirusTotalResult> {
  const res = await fetch(`${VT_BASE}/domains/${encodeURIComponent(domain)}`, {
    headers: getHeaders(),
  });

  if (!res.ok) throw new Error(`VirusTotal domain error: ${res.status}`);
  const data = await res.json();
  const stats = data.data?.attributes?.last_analysis_stats ?? {};
  const engines = data.data?.attributes?.last_analysis_results ?? {};

  return {
    total: Object.keys(engines).length,
    malicious: stats.malicious ?? 0,
    suspicious: stats.suspicious ?? 0,
    undetected: stats.undetected ?? 0,
    harmless: stats.harmless ?? 0,
    permalink: `https://www.virustotal.com/gui/domain/${domain}`,
    scanDate: new Date().toISOString(),
    engines: Object.fromEntries(
      Object.entries(engines).map(([name, val]: [string, any]) => [
        name,
        { category: val.category, result: val.result },
      ])
    ),
  };
}

export async function scanIpVirusTotal(ip: string): Promise<VirusTotalResult> {
  const res = await fetch(`${VT_BASE}/ip_addresses/${encodeURIComponent(ip)}`, {
    headers: getHeaders(),
  });

  if (!res.ok) throw new Error(`VirusTotal IP error: ${res.status}`);
  const data = await res.json();
  const stats = data.data?.attributes?.last_analysis_stats ?? {};
  const engines = data.data?.attributes?.last_analysis_results ?? {};

  return {
    total: Object.keys(engines).length,
    malicious: stats.malicious ?? 0,
    suspicious: stats.suspicious ?? 0,
    undetected: stats.undetected ?? 0,
    harmless: stats.harmless ?? 0,
    permalink: `https://www.virustotal.com/gui/ip-address/${ip}`,
    scanDate: new Date().toISOString(),
    engines: Object.fromEntries(
      Object.entries(engines).map(([name, val]: [string, any]) => [
        name,
        { category: val.category, result: val.result },
      ])
    ),
  };
}
