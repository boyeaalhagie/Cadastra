# Certificate of Occupancy OCR Dashboard — Product + Implementation Plan

## 1. Product Goal

Build a minimal, government-facing web dashboard for digitizing **Certificate of Occupancy Form 8** records.

The first version will focus on one document type only:

> Certificate of Occupancy of Land Held Under Customary Tenancy or Year to Year Tenancy

The system allows an officer to:

1. Upload a scanned Certificate of Occupancy document.
2. Run OCR to extract text from the document.
3. Auto-map extracted text into structured fields.
4. Review the extracted fields.
5. Edit/fix OCR mistakes manually.
6. Confirm and save the cleaned record locally.
7. Create a new Certificate of Occupancy record manually using a blank template form.
8. View all locally saved records in a clean dashboard.

For now, there is **no external database**. All records should be stored locally in the browser using `localStorage` or `IndexedDB`.

The design should be minimalistic using **black, white, and gray** only.

---

## 2. Target Users

This MVP is for internal government-style workflow, not public citizens.

Primary user:

- Land office data-entry officer
- GIS/land records officer
- District authority officer
- Reviewer/approver

The product should feel like an internal land-record digitization dashboard.

---

## 3. Core MVP Features

OCR Engine: PaddleOCR
Frontend: React + Tailwind + TypeScript
Backend OCR service: FastAPI + Python

### Feature 1: Dashboard Home

The dashboard should show summary cards:

- Total Records
- OCR Pending Review
- Confirmed Records
- Manually Created Records
- Recently Added Records

Also show a records table with:

- Record ID
- Applicant Name
- Location
- District Authority
- Status
- Created Date
- Source Type: `OCR Upload` or `Manual Entry`
- Action button: View/Edit

---

### Feature 2: Upload Document + OCR

User flow:

1. Officer clicks **Upload Certificate**.
2. Officer uploads PDF, PNG, or JPG.
3. System previews the uploaded file.
4. Officer clicks **Run OCR**.
5. OCR extracts raw text.
6. System displays:
   - Uploaded document preview
   - Raw OCR text
   - Extracted structured fields
7. Officer edits incorrect fields.
8. Officer clicks **Confirm Record**.
9. Record is saved locally.

OCR status values:

```ts
"not_started" | "processing" | "completed" | "failed";
```

Record review status values:

```ts
"ocr_extracted_needs_review" | "confirmed" | "manual_draft";
```

---

### Feature 3: Human Review + Editable Fields

After OCR, the extracted fields must never be treated as final automatically.

Every extracted field should be editable.

The UI should show a message:

> OCR results require human review before confirmation.

Important fields:

- Applicant name
- Applicant address/place
- Land description
- Land location
- Customary tenure since
- Alkali name
- Chief name
- District Authority
- Local Government Officer / Clerk
- Area Council / Municipal Council
- Declaration applicant name
- LAB Secretary decision
- District verification location
- District verification result
- Chairman name
- Certificate dates
- Notes

---

### Feature 4: Manual Template Form

The dashboard must also provide a blank template where officers can manually fill in the Certificate of Occupancy fields.

User flow:

1. Officer clicks **New Manual Record**.
2. Blank Certificate of Occupancy form opens.
3. Officer fills fields.
4. Officer saves as draft or confirms.
5. Record is saved locally.

This is important because OCR may not always work, and some records may be entered directly from paper.

---

### Feature 5: Record Detail Page

Each saved record should have a detail/edit page.

The detail page should show:

- Record metadata
- Structured fields
- Raw OCR text, if available
- Uploaded document preview, if available
- Confirmation status
- Edit button
- Save changes button

---

### Feature 6: Local Storage Only

For now, no external backend and no external database.

Use browser local persistence:

Preferred:

```ts
localStorage;
```

Optional better version:

```ts
IndexedDB;
```

For MVP simplicity, use `localStorage`.

The app should store:

```ts
certificate_records;
```

as a JSON array.

---

## 4. Recommended Tech Stack

## OCR Decision

For the first browser-only demo, Tesseract.js can be used.

For the stronger MVP, use PaddleOCR through a local FastAPI backend.

Preferred serious OCR setup:

Frontend:
React + TypeScript + Tailwind

Backend:
FastAPI

OCR:
PaddleOCR

Storage:
localStorage for confirmed records only

The backend should only process the uploaded image and return extracted OCR results. No records should be stored in the backend yet.

## Local OCR Backend

Create a lightweight FastAPI backend for OCR only.

Endpoint:

POST /api/ocr/certificate

Input:

- uploaded image file

Output:
{
"rawText": "...",
"lines": [
{
"text": "...",
"confidence": 0.94,
"bbox": [[x1,y1], [x2,y2], [x3,y3], [x4,y4]]
}
],
"fields": {
"applicantName": "",
"applicantAddress": "",
"landDescription": "",
"customaryTenureSince": "",
"alkaliName": "",
"chiefName": "",
"districtAuthority": "",
"areaCouncil": "",
"districtVerificationResult": ""
}
}

## OCR Confidence

Each extracted field should include a confidence score when possible.

Example:

{
"value": "Lamin Jatta",
"confidence": 0.91,
"needsReview": false
}

Fields with low confidence should be visually marked as “Needs Review.”

Confidence thresholds:

- 0.85 and above: likely correct
- 0.60 to 0.84: needs review
- below 0.60: high risk / likely incorrect

## Field-Level Human Review

Each extracted field should allow the officer to confirm or edit it.

A field can have this status:

"extracted" | "edited" | "confirmed" | "empty"

When an officer changes an OCR value, mark the field as "edited."

When an officer approves a value, mark it as "confirmed."

## Review Layout

The OCR review screen should use a two-column layout:

Left side:

- Uploaded document preview
- Raw OCR text

Right side:

- Extracted editable fields
- Confidence indicators
- Confirm button

The officer should be able to compare the scanned document against the extracted fields.

## Sample Documents

Use the generated sample Certificate of Occupancy Form 8 PDFs for testing.

Test with:

- Empty Form 8 PDF
- Filled sample Form 8 PDF
- Image exports of Page 1 and Page 2

For OCR testing, convert the PDF pages to PNG or JPG first if using browser OCR.

## Page Classification

The system should detect whether OCR text belongs to:

- Page 1 / Part I
- Page 2 / Part II

Detection rules:

- If text contains "PART I" or "Certificate of Occupancy", classify as Part I.
- If text contains "PART II" or "Verification and Statement of the District Authority", classify as Part II.

The extracted fields should combine both pages into one record.

## Export Record

Allow officer to export a confirmed record as JSON.

Optional:
Allow export as CSV.

The exported record should include:

- recordNumber
- source
- status
- extracted fields
- raw OCR text
- createdAt
- updatedAt

## Local Audit Log

Store a simple local audit log in localStorage.

Actions to log:

- document_uploaded
- ocr_started
- ocr_completed
- field_edited
- record_confirmed
- record_updated
- record_deleted

Audit log fields:

- id
- action
- recordId
- timestamp
- details

Use:

```txt
React
TypeScript
Tailwind CSS
Vite
Tesseract.js
Lucide React
```

Suggested packages:

```bash
npm create vite@latest land-record-dashboard -- --template react-ts
cd land-record-dashboard
npm install
npm install tesseract.js lucide-react
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

---

## 5. Design Direction

Minimalistic black, white, and gray.

No bright colors.

Use:

- White background
- Black text
- Gray borders
- Light gray cards
- Rounded corners
- Simple table
- Clean form inputs
- Small labels
- Professional spacing

Tailwind style examples:

```tsx
className = "min-h-screen bg-white text-black";
className = "border border-gray-200 rounded-xl bg-white shadow-sm";
className = "text-sm text-gray-500";
className = "bg-black text-white hover:bg-gray-800";
className =
  "border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black";
```

---

## 6. Application Pages

Use React Router or simple state-based routing.

Recommended routes:

```txt
/
Dashboard

/upload
Upload + OCR Review

/new
Manual Certificate Template

/records/:id
Record Detail / Edit
```

If avoiding React Router for simplicity, use a single-page app with internal view state:

```ts
type View = "dashboard" | "upload" | "manual" | "detail";
```

---

## 7. Data Model

Create a file:

```txt
src/types/certificate.ts
```

Add:

```ts
export type RecordSource = "ocr_upload" | "manual_entry";

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
}

export interface CertificateRecord {
  id: string;
  recordNumber: string;
  source: RecordSource;
  status: ReviewStatus;
  ocrStatus: OcrStatus;

  fields: CertificateFields;

  rawOcrText?: string;
  uploadedFileName?: string;
  uploadedFileType?: string;
  uploadedFileDataUrl?: string;

  createdAt: string;
  updatedAt: string;
}
```

---

## 8. Default Empty Fields

Create:

```txt
src/utils/defaultCertificateFields.ts
```

```ts
import { CertificateFields } from "../types/certificate";

export const emptyCertificateFields: CertificateFields = {
  applicantName: "",
  applicantAddress: "",
  landDescription: "",
  landLocation: "",
  customaryTenureSince: "",

  alkaliName: "",
  chiefName: "",
  districtAuthority: "",
  localGovernmentOfficer: "",
  areaCouncil: "",

  declarationApplicantName: "",
  labSecretaryDecision: "",

  districtVerificationName: "",
  districtVerificationLocation: "",
  districtVerificationResult: "",
  chairmanName: "",

  certificateDateAlkali: "",
  certificateDateChief: "",
  localOfficerDate: "",
  districtVerificationDate: "",

  notes: "",
};
```

---

## 9. Local Storage Service

Create:

```txt
src/services/recordStorage.ts
```

```ts
import { CertificateRecord } from "../types/certificate";

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
```

---

## 10. OCR Service

Use Tesseract.js.

Create:

```txt
src/services/ocrService.ts
```

```ts
import Tesseract from "tesseract.js";

export async function runOcr(file: File): Promise<string> {
  const result = await Tesseract.recognize(file, "eng", {
    logger: (message) => {
      console.log(message);
    },
  });

  return result.data.text;
}
```

For PDF support:

Tesseract.js works best with images. For MVP:

- Accept PNG/JPG first.
- For PDF, show message: “PDF OCR support will be added next. Please upload scanned page images for now.”

Optional later:

- Use `pdfjs-dist` to render PDF pages into images before OCR.
- OCR each rendered page image.
- Combine text.

---

## 11. OCR Field Extraction

Create simple regex/rule-based extraction first.

Create:

```txt
src/services/extractCertificateFields.ts
```

```ts
import { CertificateFields } from "../types/certificate";
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
```

This extraction will not be perfect. That is fine. The whole point is that a human reviewer can correct it.

---

## 12. File to Data URL Helper

Create:

```txt
src/utils/fileToDataUrl.ts
```

```ts
export function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
      } else {
        reject(new Error("Could not convert file to data URL."));
      }
    };

    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}
```

---

## 13. Record Number Helper

Create:

```txt
src/utils/createRecordNumber.ts
```

```ts
export function createRecordNumber() {
  const year = new Date().getFullYear();
  const random = Math.floor(10000 + Math.random() * 90000);
  return `COO-${year}-${random}`;
}
```

---

## 14. Component Structure

Recommended file tree:

```txt
src/
  components/
    AppShell.tsx
    Header.tsx
    Sidebar.tsx
    StatCard.tsx
    RecordsTable.tsx
    CertificateForm.tsx
    FilePreview.tsx
    StatusBadge.tsx

  pages/
    DashboardPage.tsx
    UploadOcrPage.tsx
    ManualEntryPage.tsx
    RecordDetailPage.tsx

  services/
    ocrService.ts
    recordStorage.ts
    extractCertificateFields.ts

  types/
    certificate.ts

  utils/
    defaultCertificateFields.ts
    createRecordNumber.ts
    fileToDataUrl.ts

  App.tsx
  main.tsx
  index.css
```

---

## 15. Main Layout

### `src/components/AppShell.tsx`

```tsx
import { ReactNode } from "react";

interface AppShellProps {
  children: ReactNode;
  currentView: string;
  onNavigate: (view: string) => void;
}

export function AppShell({ children, currentView, onNavigate }: AppShellProps) {
  const navItems = [
    { id: "dashboard", label: "Dashboard" },
    { id: "upload", label: "Upload + OCR" },
    { id: "manual", label: "Manual Template" },
  ];

  return (
    <div className="min-h-screen bg-white text-black">
      <div className="border-b border-gray-200 px-6 py-4">
        <h1 className="text-xl font-semibold tracking-tight">
          Certificate of Occupancy Records
        </h1>
        <p className="text-sm text-gray-500">
          Demo land-record intake dashboard for Form 8 digitization.
        </p>
      </div>

      <div className="flex min-h-[calc(100vh-73px)]">
        <aside className="w-64 border-r border-gray-200 p-4">
          <nav className="space-y-2">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`w-full rounded-lg px-3 py-2 text-left text-sm ${
                  currentView === item.id
                    ? "bg-black text-white"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>

          <div className="mt-8 rounded-xl border border-gray-200 bg-gray-50 p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
              Prototype Notice
            </p>
            <p className="mt-2 text-sm text-gray-600">
              Local browser storage only. No official government records.
            </p>
          </div>
        </aside>

        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
```

---

## 16. Certificate Form Component

### `src/components/CertificateForm.tsx`

```tsx
import { CertificateFields } from "../types/certificate";

interface CertificateFormProps {
  fields: CertificateFields;
  onChange: (fields: CertificateFields) => void;
}

export function CertificateForm({ fields, onChange }: CertificateFormProps) {
  function updateField(key: keyof CertificateFields, value: string) {
    onChange({
      ...fields,
      [key]: value,
    });
  }

  const inputClass =
    "w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black";

  const labelClass =
    "mb-1 block text-xs font-medium uppercase tracking-wide text-gray-500";

  return (
    <div className="space-y-8">
      <section>
        <h3 className="mb-4 text-base font-semibold">Applicant Information</h3>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className={labelClass}>Applicant Name</label>
            <input
              className={inputClass}
              value={fields.applicantName}
              onChange={(e) => updateField("applicantName", e.target.value)}
            />
          </div>

          <div>
            <label className={labelClass}>Applicant Address / Place</label>
            <input
              className={inputClass}
              value={fields.applicantAddress}
              onChange={(e) => updateField("applicantAddress", e.target.value)}
            />
          </div>
        </div>
      </section>

      <section>
        <h3 className="mb-4 text-base font-semibold">Land Details</h3>
        <div className="grid gap-4">
          <div>
            <label className={labelClass}>Land Location</label>
            <input
              className={inputClass}
              value={fields.landLocation}
              onChange={(e) => updateField("landLocation", e.target.value)}
            />
          </div>

          <div>
            <label className={labelClass}>Land Description</label>
            <textarea
              className={`${inputClass} min-h-28`}
              value={fields.landDescription}
              onChange={(e) => updateField("landDescription", e.target.value)}
            />
          </div>

          <div>
            <label className={labelClass}>Customary Tenure Since</label>
            <input
              className={inputClass}
              value={fields.customaryTenureSince}
              onChange={(e) =>
                updateField("customaryTenureSince", e.target.value)
              }
            />
          </div>
        </div>
      </section>

      <section>
        <h3 className="mb-4 text-base font-semibold">
          Local Authority Certification
        </h3>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className={labelClass}>Alkali Name</label>
            <input
              className={inputClass}
              value={fields.alkaliName}
              onChange={(e) => updateField("alkaliName", e.target.value)}
            />
          </div>

          <div>
            <label className={labelClass}>Chief Name</label>
            <input
              className={inputClass}
              value={fields.chiefName}
              onChange={(e) => updateField("chiefName", e.target.value)}
            />
          </div>

          <div>
            <label className={labelClass}>District Authority</label>
            <input
              className={inputClass}
              value={fields.districtAuthority}
              onChange={(e) => updateField("districtAuthority", e.target.value)}
            />
          </div>

          <div>
            <label className={labelClass}>
              Local Government Officer / Clerk
            </label>
            <input
              className={inputClass}
              value={fields.localGovernmentOfficer}
              onChange={(e) =>
                updateField("localGovernmentOfficer", e.target.value)
              }
            />
          </div>

          <div>
            <label className={labelClass}>
              Area Council / Municipal Council
            </label>
            <input
              className={inputClass}
              value={fields.areaCouncil}
              onChange={(e) => updateField("areaCouncil", e.target.value)}
            />
          </div>
        </div>
      </section>

      <section>
        <h3 className="mb-4 text-base font-semibold">Review + Verification</h3>
        <div className="grid gap-4">
          <div>
            <label className={labelClass}>Declaration Applicant Name</label>
            <input
              className={inputClass}
              value={fields.declarationApplicantName}
              onChange={(e) =>
                updateField("declarationApplicantName", e.target.value)
              }
            />
          </div>

          <div>
            <label className={labelClass}>LAB Secretary Decision</label>
            <textarea
              className={`${inputClass} min-h-24`}
              value={fields.labSecretaryDecision}
              onChange={(e) =>
                updateField("labSecretaryDecision", e.target.value)
              }
            />
          </div>

          <div>
            <label className={labelClass}>District Verification Result</label>
            <input
              className={inputClass}
              value={fields.districtVerificationResult}
              onChange={(e) =>
                updateField("districtVerificationResult", e.target.value)
              }
            />
          </div>

          <div>
            <label className={labelClass}>Chairman Name</label>
            <input
              className={inputClass}
              value={fields.chairmanName}
              onChange={(e) => updateField("chairmanName", e.target.value)}
            />
          </div>

          <div>
            <label className={labelClass}>Officer Notes</label>
            <textarea
              className={`${inputClass} min-h-24`}
              value={fields.notes}
              onChange={(e) => updateField("notes", e.target.value)}
            />
          </div>
        </div>
      </section>
    </div>
  );
}
```

---

## 17. Upload + OCR Page

### `src/pages/UploadOcrPage.tsx`

```tsx
import { useState } from "react";
import { runOcr } from "../services/ocrService";
import { extractCertificateFields } from "../services/extractCertificateFields";
import { addRecord } from "../services/recordStorage";
import { CertificateFields } from "../types/certificate";
import { emptyCertificateFields } from "../utils/defaultCertificateFields";
import { createRecordNumber } from "../utils/createRecordNumber";
import { fileToDataUrl } from "../utils/fileToDataUrl";
import { CertificateForm } from "../components/CertificateForm";

interface UploadOcrPageProps {
  onSaved: () => void;
}

export function UploadOcrPage({ onSaved }: UploadOcrPageProps) {
  const [file, setFile] = useState<File | null>(null);
  const [fileDataUrl, setFileDataUrl] = useState("");
  const [rawText, setRawText] = useState("");
  const [fields, setFields] = useState<CertificateFields>(
    emptyCertificateFields,
  );
  const [isProcessing, setIsProcessing] = useState(false);
  const [hasExtracted, setHasExtracted] = useState(false);

  async function handleFileChange(selectedFile: File | null) {
    if (!selectedFile) return;

    setFile(selectedFile);
    const dataUrl = await fileToDataUrl(selectedFile);
    setFileDataUrl(dataUrl);
  }

  async function handleRunOcr() {
    if (!file) return;

    if (file.type === "application/pdf") {
      alert(
        "For this MVP, please upload a PNG or JPG image. PDF OCR can be added later using pdfjs-dist.",
      );
      return;
    }

    setIsProcessing(true);

    try {
      const text = await runOcr(file);
      const extracted = extractCertificateFields(text);

      setRawText(text);
      setFields(extracted);
      setHasExtracted(true);
    } catch (error) {
      console.error(error);
      alert("OCR failed. Please try a clearer image.");
    } finally {
      setIsProcessing(false);
    }
  }

  function handleConfirmRecord() {
    const now = new Date().toISOString();

    addRecord({
      id: crypto.randomUUID(),
      recordNumber: createRecordNumber(),
      source: "ocr_upload",
      status: "confirmed",
      ocrStatus: "completed",
      fields,
      rawOcrText: rawText,
      uploadedFileName: file?.name,
      uploadedFileType: file?.type,
      uploadedFileDataUrl: fileDataUrl,
      createdAt: now,
      updatedAt: now,
    });

    onSaved();
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">
          Upload Certificate + OCR
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          Upload a scanned Certificate of Occupancy image, run OCR, then review
          and correct extracted fields.
        </p>
      </div>

      <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
        <p className="text-sm text-gray-700">
          OCR results are not final. A human officer must review and confirm
          every extracted field before saving.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[420px_1fr]">
        <div className="space-y-4">
          <div className="rounded-xl border border-gray-200 bg-white p-4">
            <label className="mb-2 block text-sm font-medium">
              Upload Document Image
            </label>
            <input
              type="file"
              accept="image/png,image/jpeg,application/pdf"
              onChange={(e) => handleFileChange(e.target.files?.[0] ?? null)}
              className="block w-full text-sm text-gray-600"
            />

            <button
              onClick={handleRunOcr}
              disabled={!file || isProcessing}
              className="mt-4 rounded-lg bg-black px-4 py-2 text-sm font-medium text-white disabled:bg-gray-300"
            >
              {isProcessing ? "Running OCR..." : "Run OCR"}
            </button>
          </div>

          {fileDataUrl && (
            <div className="rounded-xl border border-gray-200 bg-white p-4">
              <h3 className="mb-3 text-sm font-semibold">Document Preview</h3>
              {file?.type === "application/pdf" ? (
                <div className="rounded-lg border border-gray-200 p-4 text-sm text-gray-500">
                  PDF selected. Preview/OCR rendering can be added with
                  pdfjs-dist.
                </div>
              ) : (
                <img
                  src={fileDataUrl}
                  alt="Uploaded certificate preview"
                  className="max-h-[520px] w-full rounded-lg border border-gray-200 object-contain"
                />
              )}
            </div>
          )}

          {rawText && (
            <div className="rounded-xl border border-gray-200 bg-white p-4">
              <h3 className="mb-3 text-sm font-semibold">Raw OCR Text</h3>
              <pre className="max-h-80 overflow-auto whitespace-pre-wrap rounded-lg bg-gray-50 p-3 text-xs text-gray-700">
                {rawText}
              </pre>
            </div>
          )}
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Human Review Fields</h3>
              <p className="text-sm text-gray-500">
                Correct any OCR mistakes before confirming this record.
              </p>
            </div>

            <button
              onClick={handleConfirmRecord}
              disabled={!hasExtracted}
              className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white disabled:bg-gray-300"
            >
              Confirm Record
            </button>
          </div>

          <CertificateForm fields={fields} onChange={setFields} />
        </div>
      </div>
    </div>
  );
}
```

---

## 18. Manual Entry Page

### `src/pages/ManualEntryPage.tsx`

```tsx
import { useState } from "react";
import { CertificateForm } from "../components/CertificateForm";
import { addRecord } from "../services/recordStorage";
import { CertificateFields } from "../types/certificate";
import { emptyCertificateFields } from "../utils/defaultCertificateFields";
import { createRecordNumber } from "../utils/createRecordNumber";

interface ManualEntryPageProps {
  onSaved: () => void;
}

export function ManualEntryPage({ onSaved }: ManualEntryPageProps) {
  const [fields, setFields] = useState<CertificateFields>(
    emptyCertificateFields,
  );

  function saveManualRecord(status: "manual_draft" | "confirmed") {
    const now = new Date().toISOString();

    addRecord({
      id: crypto.randomUUID(),
      recordNumber: createRecordNumber(),
      source: "manual_entry",
      status,
      ocrStatus: "not_started",
      fields,
      createdAt: now,
      updatedAt: now,
    });

    onSaved();
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">
          Manual Certificate Template
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          Fill in a Certificate of Occupancy record manually when OCR is not
          available.
        </p>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-5">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">Blank Form 8 Record</h3>
            <p className="text-sm text-gray-500">
              Enter the certificate details and save as draft or confirmed.
            </p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => saveManualRecord("manual_draft")}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium"
            >
              Save Draft
            </button>

            <button
              onClick={() => saveManualRecord("confirmed")}
              className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white"
            >
              Confirm Record
            </button>
          </div>
        </div>

        <CertificateForm fields={fields} onChange={setFields} />
      </div>
    </div>
  );
}
```

---

## 19. Dashboard Page

### `src/pages/DashboardPage.tsx`

```tsx
import { CertificateRecord } from "../types/certificate";

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

  const statCards = [
    { label: "Total Records", value: records.length },
    { label: "Confirmed", value: confirmed },
    { label: "Needs Review", value: needsReview },
    { label: "Manual Entries", value: manual },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">
          Record Intake Dashboard
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          Local prototype for Certificate of Occupancy digitization.
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
                    className="px-4 py-8 text-center text-gray-500"
                  >
                    No records yet. Upload a certificate or create a manual
                    record.
                  </td>
                </tr>
              ) : (
                records.map((record) => (
                  <tr key={record.id} className="border-b border-gray-100">
                    <td className="px-4 py-3 font-medium">
                      {record.recordNumber}
                    </td>
                    <td className="px-4 py-3">
                      {record.fields.applicantName || "—"}
                    </td>
                    <td className="px-4 py-3">
                      {record.fields.landLocation ||
                        record.fields.applicantAddress ||
                        "—"}
                    </td>
                    <td className="px-4 py-3">
                      {record.source === "ocr_upload"
                        ? "OCR Upload"
                        : "Manual Entry"}
                    </td>
                    <td className="px-4 py-3">
                      <span className="rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-700">
                        {record.status.replaceAll("_", " ")}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {new Date(record.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => onOpenRecord(record.id)}
                        className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm hover:bg-gray-50"
                      >
                        View/Edit
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
```

---

## 20. Record Detail Page

### `src/pages/RecordDetailPage.tsx`

```tsx
import { useState } from "react";
import { CertificateRecord } from "../types/certificate";
import { CertificateForm } from "../components/CertificateForm";
import { updateRecord } from "../services/recordStorage";

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

  function saveChanges() {
    updateRecord({
      ...draft,
      updatedAt: new Date().toISOString(),
    });

    onSaved();
  }

  function confirmRecord() {
    updateRecord({
      ...draft,
      status: "confirmed",
      updatedAt: new Date().toISOString(),
    });

    onSaved();
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <button
            onClick={onBack}
            className="mb-3 text-sm text-gray-500 hover:text-black"
          >
            ← Back to dashboard
          </button>
          <h2 className="text-2xl font-semibold tracking-tight">
            {draft.recordNumber}
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Source:{" "}
            {draft.source === "ocr_upload" ? "OCR Upload" : "Manual Entry"} ·
            Status: {draft.status.replaceAll("_", " ")}
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={saveChanges}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium"
          >
            Save Changes
          </button>

          <button
            onClick={confirmRecord}
            className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white"
          >
            Confirm
          </button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[420px_1fr]">
        <div className="space-y-4">
          {draft.uploadedFileDataUrl && (
            <div className="rounded-xl border border-gray-200 bg-white p-4">
              <h3 className="mb-3 text-sm font-semibold">Uploaded Document</h3>
              {draft.uploadedFileType === "application/pdf" ? (
                <p className="text-sm text-gray-500">
                  PDF preview not implemented in MVP.
                </p>
              ) : (
                <img
                  src={draft.uploadedFileDataUrl}
                  alt="Uploaded document"
                  className="max-h-[520px] w-full rounded-lg border border-gray-200 object-contain"
                />
              )}
            </div>
          )}

          {draft.rawOcrText && (
            <div className="rounded-xl border border-gray-200 bg-white p-4">
              <h3 className="mb-3 text-sm font-semibold">Raw OCR Text</h3>
              <pre className="max-h-80 overflow-auto whitespace-pre-wrap rounded-lg bg-gray-50 p-3 text-xs text-gray-700">
                {draft.rawOcrText}
              </pre>
            </div>
          )}
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <CertificateForm
            fields={draft.fields}
            onChange={(fields) => setDraft({ ...draft, fields })}
          />
        </div>
      </div>
    </div>
  );
}
```

---

## 21. App State

### `src/App.tsx`

```tsx
import { useEffect, useState } from "react";
import { AppShell } from "./components/AppShell";
import { DashboardPage } from "./pages/DashboardPage";
import { UploadOcrPage } from "./pages/UploadOcrPage";
import { ManualEntryPage } from "./pages/ManualEntryPage";
import { RecordDetailPage } from "./pages/RecordDetailPage";
import { CertificateRecord } from "./types/certificate";
import { getRecords } from "./services/recordStorage";

type View = "dashboard" | "upload" | "manual" | "detail";

function App() {
  const [view, setView] = useState<View>("dashboard");
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

  const selectedRecord = records.find(
    (record) => record.id === selectedRecordId,
  );

  return (
    <AppShell
      currentView={view}
      onNavigate={(nextView) => setView(nextView as View)}
    >
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
    </AppShell>
  );
}

export default App;
```

---

## 22. Tailwind Setup

### `tailwind.config.js`

```js
/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {},
  },
  plugins: [],
};
```

### `src/index.css`

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

* {
  box-sizing: border-box;
}

body {
  margin: 0;
  font-family:
    Inter,
    ui-sans-serif,
    system-ui,
    -apple-system,
    BlinkMacSystemFont,
    "Segoe UI",
    sans-serif;
  background: white;
  color: black;
}
```

---

## 23. Acceptance Criteria

The Claude agent should implement until these are true:

### Dashboard

- User can see summary cards.
- User can see a records table.
- Records persist after page refresh.

### OCR Upload

- User can upload JPG/PNG.
- User can preview uploaded image.
- User can run OCR with Tesseract.js.
- User can see raw OCR text.
- Extracted fields appear in editable form inputs.
- User can correct fields manually.
- User can confirm and save record.

### Manual Template

- User can open blank Certificate of Occupancy template.
- User can fill in fields manually.
- User can save as draft.
- User can confirm the record.

### Record Detail

- User can open existing record.
- User can view/edit fields.
- User can see uploaded document preview if available.
- User can see raw OCR text if available.
- User can save edits.
- User can confirm record.

### Storage

- No backend.
- No external database.
- Use localStorage only.
- Data persists after refresh.

### UI

- Black, white, gray only.
- Clean government-style dashboard.
- Responsive enough for laptop screen.
- No clutter.

---

## 24. Future Upgrade Ideas

Do not build these in MVP unless asked:

1. External database using PostgreSQL + PostGIS.
2. Secure authentication and role-based access.
3. PDF OCR using `pdfjs-dist`.
4. Multi-page OCR.
5. Document confidence scoring.
6. AI extraction using an LLM.
7. Export record as PDF.
8. Import official Form 8 PDF.
9. Parcel map drawing.
10. Conflict detection with PostGIS.
11. Audit log.
12. Approval workflow roles.
13. Secure private document storage.

---

## 25. Important Product Notes

This MVP should clearly show:

- OCR is only a helper.
- Human confirmation is required.
- The system is not making legal ownership decisions.
- The tool is only digitizing and structuring a Certificate of Occupancy record.
- All sample/demo data must be labeled as non-official.

Use this copy somewhere in the interface:

```txt
Demo system for digitizing Certificate of Occupancy records.
OCR output requires human review and confirmation.
This prototype does not determine legal ownership.
```

---

## 26. Final Build Instruction for Claude Agent

Build a React + TypeScript + Tailwind dashboard implementing the Certificate of Occupancy OCR workflow.

Use no backend and no external database.

Use localStorage for record persistence.

Use Tesseract.js for OCR on uploaded images.

Implement these views:

1. Dashboard
2. Upload + OCR Review
3. Manual Template Entry
4. Record Detail / Edit

Keep the UI minimalistic with black, white, and gray styling.

Focus on making the workflow polished:

Upload document → OCR → extracted fields → human correction → confirm/save → dashboard record table.

Manual entry should use the same field template and save into the same local record list.
