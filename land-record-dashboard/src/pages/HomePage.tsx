import { LayoutDashboard, ScanLine, FilePen } from "lucide-react";

interface HomePageProps {
  onNavigate: (view: string) => void;
}

const cards = [
  {
    id: "dashboard",
    Icon: LayoutDashboard,
    title: "Dashboard",
    description:
      "View and manage all digitized Certificate of Occupancy records. Track status, search entries, and confirm reviewed records.",
    action: "Open Dashboard",
  },
  {
    id: "upload",
    Icon: ScanLine,
    title: "Upload + OCR",
    description:
      "Upload a scanned certificate image or PDF. OCR extracts the text automatically — review and correct the fields side by side.",
    action: "Start OCR",
  },
  {
    id: "manual",
    Icon: FilePen,
    title: "Manual Template",
    description:
      "Fill in a blank Certificate of Occupancy Form 8 directly on the document. Sign, save as draft, confirm, or print.",
    action: "Open Form",
  },
];

export function HomePage({ onNavigate }: HomePageProps) {
  return (
    <div
      style={{
        maxWidth: 860,
      }}
    >
      {/* Header */}
      <div style={{ marginBottom: 48 }}>
        <h1
          style={{
            fontSize: 28,
            fontWeight: 700,
            letterSpacing: "-0.03em",
            margin: 0,
            color: "#000",
          }}
        >
          Certificate of Occupancy
        </h1>
        <p
          style={{
            marginTop: 8,
            fontSize: 15,
            color: "#6b7280",
            lineHeight: 1.6,
          }}
        >
          Land-record digitization dashboard for Form 8. Upload scanned
          certificates, run OCR, fill in manually, and manage confirmed records.
        </p>
        <div
          style={{
            marginTop: 20,
            padding: "10px 16px",
            background: "#f9fafb",
            border: "1px solid #e5e7eb",
            borderRadius: 10,
            fontSize: 12,
            color: "#9ca3af",
            display: "inline-block",
          }}
        >
          Demo prototype · Local browser storage only · Not an official government system
        </div>
      </div>

      {/* Feature cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap: 16,
        }}
      >
        {cards.map(({ id, Icon, title, description, action }) => (
          <div
            key={id}
            onClick={() => onNavigate(id)}
            style={{
              border: "1px solid #e5e7eb",
              borderRadius: 14,
              padding: "28px 24px",
              background: "#fff",
              cursor: "pointer",
              display: "flex",
              flexDirection: "column",
              gap: 12,
              transition: "box-shadow 0.15s, border-color 0.15s",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLDivElement).style.boxShadow =
                "0 4px 20px rgba(0,0,0,0.08)";
              (e.currentTarget as HTMLDivElement).style.borderColor = "#000";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLDivElement).style.boxShadow = "none";
              (e.currentTarget as HTMLDivElement).style.borderColor = "#e5e7eb";
            }}
          >
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 10,
                background: "#f3f4f6",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Icon size={20} strokeWidth={1.8} color="#111" />
            </div>

            <div>
              <div
                style={{
                  fontSize: 15,
                  fontWeight: 600,
                  color: "#111",
                  marginBottom: 6,
                }}
              >
                {title}
              </div>
              <div
                style={{
                  fontSize: 13,
                  color: "#6b7280",
                  lineHeight: 1.6,
                }}
              >
                {description}
              </div>
            </div>

            <div style={{ marginTop: "auto", paddingTop: 8 }}>
              <span
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: "#000",
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                {action}
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
