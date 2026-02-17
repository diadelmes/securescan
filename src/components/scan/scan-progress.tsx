"use client";

import { useEffect, useState } from "react";
import { Shield, Loader2 } from "lucide-react";
import { useScanStore } from "@/stores/scan-store";

const STEPS = [
  { label: "VirusTotal taraması başlatılıyor...", min: 0 },
  { label: "IP bilgileri alınıyor...", min: 20 },
  { label: "SSL sertifikası kontrol ediliyor...", min: 40 },
  { label: "WHOIS sorgulanıyor...", min: 60 },
  { label: "Shodan analizi yapılıyor...", min: 75 },
  { label: "Sonuçlar derleniyor...", min: 90 },
];

export function ScanProgress() {
  const { scanProgress, target } = useScanStore();
  const currentStep = STEPS.filter((s) => scanProgress >= s.min).at(-1);

  return (
    <div className="rounded-xl border bg-card p-6">
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 animate-pulse">
          <Shield className="h-5 w-5 text-primary" />
        </div>
        <div>
          <p className="font-semibold">Taranıyor: <span className="text-primary font-mono text-sm">{target}</span></p>
          <p className="text-sm text-muted-foreground flex items-center gap-1">
            <Loader2 className="h-3 w-3 animate-spin" />
            {currentStep?.label}
          </p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>İlerleme</span>
          <span>{scanProgress}%</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary transition-all duration-500"
            style={{ width: `${scanProgress}%` }}
          />
        </div>
      </div>

      {/* Steps */}
      <div className="mt-4 grid grid-cols-2 gap-1.5 sm:grid-cols-3">
        {STEPS.map((step) => (
          <div
            key={step.label}
            className={`flex items-center gap-1.5 rounded-md px-2 py-1 text-xs transition-colors ${
              scanProgress >= step.min
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground"
            }`}
          >
            <div className={`h-1.5 w-1.5 rounded-full ${scanProgress >= step.min ? "bg-primary" : "bg-muted-foreground/30"}`} />
            {step.label.replace("...", "")}
          </div>
        ))}
      </div>
    </div>
  );
}
