"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Shield, Clock, ExternalLink, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { useScanStore } from "@/stores/scan-store";
import { createClient } from "@/lib/supabase/client";
import { THREAT_LEVEL_CONFIG } from "@/types/scan";

export default function HistoryPage() {
  const { data: session } = useSession();
  const { history, setHistory } = useScanStore();
  const supabase = createClient();

  useEffect(() => {
    if (!session?.user?.email) return;
    async function loadHistory() {
      const { data: profile } = await supabase
        .from("profiles")
        .select("id")
        .eq("email", session!.user!.email!)
        .single();

      if (!profile) return;

      const { data: scans } = await supabase
        .from("scans")
        .select("*")
        .eq("user_id", profile.id)
        .order("created_at", { ascending: false })
        .limit(50);

      if (scans) setHistory(scans as any);
    }
    loadHistory();
  }, [session]);

  async function handleDelete(scanId: string) {
    await supabase.from("scans").delete().eq("id", scanId);
    setHistory(history.filter((s: any) => s.id !== scanId));
  }

  return (
    <DashboardShell>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Tarama Geçmişi</h1>
        <span className="text-sm text-muted-foreground">{history.length} tarama</span>
      </div>

      {history.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-16 text-center">
          <Shield className="mb-4 h-12 w-12 text-muted-foreground/40" />
          <h3 className="mb-1 font-semibold">Henüz tarama yok</h3>
          <p className="mb-4 text-sm text-muted-foreground">İlk taramanı yapmak için tara butonuna tıkla</p>
          <Button asChild><Link href="/scan">Taramaya Başla</Link></Button>
        </div>
      ) : (
        <div className="space-y-3">
          {history.map((scan: any) => {
            const threat = THREAT_LEVEL_CONFIG[scan.threat_level as keyof typeof THREAT_LEVEL_CONFIG];
            return (
              <Card key={scan.id} className="group">
                <CardContent className="flex items-center gap-4 py-4">
                  <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-lg ${threat?.bg}`}>
                    {threat?.icon ?? "🔍"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="truncate font-medium font-mono text-sm">{scan.target}</p>
                    <div className="flex items-center gap-3 mt-0.5">
                      <span className={`text-xs font-medium ${threat?.color}`}>{threat?.label ?? "—"}</span>
                      <span className="text-xs text-muted-foreground uppercase">{scan.scan_type}</span>
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {new Date(scan.created_at).toLocaleDateString("tr-TR")}
                      </span>
                    </div>
                    {scan.summary && (
                      <p className="mt-1 text-xs text-muted-foreground line-clamp-1">{scan.summary}</p>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 opacity-0 group-hover:opacity-100"
                    onClick={() => handleDelete(scan.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </DashboardShell>
  );
}
