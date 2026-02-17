import type { SSLResult } from "@/types/scan";
import * as tls from "tls";

export async function checkSSL(hostname: string): Promise<SSLResult> {
  return new Promise((resolve, reject) => {
    const cleanHost = hostname.replace(/^https?:\/\//, "").split("/")[0];

    const socket = tls.connect(
      { host: cleanHost, port: 443, servername: cleanHost, rejectUnauthorized: false },
      () => {
        try {
          const cert = socket.getPeerCertificate(true);
          const protocol = socket.getProtocol() ?? "unknown";

          if (!cert || !cert.subject) {
            socket.destroy();
            reject(new Error("No certificate found"));
            return;
          }

          const validFrom = new Date(cert.valid_from);
          const validTo = new Date(cert.valid_to);
          const now = new Date();
          const daysRemaining = Math.floor((validTo.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
          const isValid = now >= validFrom && now <= validTo;

          // Check if self-signed (issuer === subject)
          const selfSigned =
            cert.issuer?.CN === cert.subject?.CN &&
            cert.issuer?.O === cert.subject?.O;

          socket.destroy();
          resolve({
            valid: isValid && !selfSigned,
            host: cleanHost,
            validFrom: validFrom.toISOString(),
            validTo: validTo.toISOString(),
            daysRemaining,
            issuer: cert.issuer
              ? `${cert.issuer.O ?? ""} (${cert.issuer.CN ?? ""})`
              : "Unknown",
            subject: cert.subject?.CN ?? cleanHost,
            protocol,
            selfSigned,
          });
        } catch (err) {
          socket.destroy();
          reject(err);
        }
      }
    );

    socket.on("error", (err) => {
      reject(new Error(`SSL connection failed: ${err.message}`));
    });

    socket.setTimeout(10000, () => {
      socket.destroy();
      reject(new Error("SSL check timed out"));
    });
  });
}
