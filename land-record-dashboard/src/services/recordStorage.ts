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

export function saveRecords(records: CertificateRecord[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
}

export function addRecord(record: CertificateRecord) {
  const records = getRecords();
  saveRecords([record, ...records]);
}

export function updateRecord(updatedRecord: CertificateRecord) {
  const records = getRecords();
  const next = records.map((record) =>
    record.id === updatedRecord.id ? updatedRecord : record,
  );
  saveRecords(next);
}

export function getRecordById(id: string): CertificateRecord | undefined {
  return getRecords().find((record) => record.id === id);
}

export function deleteRecord(id: string) {
  const records = getRecords();
  saveRecords(records.filter((record) => record.id !== id));
}
