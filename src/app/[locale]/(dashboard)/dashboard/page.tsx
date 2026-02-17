"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { Shield, Search, Clock, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { useScanStore } from "@/stores/scan-store";
import { createClient } from "@/lib/supabase/client";
import { THREAT_LEVEL_CONFIG } from "@/types/scan";

export default function DashboardPage() {
  const { data: session } = useSession();
  const { history, setHistory } = useScanStore();
  const supabase = createClient();

  useEffect(() => {
    if (!session?.user?.email) return;
    async function load() {
      const { data: profile } = await supabase.from("profiles").select("*").eq("email", session!.user!.email!).single();
      if (!profile) return;
      const { data: scans } = await supabase.from("scans").select("*").eq("user_id", profile.id).order("created_at", { ascending: false }).limit(10);
      if (scans) setHistory(scans as any);
    }
    load();
  }, [session]);

  const threatCounts = history.reduce((acc: any, s: any) => {
    acc[s.threat_level] = (acc[s.threat_level] || 0) + 1;
    return acc;
  }, {});

  return (
    <DashboardShell>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <Button asChild className="bg-red-600 hover:bg-red-700">
          <Link href="/scan"><Shield className="mr-2 h-4 w-4" />Yeni Tarama</Link>
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Toplam Tarama</CardTitle></CardHeader>
          <CardContent><div className="text-3xl font-bold">{history.length}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Tehdit Tespit</CardTitle></CardHeader>
          <CardContent><div className="text-3xl font-bold text-red-600">{(threatCounts.high || 0) + (threatCounts.critical || 0)}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Temiz</CardTitle></CardHeader>
          <CardContent><div className="text-3xl font-bold text-green-600">{threatCounts.clean || 0}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Şüpheli</CardTitle></CardHeader>
          <CardContent><div className="text-3xl font-bold text-yellow-600">{(threatCounts.low || 0) + (threatCounts.medium || 0)}</div></CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Clock className="h-4 w-4" />Son Taramalar
          </CardTitle>
        </CardHeader>
        <CardContent>
          {history.length === 0 ? (
            <div className="flex flex-col items-center py-8 text-center">
              <Search className="mb-3 h-10 w-10 text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground">Henüz tarama yok</p>
              <Button asChild size="sm" className="mt-3"><Link href="/scan">İlk Taramayı Yap</Link></Button>
            </div>
          ) : (
            <div className="space-y-2">
              {history.slice(0, 8).map((scan: any) => {
                const threat = THREAT_LEVEL_CONFIG[scan.threat_level as keyof typeof THREAT_LEVEL_CONFIG];
                return (
                  <div key={scan.id} className="flex items-center gap-3 rounded-lg border p-3">
                    <span className="text-xl">{threat?.icon ?? "🔍"}</span>
                    <div className="flex-1 min-w-0">
                      <p className="truncate font-mono text-sm">{scan.target}</p>
                      <p className={`text-xs ${threat?.color}`}>{threat?.label} · {scan.scan_type?.toUpperCase()}</p>
                    </div>
                    <span className="text-xs text-muted-foreground">{new Date(scan.created_at).toLocaleDateString("tr-TR")}</span>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </DashboardShell>
  );
}
