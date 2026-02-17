import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { scanUrl, scanDomain, scanIpVirusTotal, calcThreatLevel } from "@/lib/scanners/virustotal";
import { getIPInfo, resolveToIP } from "@/lib/scanners/ipinfo";
import { checkSSL } from "@/lib/scanners/ssl";
import { getWHOIS } from "@/lib/scanners/whois";
import { scanShodan } from "@/lib/scanners/shodan";
import type { ScanRequest, ThreatLevel } from "@/types/scan";

function detectScanType(target: string): "url" | "ip" | "domain" {
  // IP address pattern
  if (/^(\d{1,3}\.){3}\d{1,3}$/.test(target)) return "ip";
  // URL pattern
  if (/^https?:\/\//.test(target)) return "url";
  // Default: domain
  return "domain";
}

function extractDomain(target: string): string {
  try {
    const url = target.startsWith("http") ? target : `https://${target}`;
    return new URL(url).hostname;
  } catch {
    return target;
  }
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    const body: ScanRequest = await request.json();
    const { target, options } = body;

    if (!target) {
      return NextResponse.json({ error: "Hedef gerekli" }, { status: 400 });
    }

    const scanType = detectScanType(target);
    const domain = extractDomain(target);

    // Resolve IP if needed
    let resolvedIP = scanType === "ip" ? target : null;
    if (scanType !== "ip" && (options.ipinfo || options.shodan)) {
      resolvedIP = await resolveToIP(domain).catch(() => null);
    }

    // Run all scans in parallel
    const results = await Promise.allSettled([
      // VirusTotal
      options.virustotal
        ? scanType === "url"
          ? scanUrl(target)
          : scanType === "ip"
          ? scanIpVirusTotal(target)
          : scanDomain(domain)
        : Promise.resolve(null),

      // IP Info
      options.ipinfo && resolvedIP
        ? getIPInfo(resolvedIP)
        : Promise.resolve(null),

      // SSL (only for URLs and domains)
      options.ssl && scanType !== "ip"
        ? checkSSL(domain)
        : Promise.resolve(null),

      // WHOIS (only for domains/URLs)
      options.whois && scanType !== "ip"
        ? getWHOIS(domain)
        : Promise.resolve(null),

      // Shodan
      options.shodan && resolvedIP
        ? scanShodan(resolvedIP)
        : Promise.resolve(null),
    ]);

    const [vtRes, ipRes, sslRes, whoisRes, shodanRes] = results;

    const vtResult = vtRes.status === "fulfilled" ? vtRes.value : null;
    const ipResult = ipRes.status === "fulfilled" ? ipRes.value : null;
    const sslResult = sslRes.status === "fulfilled" ? sslRes.value : null;
    const whoisResult = whoisRes.status === "fulfilled" ? whoisRes.value : null;
    const shodanResult = shodanRes.status === "fulfilled" ? shodanRes.value : null;

    // Calculate threat level
    let threatLevel: ThreatLevel = "clean";
    if (vtResult) {
      const vt = vtResult as any;
      threatLevel = calcThreatLevel(vt.malicious, vt.total) as ThreatLevel;
    }

    // Extra threat signals
    if (ipResult) {
      const ip = ipResult as any;
      if (ip.isTor || ip.isProxy) {
        if (threatLevel === "clean") threatLevel = "medium";
      }
    }

    if (shodanResult) {
      const sh = shodanResult as any;
      if (sh.vulns && sh.vulns.length > 0) {
        if (threatLevel === "clean" || threatLevel === "low") threatLevel = "high";
      }
    }

    // Build summary
    const warnings: string[] = [];
    if (vtResult && (vtResult as any).malicious > 0)
      warnings.push(`${(vtResult as any).malicious} antivirüs motoru zararlı işaretledi`);
    if (ipResult && (ipResult as any).isTor) warnings.push("TOR çıkış noktası tespit edildi");
    if (ipResult && (ipResult as any).isProxy) warnings.push("Proxy/VPN kullanımı tespit edildi");
    if (sslResult && !(sslResult as any).valid) warnings.push("SSL sertifikası geçersiz veya süresi dolmuş");
    if (shodanResult && (shodanResult as any).vulns?.length > 0)
      warnings.push(`${(shodanResult as any).vulns.length} CVE güvenlik açığı bulundu`);

    const summary =
      warnings.length === 0
        ? "Tarama tamamlandı. Herhangi bir tehdit tespit edilmedi."
        : `Dikkat: ${warnings.join("; ")}.`;

    const duration = Date.now() - startTime;

    // Save to Supabase if user is logged in
    const session = await getServerSession(authOptions);
    let scanId: string | null = null;

    if (session?.user?.email) {
      try {
        const cookieStore = cookies();
        const supabase = createServerClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
          { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
        );

        const { data: profile } = await supabase
          .from("profiles")
          .select("id")
          .eq("email", session.user.email)
          .single();

        if (profile) {
          const { data: scan } = await supabase
            .from("scans")
            .insert({
              user_id: profile.id,
              target,
              scan_type: scanType,
              status: "completed",
              threat_level: threatLevel,
              virustotal_result: vtResult,
              ip_info_result: ipResult,
              ssl_result: sslResult,
              whois_result: whoisResult,
              shodan_result: shodanResult,
              summary,
              malicious_count: (vtResult as any)?.malicious ?? 0,
              suspicious_count: (vtResult as any)?.suspicious ?? 0,
              clean_count: (vtResult as any)?.harmless ?? 0,
              duration_ms: duration,
              completed_at: new Date().toISOString(),
            })
            .select("id")
            .single();

          scanId = scan?.id ?? null;
        }
      } catch (dbErr) {
        console.error("DB save error:", dbErr);
      }
    }

    return NextResponse.json({
      scanId,
      target,
      scanType,
      threatLevel,
      summary,
      duration,
      results: {
        virustotal: vtResult,
        ipinfo: ipResult,
        ssl: sslResult,
        whois: whoisResult,
        shodan: shodanResult,
      },
      errors: {
        virustotal: vtRes.status === "rejected" ? (vtRes as any).reason?.message : null,
        ipinfo: ipRes.status === "rejected" ? (ipRes as any).reason?.message : null,
        ssl: sslRes.status === "rejected" ? (sslRes as any).reason?.message : null,
        whois: whoisRes.status === "rejected" ? (whoisRes as any).reason?.message : null,
        shodan: shodanRes.status === "rejected" ? (shodanRes as any).reason?.message : null,
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message ?? "Tarama başarısız oldu" },
      { status: 500 }
    );
  }
}
