import type { CertificateRecord } from "../types/certificate";

const STORAGE_KEY = "certificate_records";

export function getRecords(): CertificateRecord[] {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as CertificateRecord[];
  } catch {
    return [];
  }
}

function saveRecords(records: CertificateRecord[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  } catch (e) {
    if (e instanceof DOMException && e.name === "QuotaExceededError") {
      alert("Storage is full. Delete some records to free up space.");
    }
    throw e;
  }
}

export function addRecord(record: CertificateRecord) {
  const records = getRecords();
  saveRecords([record, ...records]);
}

export function updateRecord(updatedRecord: CertificateRecord) {
  const records = getRecords();
  const next = records.map((r) =>
    r.id === updatedRecord.id ? updatedRecord : r,
  );
  saveRecords(next);
}

export function getRecordById(id: string): CertificateRecord | undefined {
  return getRecords().find((r) => r.id === id);
}

export function deleteRecord(id: string) {
  const records = getRecords();
  saveRecords(records.filter((r) => r.id !== id));
}
