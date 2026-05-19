export interface AuditEntry {
  id: string;
  action:
    | "document_uploaded"
    | "ocr_started"
    | "ocr_completed"
    | "field_edited"
    | "record_confirmed"
    | "record_updated"
    | "record_deleted";
  recordId: string;
  timestamp: string;
  details?: string;
}

const AUDIT_KEY = "certificate_audit_log";
const MAX_ENTRIES = 500;

export function getAuditLog(): AuditEntry[] {
  try {
    return JSON.parse(localStorage.getItem(AUDIT_KEY) || "[]");
  } catch {
    return [];
  }
}

export function logAction(
  action: AuditEntry["action"],
  recordId: string,
  details?: string,
) {
  const entries = getAuditLog();
  entries.unshift({
    id: crypto.randomUUID(),
    action,
    recordId,
    timestamp: new Date().toISOString(),
    details,
  });
  localStorage.setItem(
    AUDIT_KEY,
    JSON.stringify(entries.slice(0, MAX_ENTRIES)),
  );
}
