import { useState } from "react";
import { Search } from "lucide-react";
import type { CertificateRecord } from "../types/certificate";

interface SearchPageProps {
  records: CertificateRecord[];
  onOpenRecord: (id: string) => void;
}

function statusLabel(status: CertificateRecord["status"]) {
  switch (status) {
    case "confirmed": return "Confirmed";
    case "ocr_extracted_needs_review": return "Needs Review";
    case "manual_draft": return "Draft";
    default: return status;
  }
}

function statusClass(status: CertificateRecord["status"]) {
  switch (status) {
    case "confirmed": return "bg-black text-white";
    case "ocr_extracted_needs_review": return "bg-neutral-200 text-neutral-800";
    case "manual_draft": return "bg-neutral-100 text-neutral-600";
    default: return "bg-neutral-100 text-neutral-600";
  }
}

export function SearchPage({ records, onOpenRecord }: SearchPageProps) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sourceFilter, setSourceFilter] = useState<string>("all");

  const filtered = records.filter((r) => {
    const q = search.toLowerCase();
    const matchesSearch = !q
      || r.recordNumber.toLowerCase().includes(q)
      || r.fields.applicantName?.toLowerCase().includes(q)
      || r.fields.landLocation?.toLowerCase().includes(q);
    const matchesStatus = statusFilter === "all" || r.status === statusFilter;
    const matchesSource = sourceFilter === "all" || r.source === sourceFilter;
    return matchesSearch && matchesStatus && matchesSource;
  });

  const filterBtn = (active: boolean) => ({
    fontSize: 12, fontWeight: 500, padding: "5px 12px", borderRadius: 6, cursor: "pointer", border: "1px solid",
    borderColor: active ? "#111" : "#e5e5e5",
    background: active ? "#111" : "#fff",
    color: active ? "#fff" : "#737373",
  } as React.CSSProperties);

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Search Records</h2>
        <p className="mt-1 text-sm text-neutral-500">Find and manage Certificate of Occupancy records.</p>
      </div>

      {/* Search + filters */}
      <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
        <div style={{ position: "relative", flex: 1, minWidth: 200 }}>
          <Search size={13} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "#a3a3a3", pointerEvents: "none" }} />
          <input className="shadow-xs"
            type="text"
            placeholder="Search by record ID, applicant, or location…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: "100%", paddingLeft: 32, paddingRight: 12, paddingTop: 8, paddingBottom: 8, fontSize: 13, border: "1px solid #e5e5e5", borderRadius: 8, outline: "none", boxSizing: "border-box" }}
          />
        </div>

        <div style={{ display: "flex", gap: 6 }}>
          {[
            { val: "all", label: "All Status" },
            { val: "confirmed", label: "Confirmed" },
            { val: "ocr_extracted_needs_review", label: "Needs Review" },
            { val: "manual_draft", label: "Draft" },
          ].map(({ val, label }) => (
            <button key={val} onClick={() => setStatusFilter(val)} style={filterBtn(statusFilter === val)}>{label}</button>
          ))}
        </div>

        <div style={{ display: "flex", gap: 6 }}>
          {[
            { val: "all", label: "All Sources" },
            { val: "ocr_upload", label: "OCR Upload" },
            { val: "manual_entry", label: "Manual" },
          ].map(({ val, label }) => (
            <button key={val} onClick={() => setSourceFilter(val)} style={filterBtn(sourceFilter === val)}>{label}</button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-neutral-200 bg-white">
        <div className="border-b border-neutral-200 px-4 py-3 flex items-center gap-2">
          <h3 className="font-semibold text-sm">Records</h3>
          <span className="text-xs text-neutral-400 bg-neutral-100 px-2 py-0.5 rounded-full">{filtered.length}</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-neutral-200 bg-neutral-50 text-xs uppercase tracking-wide text-neutral-500">
              <tr>
                <th className="px-4 py-3">Record ID</th>
                <th className="px-4 py-3">Applicant</th>
                <th className="px-4 py-3">Location</th>
                <th className="px-4 py-3">Source</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Created</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-neutral-400">
                    {records.length === 0 ? "No records yet. Upload a certificate or create a manual record." : "No records match your search."}
                  </td>
                </tr>
              ) : (
                filtered.map((record) => (
                  <tr key={record.id} className="border-b border-neutral-100 hover:bg-neutral-50">
                    <td className="px-4 py-3 font-mono text-xs font-medium">{record.recordNumber}</td>
                    <td className="px-4 py-3">{record.fields.applicantName || <span className="text-neutral-400">—</span>}</td>
                    <td className="px-4 py-3">{record.fields.landLocation || record.fields.applicantAddress || <span className="text-neutral-400">—</span>}</td>
                    <td className="px-4 py-3 text-neutral-600">{record.source === "ocr_upload" ? "OCR Upload" : "Manual Entry"}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2 py-1 text-xs font-medium ${statusClass(record.status)}`}>
                        {statusLabel(record.status)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-neutral-500">{new Date(record.createdAt).toLocaleDateString()}</td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => onOpenRecord(record.id)}
                        className="rounded-lg border border-neutral-300 px-3 py-1.5 text-sm hover:bg-neutral-100 transition-colors"
                      >
                        View / Edit
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
