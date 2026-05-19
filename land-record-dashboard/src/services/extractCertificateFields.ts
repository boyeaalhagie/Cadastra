import type { CertificateFields } from "../types/certificate";
import { emptyCertificateFields } from "../utils/defaultCertificateFields";

function clean(text: string) {
  return text
    .replace(/\r/g, "\n")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{2,}/g, "\n")
    .trim();
}

function matchFirst(text: string, patterns: RegExp[]): string {
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match?.[1]) return match[1].trim();
  }
  return "";
}

export function extractCertificateFields(rawText: string): CertificateFields {
  const text = clean(rawText);

  const fields: CertificateFields = {
    ...emptyCertificateFields,
  };

  fields.applicantName = matchFirst(text, [
    /Mr\/Mrs\/Miss\s+([A-Za-z .'-]+)/i,
    /applicant[,:\s]+(?:Mr\.?|Mrs\.?|Miss)?\s*([A-Za-z .'-]+)/i,
  ]);

  fields.applicantAddress = matchFirst(text, [
    /\bof\s+([A-Za-z ,.'-]+)\s+has been holding/i,
    /of\s+([A-Za-z ,.'-]+)\s+has\s+been/i,
  ]);

  fields.landDescription = matchFirst(text, [
    /land described as follows[:\s]+([\s\S]*?)and as shown/i,
    /described as follows[:\s]+([\s\S]*?)location plan/i,
  ]);

  fields.customaryTenureSince = matchFirst(text, [
    /customary tenure since\s+([A-Za-z0-9 ,./-]+)/i,
    /tenure since\s+([A-Za-z0-9 ,./-]+)/i,
  ]);

  fields.alkaliName = matchFirst(text, [
    /Name of Alkali of\s+([A-Za-z .'-]+)/i,
    /Alkali of\s+([A-Za-z .'-]+)/i,
  ]);

  fields.chiefName = matchFirst(text, [
    /Name of Chief of\s+([A-Za-z .'-]+)/i,
    /Chief of\s+([A-Za-z .'-]+)/i,
  ]);

  fields.localGovernmentOfficer = matchFirst(text, [
    /Signature of Local Government Officer[\s\S]*?Council of\s+([A-Za-z .'-]+)/i,
  ]);

  fields.areaCouncil = matchFirst(text, [
    /Council of\s+([A-Za-z .'-]+Council)/i,
    /(Brikama Area Council|Kanifing Municipal Council|Banjul City Council)/i,
  ]);

  fields.declarationApplicantName = matchFirst(text, [
    /Declaration:\s*I\s+([A-Za-z .'-]+)\s+declare/i,
    /\(Sgd\):\s+([A-Za-z .'-]+)/i,
  ]);

  fields.labSecretaryDecision = matchFirst(text, [
    /(The ownership of the land[\s\S]*?found correct\.)/i,
    /(The ownership of the land[\s\S]*?District Authority for verification)/i,
  ]);

  fields.districtVerificationName = matchFirst(text, [
    /on behalf of the\s*.*?([A-Za-z ]+District Authority)/i,
  ]);

  fields.districtVerificationLocation = matchFirst(text, [
    /mentioned land at\s+([A-Za-z ,.'-]+)/i,
    /land at\s+([A-Za-z ,.'-]+)\s+and found/i,
  ]);

  fields.districtVerificationResult = text
    .toLowerCase()
    .includes("is the rightful owner")
    ? "Applicant is the rightful owner of the land"
    : "";

  fields.chairmanName = matchFirst(text, [
    /Chairman\s+([A-Za-z .'-]+)/i,
    /District Authority\s+([A-Za-z .'-]+)\s*$/i,
  ]);

  fields.notes = "Extracted by OCR. Requires human review.";

  return fields;
}
