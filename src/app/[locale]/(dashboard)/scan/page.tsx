"use client";

import { useState } from "react";
import { Shield, Search, Globe, Wifi, Lock } from "lucide-react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { ScanInput } from "@/components/scan/scan-input";
import { ScanProgress } from "@/components/scan/scan-progress";
import { ScanResults } from "@/components/results/scan-results";
import { useScanStore } from "@/stores/scan-store";

export default function ScanPage() {
  const { isScanning, currentResult } = useScanStore();

  return (
    <DashboardShell>
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-100 dark:bg-red-900/30">
          <Shield className="h-5 w-5 text-red-600 dark:text-red-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Güvenlik Tarama</h1>
          <p className="text-sm text-muted-foreground">URL, IP veya domain analizi</p>
        </div>
      </div>

      {/* Quick examples */}
      {!isScanning && !currentResult && (
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            { icon: Globe, label: "URL Tarama", example: "https://example.com", color: "blue" },
            { icon: Wifi, label: "IP Analizi", example: "8.8.8.8", color: "purple" },
            { icon: Lock, label: "Domain Kontrolü", example: "github.com", color: "green" },
          ].map((item) => (
            <div
              key={item.label}
              className={`rounded-xl border bg-${item.color}-50 dark:bg-${item.color}-950/20 p-4`}
            >
              <div className="flex items-center gap-2 mb-1">
                <item.icon className={`h-4 w-4 text-${item.color}-600`} />
                <span className="text-sm font-medium">{item.label}</span>
              </div>
              <p className="text-xs text-muted-foreground">{item.example}</p>
            </div>
          ))}
        </div>
      )}

      {/* Scan Input */}
      <ScanInput />

      {/* Progress */}
      {isScanning && <ScanProgress />}

      {/* Results */}
      {currentResult && !isScanning && <ScanResults result={currentResult} />}
    </DashboardShell>
  );
}
