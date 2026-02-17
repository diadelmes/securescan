"use client";

import { Shield, AlertTriangle, CheckCircle, Clock, RefreshCw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { VirusTotalCard } from "./virustotal-card";
import { IPInfoCard } from "./ipinfo-card";
import { SSLCard } from "./ssl-card";
import { WHOISCard } from "./whois-card";
import { ShodanCard } from "./shodan-card";
import { useScanStore } from "@/stores/scan-store";
import { THREAT_LEVEL_CONFIG } from "@/types/scan";

interface ScanResultsProps {
  result: {
    scanId: string | null;
    target: string;
    scanType: string;
    threatLevel: string;
    summary: string;
    duration: number;
    results: {
      virustotal: any;
      ipinfo: any;
      ssl: any;
      whois: any;
      shodan: any;
    };
    errors: Record<string, string | null>;
  };
}

export function ScanResults({ result }: ScanResultsProps) {
  const { setResult, setTarget } = useScanStore();
  const threatConfig = THREAT_LEVEL_CONFIG[result.threatLevel as keyof typeof THREAT_LEVEL_CONFIG];

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Summary Card */}
      <Card className={`border-2 ${
        result.threatLevel === "clean" ? "border-green-500/30" :
        result.threatLevel === "low" ? "border-yellow-500/30" :
        result.threatLevel === "medium" ? "border-orange-500/30" :
        "border-red-500/30"
      }`}>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-start gap-4">
              <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-xl text-2xl ${threatConfig?.bg}`}>
                {threatConfig?.icon}
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-lg font-bold ${threatConfig?.color}`}>
                    {threatConfig?.label}
                  </span>
                  <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                    {result.scanType.toUpperCase()}
                  </span>
                </div>
                <p className="font-mono text-sm text-muted-foreground mb-1">{result.target}</p>
                <p className="text-sm">{result.summary}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                {(result.duration / 1000).toFixed(1)}s
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => { setResult(null); setTarget(""); }}
              >
                <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
                Yeni Tarama
              </Button>
            </div>
          </div>

          {/* Quick stats */}
          {result.results.virustotal && (
            <div className="mt-4 grid grid-cols-3 gap-3 rounded-lg bg-muted/50 p-3">
              <div className="text-center">
                <p className="text-2xl font-bold text-red-600">{result.results.virustotal.malicious}</p>
                <p className="text-xs text-muted-foreground">Zararlı</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-yellow-600">{result.results.virustotal.suspicious}</p>
                <p className="text-xs text-muted-foreground">Şüpheli</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">{result.results.virustotal.harmless}</p>
                <p className="text-xs text-muted-foreground">Temiz</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Detail Cards */}
      <div className="grid gap-4 lg:grid-cols-2">
        {result.results.virustotal && (
          <VirusTotalCard data={result.results.virustotal} error={result.errors.virustotal} />
        )}
        {result.results.ipinfo && (
          <IPInfoCard data={result.results.ipinfo} error={result.errors.ipinfo} />
        )}
        {result.results.ssl && (
          <SSLCard data={result.results.ssl} error={result.errors.ssl} />
        )}
        {result.results.whois && (
          <WHOISCard data={result.results.whois} error={result.errors.whois} />
        )}
        {result.results.shodan && (
          <ShodanCard data={result.results.shodan} error={result.errors.shodan} />
        )}
      </div>
    </div>
  );
}
