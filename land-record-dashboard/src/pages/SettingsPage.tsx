import { Settings } from "lucide-react";

export function SettingsPage() {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "60vh", gap: 16, color: "#a3a3a3" }}>
      <div style={{ width: 56, height: 56, borderRadius: 14, background: "#f5f5f5", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Settings size={26} strokeWidth={1.5} color="#a3a3a3" />
      </div>
      <div style={{ textAlign: "center" }}>
        <p style={{ margin: 0, fontSize: 16, fontWeight: 600, color: "#111" }}>Settings</p>
        <p style={{ margin: "6px 0 0", fontSize: 13, color: "#a3a3a3" }}>System preferences, user management, and configuration are coming soon.</p>
      </div>
      <span style={{ fontSize: 11, fontWeight: 500, padding: "4px 10px", borderRadius: 20, background: "#f5f5f5", color: "#a3a3a3", border: "1px solid #e5e5e5" }}>Coming Soon</span>
    </div>
  );
}
