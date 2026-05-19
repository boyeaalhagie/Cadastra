import type { CSSProperties, ReactNode } from "react";
import type { CertificateFields } from "../types/certificate";
import { SignaturePad } from "./SignaturePad";

interface Props {
  fields: CertificateFields;
  onChange?: (f: CertificateFields) => void;
}

/* ── shared styles ── */
const MONO = "'Courier New', Courier, monospace";
const FONT_SIZE = "13px";

const HIGHLIGHT = "#e8f4ff";

const baseInput: CSSProperties = {
  border: "none",
  borderBottom: "1px dotted #555",
  background: HIGHLIGHT,
  outline: "none",
  fontFamily: MONO,
  fontSize: FONT_SIZE,
  padding: "1px 4px",
  verticalAlign: "bottom",
  color: "#000",
  borderRadius: 2,
};

/* Inline fill field — sits inside a sentence */
function FF({
  v,
  onCh,
  w,
  flex,
}: {
  v: string;
  onCh?: (s: string) => void;
  w?: string;
  flex?: boolean;
}) {
  return (
    <input
      type="text"
      value={v}
      readOnly={!onCh}
      onChange={(e) => onCh?.(e.target.value)}
      style={{ ...baseInput, ...(flex ? { flex: 1 } : { width: w ?? "180px" }) }}
    />
  );
}

/* Full-width block line (replaces a row of dots) */
function BL({
  v,
  onCh,
  mb = 6,
}: {
  v: string;
  onCh?: (s: string) => void;
  mb?: number;
}) {
  return (
    <input
      type="text"
      value={v}
      readOnly={!onCh}
      onChange={(e) => onCh?.(e.target.value)}
      style={{
        ...baseInput,
        display: "block",
        width: "100%",
        boxSizing: "border-box",
        marginBottom: mb,
        padding: "2px 4px",
      }}
    />
  );
}


/* Section row: label + flex input */
function Row({
  label,
  v,
  onCh,
  mt = 0,
}: {
  label: ReactNode;
  v: string;
  onCh?: (s: string) => void;
  mt?: number;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-end",
        marginTop: mt,
        marginBottom: 5,
      }}
    >
      <span style={{ whiteSpace: "nowrap", marginRight: 5 }}>{label}</span>
      <FF v={v} onCh={onCh} flex />
    </div>
  );
}

/* ── Page wrapper ── */
const PAGE: CSSProperties = {
  fontFamily: MONO,
  fontSize: FONT_SIZE,
  lineHeight: "1.75",
  color: "#000",
  background: "#fff",
  padding: "60px 76px 52px 76px",
  minHeight: "1050px",
  boxSizing: "border-box",
};

/* ─────────────────────────────────────────────────
   Main exported component
───────────────────────────────────────────────── */
export function Form8Document({ fields, onChange }: Props) {
  /* Always returns a function; no-ops when readOnly (onChange undefined) */
  function up(k: keyof CertificateFields): (v: string) => void {
    return (v: string) => onChange?.({ ...fields, [k]: v });
  }

  const ro = !onChange; /* readOnly shorthand */

  /* Land description → 4 individual lines */
  const rawLines = (fields.landDescription ?? "").split("\n");
  while (rawLines.length < 4) rawLines.push("");
  const descLines = rawLines.slice(0, 4);

  function updateDesc(i: number, v: string) {
    const lines = (fields.landDescription ?? "").split("\n");
    while (lines.length < 4) lines.push("");
    lines[i] = v;
    onChange?.({ ...fields, landDescription: lines.join("\n") });
  }

  /* ── PAGE 1 – PART I ── */
  return (
    <div style={{ fontFamily: MONO, fontSize: FONT_SIZE }}>
      <div id="form8-page1" style={PAGE}>
        {/* ▸ Header */}
        <div
          style={{
            textAlign: "center",
            fontWeight: "bold",
            letterSpacing: "0.08em",
            marginBottom: 10,
          }}
        >
          FORM 8
        </div>

        <div
          style={{
            textAlign: "center",
            fontWeight: "bold",
            letterSpacing: "0.05em",
            marginBottom: 28,
          }}
        >
          CERTIFICATE OF OCCUPANCY OF LAND HELD
          <br />
          UNDER CUSTOMARY TENANCY OR YEAR TO YEAR
          <br />
          <u>TENANCY</u>
        </div>

        {/* ▸ PART I */}
        <div style={{ marginBottom: 14 }}>
          <u>
            <strong>PART I</strong>
          </u>
        </div>

        <div style={{ marginBottom: 5 }}>
          We, the undersigned, have checked and hereby certify that
        </div>
        <Row label="Mr/Mrs/Miss" v={fields.applicantName} onCh={up("applicantName")} />
        <Row label="of" v={fields.applicantAddress} onCh={up("applicantAddress")} />
        <div style={{ marginBottom: 6 }}>has been holding the land described as follows:</div>

        {descLines.map((line, i) => (
          <BL
            key={i}
            v={line}
            onCh={onChange ? (v) => updateDesc(i, v) : undefined}
          />
        ))}

        <div style={{ marginBottom: 4 }}>
          and as shown in the location plan attached to this certificate
        </div>
        <Row
          label="under customary tenure since"
          v={fields.customaryTenureSince}
          onCh={up("customaryTenureSince")}
        />
        <div
          style={{
            textAlign: "center",
            fontWeight: "bold",
            marginBottom: 20,
          }}
        >
          (state the date or No. of years)
        </div>

        {/* ▸ Two-column: Alkali | Chief */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 28,
            marginBottom: 20,
          }}
        >
          {/* Left — Alkali */}
          <div>
            <Row
              label="Date:"
              v={fields.certificateDateAlkali}
              onCh={up("certificateDateAlkali")}
            />
            <div style={{ marginTop: 18 }}>Signature and</div>
            <Row
              label="Name of Alkali of"
              v={fields.alkaliName}
              onCh={up("alkaliName")}
            />
            <div style={{ marginTop: 10 }}>
              <SignaturePad
                value={fields.alkaliSignature ?? ""}
                onChange={up("alkaliSignature")}
                readOnly={ro}
                width={240}
                height={75}
              />
            </div>
          </div>
          {/* Right — Chief */}
          <div>
            <Row
              label="Date:"
              v={fields.certificateDateChief}
              onCh={up("certificateDateChief")}
            />
            <div style={{ marginTop: 18 }}>Signature and</div>
            <Row
              label="Name of Chief of"
              v={fields.chiefName}
              onCh={up("chiefName")}
            />
            <div style={{ marginTop: 10 }}>
              <SignaturePad
                value={fields.chiefSignature ?? ""}
                onChange={up("chiefSignature")}
                readOnly={ro}
                width={240}
                height={75}
              />
            </div>
          </div>
        </div>

        {/* ▸ Right-offset: Seal of District Authority + Local Gov Officer */}
        <div style={{ paddingLeft: "44%" }}>
          {/* dotted seal line */}
          <div
            style={{
              borderBottom: "1px dotted #555",
              minWidth: 280,
              height: 18,
              marginBottom: 2,
            }}
          />
          <div style={{ marginBottom: 18 }}>Seal of District Authority</div>

          <Row
            label="Date:"
            v={fields.localOfficerDate}
            onCh={up("localOfficerDate")}
          />
          <div style={{ marginTop: 10, marginBottom: 6 }}>
            <SignaturePad
              value={fields.localOfficerSignature ?? ""}
              onChange={up("localOfficerSignature")}
              readOnly={ro}
              width={280}
              height={75}
            />
          </div>
          <div>Signature of Local Government Officer of</div>
          <div>Area Council/Clerk of Municipal</div>
          <Row
            label="Council of"
            v={fields.areaCouncil}
            onCh={up("areaCouncil")}
          />
          {/* Officer name (below council) */}
          {fields.localGovernmentOfficer || onChange ? (
            <Row
              label="Officer name:"
              v={fields.localGovernmentOfficer}
              onCh={up("localGovernmentOfficer")}
            />
          ) : null}
          <div style={{ marginTop: 4 }}>Seal of Area Council or</div>
          <div>Municipal Council</div>
          <Row
            label="Date:"
            v={fields.localOfficerDate}
            onCh={up("localOfficerDate")}
            mt={4}
          />
        </div>

        {/* ▸ Bottom table: Declaration | LAB Secretary */}
        <div
          style={{
            border: "1px solid #000",
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            marginTop: 24,
            fontSize: "12px",
            lineHeight: "1.6",
          }}
        >
          {/* Left — Declaration */}
          <div style={{ borderRight: "1px solid #000", padding: "10px 12px" }}>
            <div style={{ fontWeight: "bold", marginBottom: 6 }}>Declaration:</div>
            <span>I </span>
            <FF
              v={fields.declarationApplicantName}
              onCh={up("declarationApplicantName")}
              w="120px"
            />
            <span>
              {" "}
              declare that I am the owner of the land and to the best of my
              knowledge the information I furnished above is correct. (If upon
              investigation, it is found that information furnished in the
              application is incorrect, either the lease will not be issued or
              if issued it will be withdrawn).
            </span>
            <div style={{ marginTop: 8, marginBottom: 4 }}>
              <div style={{ fontSize: 11, marginBottom: 2 }}>(Sgd):</div>
              <SignaturePad
                value={fields.declarationSignature ?? ""}
                onChange={up("declarationSignature")}
                readOnly={ro}
                width={200}
                height={60}
              />
            </div>
            <div style={{ display: "flex", alignItems: "flex-end" }}>
              <span style={{ marginRight: 5 }}>Date:</span>
              <FF
                v={fields.localOfficerDate}
                onCh={up("localOfficerDate")}
                flex
              />
            </div>
          </div>

          {/* Right — Three sub-rows */}
          <div style={{ display: "flex", flexDirection: "column" }}>
            {/* Row 1: found correct */}
            <div
              style={{
                borderBottom: "1px solid #000",
                padding: "10px 12px",
                flex: 1,
              }}
            >
              The ownership of the land and the particulars given in this
              application have been checked and found correct.
              <div
                style={{ borderBottom: "1px solid #000", marginTop: 12 }}
              />
            </div>
            {/* Row 2: doubtful */}
            <div
              style={{
                borderBottom: "1px solid #000",
                padding: "10px 12px",
                flex: 1,
              }}
            >
              The ownership of the land and the particulars given in this
              application are doubtful. The application is to be referred to the{" "}
              <FF
                v={fields.labSecretaryDecision}
                onCh={up("labSecretaryDecision")}
                w="80px"
              />{" "}
              District Authority for verification
              <div
                style={{ borderBottom: "1px solid #000", marginTop: 12 }}
              />
            </div>
            {/* Row 3: LAB Secretary */}
            <div style={{ padding: "10px 12px" }}>LAB Secretary</div>
          </div>
        </div>
      </div>

      {/* ── Page break indicator (screen only) ── */}
      <div
        className="no-print"
        style={{
          margin: "32px 0",
          borderTop: "2px dashed #d1d5db",
          position: "relative",
          textAlign: "center",
        }}
      >
        <span
          style={{
            position: "absolute",
            top: -10,
            left: "50%",
            transform: "translateX(-50%)",
            background: "#f3f4f6",
            padding: "0 14px",
            fontSize: "11px",
            color: "#9ca3af",
            fontFamily: "system-ui, sans-serif",
            letterSpacing: "0.05em",
          }}
        >
          PAGE 2 — PART II
        </span>
      </div>

      {/* ── PAGE 2 – PART II ── */}
      <div id="form8-page2" style={PAGE}>
        <div style={{ marginBottom: 14 }}>
          <u>
            <strong>PART II</strong>
          </u>
        </div>

        <div style={{ textAlign: "center", marginBottom: 20 }}>
          (For office use only)
        </div>

        <div style={{ marginBottom: 22 }}>
          <u>
            <strong>Verification and Statement of the District Authority</strong>
          </u>
        </div>

        {/* "I, on behalf of the ... District Authority" */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            marginBottom: 4,
          }}
        >
          <span style={{ whiteSpace: "nowrap", marginRight: 5 }}>
            I, on behalf of the
          </span>
          <FF
            v={fields.districtVerificationName}
            onCh={up("districtVerificationName")}
            flex
          />
          <span style={{ whiteSpace: "nowrap", marginLeft: 5 }}>
            District Authority
          </span>
        </div>
        <div
          style={{
            textAlign: "center",
            fontWeight: "bold",
            marginBottom: 18,
          }}
        >
          (name of the District)
        </div>

        <div style={{ marginBottom: 6 }}>
          have verified the ownership of the above mentioned land at
        </div>
        <BL
          v={fields.districtVerificationLocation}
          onCh={up("districtVerificationLocation")}
          mb={14}
        />

        <Row
          label="and found that the applicant, Mr/Mrs/Miss"
          v={fields.applicantName}
          onCh={up("applicantName")}
        />
        <BL
          v={fields.applicantAddress}
          onCh={up("applicantAddress")}
          mb={14}
        />

        <div style={{ marginBottom: 4 }}>
          <strong>
            <u>is</u>
          </strong>{" "}
          the rightful owner/{" "}
          <strong>
            <u>is not</u>
          </strong>{" "}
          the rightful owner of the land.
        </div>
        <div style={{ marginBottom: 48, color: "#555" }}>
          (delete whichever is not applicable)
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "flex-end",
            marginBottom: 56,
          }}
        >
          <span style={{ marginRight: 5 }}>Date:</span>
          <FF
            v={fields.districtVerificationDate}
            onCh={up("districtVerificationDate")}
            w="220px"
          />
        </div>

        {/* ▸ Seal (left) + Chairman (right) */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 32,
            alignItems: "start",
          }}
        >
          {/* Seal */}
          <div>
            <div>Seal of the</div>
            <div
              style={{
                display: "flex",
                alignItems: "flex-end",
                marginBottom: 18,
              }}
            >
              <span style={{ whiteSpace: "nowrap", marginRight: 5 }}>
                District Authority
              </span>
              <div
                style={{
                  flex: 1,
                  borderBottom: "1px dotted #555",
                  height: 18,
                }}
              />
            </div>
            {/* Circle placeholder */}
            <div
              style={{
                width: 90,
                height: 90,
                borderRadius: "50%",
                border: "1.5px dashed #bbb",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 9,
                color: "#bbb",
                textAlign: "center",
                lineHeight: "1.3",
              }}
            >
              OFFICIAL
              <br />
              SEAL
            </div>
          </div>

          {/* Chairman */}
          <div>
            <div>Signature and Name of Chairman of</div>
            <div style={{ marginBottom: 12 }}>District Authority</div>
            <SignaturePad
              value={fields.chairmanSignature ?? ""}
              onChange={up("chairmanSignature")}
              readOnly={ro}
              width={270}
              height={80}
            />
            <BL v={fields.chairmanName} onCh={up("chairmanName")} mb={6} />
            <BL
              v={fields.districtVerificationResult}
              onCh={up("districtVerificationResult")}
              mb={6}
            />
          </div>
        </div>

      </div>
    </div>
  );
}
