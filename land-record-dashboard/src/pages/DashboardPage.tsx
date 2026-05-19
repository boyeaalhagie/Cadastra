import type { CertificateRecord } from "../types/certificate";

interface DashboardPageProps {
  records: CertificateRecord[];
  onOpenRecord: (id: string) => void;
}

export function DashboardPage({ records, onOpenRecord }: DashboardPageProps) {
  const confirmed = records.filter((r) => r.status === "confirmed").length;
  const needsReview = records.filter(
    (r) => r.status === "ocr_extracted_needs_review",
  ).length;
  const manual = records.filter((r) => r.source === "manual_entry").length;
  const drafts = records.filter((r) => r.status === "manual_draft").length;

  const statCards = [
    { label: "Total Records", value: records.length },
    { label: "Confirmed", value: confirmed },
    { label: "Needs Review", value: needsReview },
    { label: "Manual / Drafts", value: manual + drafts },
  ];

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

  function statusClass(status: CertificateRecord["status"]) {
    switch (status) {
      case "confirmed":
        return "bg-black text-white";
      case "ocr_extracted_needs_review":
        return "bg-gray-200 text-gray-800";
      case "manual_draft":
        return "bg-gray-100 text-gray-600";
      default:
        return "bg-gray-100 text-gray-600";
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">
          Record Intake Dashboard
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          Local prototype for Certificate of Occupancy Form 8 digitization.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        {statCards.map((card) => (
          <div
            key={card.label}
            className="rounded-xl border border-gray-200 bg-white p-4"
          >
            <p className="text-sm text-gray-500">{card.label}</p>
            <p className="mt-2 text-3xl font-semibold">{card.value}</p>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-gray-200 bg-white">
        <div className="border-b border-gray-200 p-4">
          <h3 className="font-semibold">Records</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-gray-200 bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
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
              {records.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-12 text-center text-gray-400"
                  >
                    No records yet. Upload a certificate or create a manual
                    record.
                  </td>
                </tr>
              ) : (
                records.map((record) => (
                  <tr
                    key={record.id}
                    className="border-b border-gray-100 hover:bg-gray-50"
                  >
                    <td className="px-4 py-3 font-mono text-xs font-medium">
                      {record.recordNumber}
                    </td>
                    <td className="px-4 py-3">
                      {record.fields.applicantName || (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {record.fields.landLocation ||
                        record.fields.applicantAddress || (
                          <span className="text-gray-400">—</span>
                        )}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {record.source === "ocr_upload"
                        ? "OCR Upload"
                        : "Manual Entry"}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2 py-1 text-xs font-medium ${statusClass(record.status)}`}
                      >
                        {statusLabel(record.status)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      {new Date(record.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => onOpenRecord(record.id)}
                        className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm hover:bg-gray-100 transition-colors"
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
