import type { WHOISResult } from "@/types/scan";

// Uses whois.domaintools.com public API or raw WHOIS parsing
export async function getWHOIS(domain: string): Promise<WHOISResult> {
  const cleanDomain = domain.replace(/^https?:\/\//, "").split("/")[0];

  try {
    // Use RDAP first (modern, JSON-based WHOIS replacement)
    const rdapRes = await fetch(`https://rdap.org/domain/${cleanDomain}`);
    if (rdapRes.ok) {
      const data = await rdapRes.json();
      return parseRDAP(data, cleanDomain);
    }
  } catch {}

  // Fallback: use whois.arin.net for IP ranges or return minimal data
  return {
    domainName: cleanDomain,
    registrar: "Bilgi alınamadı",
    status: ["Bilinmiyor"],
  };
}

function parseRDAP(data: any, domain: string): WHOISResult {
  const result: WHOISResult = { domainName: domain };

  // Events (dates)
  if (data.events) {
    for (const event of data.events) {
      const date = event.eventDate ? new Date(event.eventDate).toLocaleDateString("tr-TR") : undefined;
      if (event.eventAction === "registration") result.createdDate = date;
      if (event.eventAction === "expiration") result.expiresDate = date;
      if (event.eventAction === "last changed") result.updatedDate = date;
    }
  }

  // Nameservers
  if (data.nameservers) {
    result.nameServers = data.nameservers.map((ns: any) => ns.ldhName).filter(Boolean);
  }

  // Status
  if (data.status) {
    result.status = Array.isArray(data.status) ? data.status : [data.status];
  }

  // Entities (registrar, registrant)
  if (data.entities) {
    for (const entity of data.entities) {
      if (entity.roles?.includes("registrar")) {
        result.registrar = entity.vcardArray?.[1]?.find((v: any) => v[0] === "fn")?.[3] ?? entity.handle;
      }
      if (entity.roles?.includes("registrant")) {
        const vcard = entity.vcardArray?.[1] ?? [];
        result.registrantName = vcard.find((v: any) => v[0] === "fn")?.[3];
        result.registrantOrg = vcard.find((v: any) => v[0] === "org")?.[3];
        const adr = vcard.find((v: any) => v[0] === "adr");
        if (adr) result.registrantCountry = adr[1]?.["label"]?.split("\n").pop();
      }
    }
  }

  // DNSSEC
  result.dnssec = data.secureDNS?.delegationSigned ? "Signed" : "Unsigned";

  return result;
}
