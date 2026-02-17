import { create } from "zustand";
import { devtools } from "zustand/middleware";
import type { Scan, ThreatLevel, VirusTotalResult, IPInfoResult, SSLResult, WHOISResult, ShodanResult } from "@/types/scan";

interface ScanResult {
  scanId: string | null;
  target: string;
  scanType: string;
  threatLevel: ThreatLevel;
  summary: string;
  duration: number;
  results: {
    virustotal: VirusTotalResult | null;
    ipinfo: IPInfoResult | null;
    ssl: SSLResult | null;
    whois: WHOISResult | null;
    shodan: ShodanResult | null;
  };
  errors: Record<string, string | null>;
}

interface ScanOptions {
  virustotal: boolean;
  ipinfo: boolean;
  ssl: boolean;
  whois: boolean;
  shodan: boolean;
}

interface ScanState {
  target: string;
  isScanning: boolean;
  scanProgress: number;
  currentResult: ScanResult | null;
  history: Scan[];
  options: ScanOptions;

  setTarget: (target: string) => void;
  setScanning: (scanning: boolean) => void;
  setProgress: (progress: number) => void;
  setResult: (result: ScanResult | null) => void;
  setHistory: (history: Scan[]) => void;
  addToHistory: (scan: Scan) => void;
  setOptions: (options: Partial<ScanOptions>) => void;
  reset: () => void;
}

const defaultOptions: ScanOptions = {
  virustotal: true,
  ipinfo: true,
  ssl: true,
  whois: true,
  shodan: false, // Shodan is off by default (requires paid plan)
};

export const useScanStore = create<ScanState>()(
  devtools(
    (set) => ({
      target: "",
      isScanning: false,
      scanProgress: 0,
      currentResult: null,
      history: [],
      options: defaultOptions,

      setTarget: (target) => set({ target }),
      setScanning: (isScanning) => set({ isScanning }),
      setProgress: (scanProgress) => set({ scanProgress }),
      setResult: (currentResult) => set({ currentResult }),
      setHistory: (history) => set({ history }),
      addToHistory: (scan) =>
        set((state) => ({ history: [scan, ...state.history] })),
      setOptions: (options) =>
        set((state) => ({ options: { ...state.options, ...options } })),
      reset: () => set({ target: "", isScanning: false, scanProgress: 0, currentResult: null }),
    }),
    { name: "ScanStore" }
  )
);
