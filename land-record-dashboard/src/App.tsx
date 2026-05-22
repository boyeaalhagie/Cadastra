import { useEffect, useState } from "react";
import { Toaster } from "sonner";
import { AppShell } from "./components/AppShell";
import { HomePage } from "./pages/HomePage";
import { DashboardPage } from "./pages/DashboardPage";
import { UploadOcrPage } from "./pages/UploadOcrPage";
import { CameraCapturePage } from "./pages/CameraCapturePage";
import { MapViewPage } from "./pages/MapViewPage";
import { ManualEntryPage } from "./pages/ManualEntryPage";
import { RecordDetailPage } from "./pages/RecordDetailPage";
import { SearchPage } from "./pages/SearchPage";
import { ExportPage } from "./pages/ExportPage";
import { SettingsPage } from "./pages/SettingsPage";
import { PhoneCameraPage } from "./pages/PhoneCameraPage";
import type { CertificateRecord } from "./types/certificate";
import { getRecords } from "./services/recordStorage";

type View = "home" | "dashboard" | "search" | "map-view" | "upload" | "camera" | "manual" | "detail" | "export" | "settings";

// If the URL contains ?phone=1, render the phone camera interface (no HTTPS or PeerJS needed)
const phonecamId = ["camera", "gallery"].includes(
  new URLSearchParams(window.location.search).get("phone") ?? ""
) ? true : null;

function App() {
  const [view, setView] = useState<View>("home");
  const [records, setRecords] = useState<CertificateRecord[]>([]);
  const [selectedRecordId, setSelectedRecordId] = useState<string | null>(null);

  function refreshRecords() {
    setRecords(getRecords());
  }

  useEffect(() => {
    refreshRecords();
  }, []);

  function handleSaved() {
    refreshRecords();
    setView("dashboard");
  }

  function handleOpenRecord(id: string) {
    setSelectedRecordId(id);
    setView("detail");
  }

  const selectedRecord = records.find((r) => r.id === selectedRecordId);

  // Phone camera mode — full-screen, no AppShell
  if (phonecamId) return <PhoneCameraPage />;


  return (
    <>
    <Toaster position="top-center" richColors closeButton />
    <AppShell
      currentView={view}
      onNavigate={(nextView) => setView(nextView as View)}
    >
      {view === "home" && <HomePage onNavigate={(v) => setView(v as View)} />}

      {view === "dashboard" && (
        <DashboardPage records={records} onOpenRecord={handleOpenRecord} />
      )}

      {view === "search"    && <SearchPage records={records} onOpenRecord={handleOpenRecord} />}
{view === "export"    && <ExportPage />}
      {view === "settings"  && <SettingsPage />}

      {view === "upload" && <UploadOcrPage onSaved={handleSaved} />}

      {view === "map-view" && <MapViewPage onOpenRecord={handleOpenRecord} />}

      {view === "camera" && <CameraCapturePage onSaved={handleSaved} />}

      {view === "manual" && <ManualEntryPage onSaved={handleSaved} />}

      {view === "detail" && selectedRecord && (
        <RecordDetailPage
          record={selectedRecord}
          onSaved={handleSaved}
          onBack={() => setView("dashboard")}
        />
      )}

      {view === "detail" && !selectedRecord && (
        <div className="p-6 text-neutral-500 text-sm">
          Record not found.{" "}
          <button onClick={() => setView("dashboard")} className="underline hover:text-black">
            Back to dashboard
          </button>
        </div>
      )}
    </AppShell>
    </>
  );
}

export default App;
