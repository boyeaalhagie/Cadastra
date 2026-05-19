import { useEffect, useState } from "react";
import { AppShell } from "./components/AppShell";
import { HomePage } from "./pages/HomePage";
import { DashboardPage } from "./pages/DashboardPage";
import { UploadOcrPage } from "./pages/UploadOcrPage";
import { ManualEntryPage } from "./pages/ManualEntryPage";
import { RecordDetailPage } from "./pages/RecordDetailPage";
import type { CertificateRecord } from "./types/certificate";
import { getRecords } from "./services/recordStorage";

type View = "home" | "dashboard" | "upload" | "manual" | "detail";

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

  return (
    <AppShell
      currentView={view}
      onNavigate={(nextView) => setView(nextView as View)}
    >
      {view === "home" && <HomePage onNavigate={(v) => setView(v as View)} />}

      {view === "dashboard" && (
        <DashboardPage records={records} onOpenRecord={handleOpenRecord} />
      )}

      {view === "upload" && <UploadOcrPage onSaved={handleSaved} />}

      {view === "manual" && <ManualEntryPage onSaved={handleSaved} />}

      {view === "detail" && selectedRecord && (
        <RecordDetailPage
          record={selectedRecord}
          onSaved={handleSaved}
          onBack={() => setView("dashboard")}
        />
      )}

      {view === "detail" && !selectedRecord && (
        <div className="p-6 text-gray-500 text-sm">
          Record not found.{" "}
          <button onClick={() => setView("dashboard")} className="underline hover:text-black">
            Back to dashboard
          </button>
        </div>
      )}
    </AppShell>
  );
}

export default App;
