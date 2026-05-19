import { useState } from "react";
import type { CertificateRecord } from "../types/certificate";
import { CertificateForm } from "../components/CertificateForm";
import { updateRecord, deleteRecord } from "../services/recordStorage";
import { logAction } from "../services/auditLog";

interface RecordDetailPageProps {
  record: CertificateRecord;
  onSaved: () => void;
  onBack: () => void;
}

export function RecordDetailPage({
  record,
  onSaved,
  onBack,
}: RecordDetailPageProps) {
  const [draft, setDraft] = useState<CertificateRecord>(record);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  function saveChanges() {
    updateRecord({
      ...draft,
      updatedAt: new Date().toISOString(),
    });
    logAction("field_edited", record.id, draft.recordNumber);
    logAction("record_updated", record.id, draft.recordNumber);
    onSaved();
  }

  function confirmRecord() {
    updateRecord({
      ...draft,
      status: "confirmed",
      updatedAt: new Date().toISOString(),
    });
    logAction("record_confirmed", record.id, draft.recordNumber);
    onSaved();
  }

  function handleDelete() {
    deleteRecord(record.id);
    logAction("record_deleted", record.id, draft.recordNumber);
    onSaved();
  }

  function exportJson() {
    const data = {
      recordNumber: draft.recordNumber,
      source: draft.source,
      status: draft.status,
      fields: draft.fields,
      rawOcrText: draft.rawOcrText,
      createdAt: draft.createdAt,
      updatedAt: draft.updatedAt,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${draft.recordNumber}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function statusLabel(status: CertificateRecord["status"]) {
    switch (status) {
      case "confirmed":
        return "Confirmed";
      case "ocr_extracted_needs_review":
        return "Needs Review";
      case "manual_draft":
        return "Draft";
      default:
        return status;
    }
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <button
            onClick={onBack}
            className="mb-3 text-sm text-gray-500 hover:text-black transition-colors"
          >
            ← Back to dashboard
          </button>
          <h2 className="text-2xl font-semibold tracking-tight font-mono">
            {draft.recordNumber}
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Source:{" "}
            {draft.source === "ocr_upload" ? "OCR Upload" : "Manual Entry"}{" "}
            &middot; Status: {statusLabel(draft.status)} &middot; Created{" "}
            {new Date(draft.createdAt).toLocaleDateString()}
          </p>
        </div>

        <div className="flex gap-2 shrink-0">
          <button
            onClick={exportJson}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            Export JSON
          </button>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-600 hover:bg-red-50 hover:border-red-300 hover:text-red-700 transition-colors"
          >
            Delete
          </button>
          <button
            onClick={saveChanges}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            Save Changes
          </button>
          {draft.status !== "confirmed" && (
            <button
              onClick={confirmRecord}
              className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 transition-colors"
            >
              Confirm
            </button>
          )}
        </div>
      </div>

      {showDeleteConfirm && (
        <div className="rounded-xl border border-gray-300 bg-gray-50 p-4 flex items-center justify-between gap-4">
          <p className="text-sm text-gray-700">
            Delete record <span className="font-mono font-medium">{draft.recordNumber}</span>? This cannot be undone.
          </p>
          <div className="flex gap-2 shrink-0">
            <button
              onClick={() => setShowDeleteConfirm(false)}
              className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm hover:bg-white transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              className="rounded-lg bg-black px-3 py-1.5 text-sm font-medium text-white hover:bg-gray-800 transition-colors"
            >
              Delete
            </button>
          </div>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[420px_1fr]">
        <div className="space-y-4">
          {draft.uploadedFileDataUrl && (
            <div className="rounded-xl border border-gray-200 bg-white p-4">
              <h3 className="mb-3 text-sm font-semibold">Uploaded Document</h3>
              {draft.uploadedFileType === "application/pdf" ? (
                <p className="text-sm text-gray-500">
                  PDF preview not implemented in this version.
                </p>
              ) : (
                <img
                  src={draft.uploadedFileDataUrl}
                  alt="Uploaded document"
                  className="max-h-[520px] w-full rounded-lg border border-gray-200 object-contain"
                />
              )}
              {draft.uploadedFileName && (
                <p className="mt-2 text-xs text-gray-400">
                  {draft.uploadedFileName}
                </p>
              )}
            </div>
          )}

          {draft.rawOcrText && (
            <div className="rounded-xl border border-gray-200 bg-white p-4">
              <h3 className="mb-3 text-sm font-semibold">Raw OCR Text</h3>
              <pre className="max-h-80 overflow-auto whitespace-pre-wrap rounded-lg bg-gray-50 p-3 text-xs text-gray-700 leading-relaxed">
                {draft.rawOcrText}
              </pre>
            </div>
          )}

          {!draft.uploadedFileDataUrl && !draft.rawOcrText && (
            <div className="rounded-xl border border-gray-200 bg-white p-4 text-sm text-gray-400">
              No uploaded document or OCR text for this record.
            </div>
          )}
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <h3 className="mb-5 text-base font-semibold">Certificate Fields</h3>
          <CertificateForm
            fields={draft.fields}
            onChange={(fields) => setDraft({ ...draft, fields })}
          />
        </div>
      </div>
    </div>
  );
}
