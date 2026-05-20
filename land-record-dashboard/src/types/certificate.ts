export type RecordSource = "ocr_upload" | "manual_entry";

export interface GeoJsonPolygon {
  type: "Polygon";
  coordinates: number[][][];
}

export type ReviewStatus =
  | "ocr_extracted_needs_review"
  | "confirmed"
  | "manual_draft";

export type OcrStatus = "not_started" | "processing" | "completed" | "failed";

export interface CertificateFields {
  applicantName: string;
  applicantAddress: string;
  landDescription: string;
  landLocation: string;
  customaryTenureSince: string;

  alkaliName: string;
  chiefName: string;
  districtAuthority: string;
  localGovernmentOfficer: string;
  areaCouncil: string;

  declarationApplicantName: string;
  labSecretaryDecision: string;

  districtVerificationName: string;
  districtVerificationLocation: string;
  districtVerificationResult: string;
  chairmanName: string;

  certificateDateAlkali: string;
  certificateDateChief: string;
  localOfficerDate: string;
  districtVerificationDate: string;

  notes: string;

  /* Signature data URLs — optional, only present on manually signed records */
  alkaliSignature?: string;
  chiefSignature?: string;
  localOfficerSignature?: string;
  declarationSignature?: string;
  chairmanSignature?: string;
}

export interface CertificateRecord {
  id: string;
  recordNumber: string;
  source: RecordSource;
  status: ReviewStatus;
  ocrStatus: OcrStatus;

  fields: CertificateFields;

  boundary?: GeoJsonPolygon;

  rawOcrText?: string;
  uploadedFileName?: string;
  uploadedFileType?: string;

  createdAt: string;
  updatedAt: string;
}
