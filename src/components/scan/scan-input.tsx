"use client";

import { useState } from "react";
import { Search, Shield, Wifi, Globe, Settings2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useScanStore } from "@/stores/scan-store";
import { useToast } from "@/hooks/use-toast";

const SCAN_OPTIONS = [
  { key: "virustotal", label: "VirusTotal", desc: "Zararlı yazılım taraması" },
  { key: "ipinfo", label: "IP Bilgisi", desc: "Konum, ISP, VPN tespiti" },
  { key: "ssl", label: "SSL Kontrolü", desc: "Sertifika geçerliliği" },
  { key: "whois", label: "WHOIS", desc: "Domain kayıt bilgileri" },
  { key: "shodan", label: "Shodan", desc: "Port ve açık servis taraması" },
] as const;

export function ScanInput() {
  const [showOptions, setShowOptions] = useState(false);
  const { target, setTarget, options, setOptions, setScanning, setProgress, setResult } = useScanStore();
  const { toast } = useToast();

  async function handleScan() {
    if (!target.trim()) {
      toast({ title: "Hedef girin", description: "URL, IP veya domain adresi girin.", variant: "destructive" });
      return;
    }

    setScanning(true);
    setResult(null);
    setProgress(10);

    // Simulate progress during scan
    const progressInterval = setInterval(() => {
      setProgress(Math.min(90, useScanStore.getState().scanProgress + 8));
    }, 2000);

    try {
      const res = await fetch("/api/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ target: target.trim(), scanType: "auto", options }),
      });

      clearInterval(progressInterval);
      setProgress(100);

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? "Tarama başarısız");
      }

      const data = await res.json();
      setResult(data);
    } catch (err: any) {
      toast({ title: "Hata", description: err.message, variant: "destructive" });
    } finally {
      clearInterval(progressInterval);
      setScanning(false);
    }
  }

  return (
    <div className="space-y-4">
      {/* Search bar */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-10 h-12 text-base"
            placeholder="https://example.com, 8.8.8.8 veya github.com"
            value={target}
            onChange={(e) => setTarget(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleScan()}
          />
        </div>
        <Button size="lg" onClick={handleScan} className="h-12 px-6 gap-2">
          <Shield className="h-4 w-4" />
          Tara
        </Button>
        <Button
          size="lg"
          variant="outline"
          className="h-12 px-4"
          onClick={() => setShowOptions(!showOptions)}
        >
          <Settings2 className="h-4 w-4" />
        </Button>
      </div>

      {/* Scan options */}
      {showOptions && (
        <div className="rounded-xl border bg-card p-4">
          <p className="mb-3 text-sm font-medium">Tarama Seçenekleri</p>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {SCAN_OPTIONS.map((opt) => (
              <div key={opt.key} className="flex items-start justify-between gap-3 rounded-lg border p-3">
                <div>
                  <p className="text-sm font-medium">{opt.label}</p>
                  <p className="text-xs text-muted-foreground">{opt.desc}</p>
                </div>
                <Switch
                  checked={options[opt.key]}
                  onCheckedChange={(v) => setOptions({ [opt.key]: v })}
                />
              </div>
            ))}
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            💡 Shodan taraması API anahtarı gerektirir. Diğer taramalar ücretsiz planlarda çalışır.
          </p>
        </div>
      )}
    </div>
  );
}
