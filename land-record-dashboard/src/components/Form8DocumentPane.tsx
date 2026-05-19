import type { CSSProperties } from "react";
import type { CertificateFields } from "../types/certificate";
import { SignaturePad } from "./SignaturePad";

interface Props {
  fields: CertificateFields;
  onChange?: (f: CertificateFields) => void;
}

const MONO = "'Courier New', Courier, monospace";
const HL = "#e8f4ff";

const inp: CSSProperties = {
  border: "none",
  borderBottom: "1px dotted #555",
  background: HL,
  outline: "none",
  fontFamily: MONO,
  fontSize: 12,
  padding: "1px 4px",
  verticalAlign: "bottom",
  color: "#000",
  borderRadius: 2,
  minWidth: 0,
};

function FF({ v, onCh, w }: { v: string; onCh?: (s: string) => void; w?: string }) {
  return (
    <input
      type="text"
      value={v}
      readOnly={!onCh}
      onChange={(e) => onCh?.(e.target.value)}
      style={{ ...inp, flex: 1, width: w ?? undefined }}
    />
  );
}

function BL({ v, onCh }: { v: string; onCh?: (s: string) => void }) {
  return (
    <input
      type="text"
      value={v}
      readOnly={!onCh}
      onChange={(e) => onCh?.(e.target.value)}
      style={{ ...inp, display: "block", width: "100%", boxSizing: "border-box", marginBottom: 5 }}
    />
  );
}

function Row({ label, v, onCh, mt = 0 }: { label: string; v: string; onCh?: (s: string) => void; mt?: number }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 4, marginTop: mt, marginBottom: 4 }}>
      <span style={{ whiteSpace: "nowrap", fontSize: 12 }}>{label}</span>
      <FF v={v} onCh={onCh} />
    </div>
  );
}

const SECTION: CSSProperties = {
  fontFamily: MONO,
  fontSize: 12,
  lineHeight: 1.7,
  color: "#000",
  background: "#fff",
  padding: "28px 24px",
};

export function Form8DocumentPane({ fields, onChange }: Props) {
  function up(k: keyof CertificateFields): (v: string) => void {
    return (v) => onChange?.({ ...fields, [k]: v });
  }
  const ro = !onChange;

  const descLines = (fields.landDescription ?? "").split("\n");
  while (descLines.length < 4) descLines.push("");

  function updateDesc(i: number, v: string) {
    const lines = (fields.landDescription ?? "").split("\n");
    while (lines.length < 4) lines.push("");
    lines[i] = v;
    onChange?.({ ...fields, landDescription: lines.join("\n") });
  }

  return (
    <div style={{ fontFamily: MONO, fontSize: 12 }}>

      {/* ── PART I ── */}
      <div style={SECTION}>
        <div style={{ textAlign: "center", fontWeight: "bold", letterSpacing: "0.06em", marginBottom: 6 }}>
          FORM 8
        </div>
        <div style={{ textAlign: "center", fontWeight: "bold", letterSpacing: "0.04em", marginBottom: 16 }}>
          CERTIFICATE OF OCCUPANCY OF LAND HELD<br />
          UNDER CUSTOMARY TENANCY OR YEAR TO YEAR<br />
          <u>TENANCY</u>
        </div>

        <div style={{ marginBottom: 10 }}><u><strong>PART I</strong></u></div>

        <div style={{ marginBottom: 4 }}>We, the undersigned, have checked and hereby certify that</div>
        <Row label="Mr/Mrs/Miss" v={fields.applicantName} onCh={up("applicantName")} />
        <Row label="of" v={fields.applicantAddress} onCh={up("applicantAddress")} />
        <div style={{ marginBottom: 4 }}>has been holding the land described as follows:</div>

        {descLines.slice(0, 4).map((line, i) => (
          <BL key={i} v={line} onCh={onChange ? (v) => updateDesc(i, v) : undefined} />
        ))}

        <div style={{ marginBottom: 3 }}>and as shown in the location plan attached to this certificate</div>
        <Row label="under customary tenure since" v={fields.customaryTenureSince} onCh={up("customaryTenureSince")} />
        <div style={{ textAlign: "center", fontWeight: "bold", marginBottom: 14, fontSize: 11 }}>
          (state the date or No. of years)
        </div>

        {/* Alkali | Chief */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
          <div>
            <Row label="Date:" v={fields.certificateDateAlkali} onCh={up("certificateDateAlkali")} />
            <div style={{ marginTop: 10 }}>Signature and</div>
            <Row label="Name of Alkali of" v={fields.alkaliName} onCh={up("alkaliName")} />
            <div style={{ marginTop: 8 }}>
              <SignaturePad value={fields.alkaliSignature ?? ""} onChange={up("alkaliSignature")} readOnly={ro} width={160} height={55} />
            </div>
          </div>
          <div>
            <Row label="Date:" v={fields.certificateDateChief} onCh={up("certificateDateChief")} />
            <div style={{ marginTop: 10 }}>Signature and</div>
            <Row label="Name of Chief of" v={fields.chiefName} onCh={up("chiefName")} />
            <div style={{ marginTop: 8 }}>
              <SignaturePad value={fields.chiefSignature ?? ""} onChange={up("chiefSignature")} readOnly={ro} width={160} height={55} />
            </div>
          </div>
        </div>

        {/* District Authority + Local Gov */}
        <div style={{ paddingLeft: "35%", marginBottom: 16 }}>
          <div style={{ borderBottom: "1px dotted #555", height: 16, marginBottom: 2 }} />
          <div style={{ marginBottom: 12 }}>Seal of District Authority</div>
          <Row label="Date:" v={fields.localOfficerDate} onCh={up("localOfficerDate")} />
          <div style={{ marginTop: 8 }}>
            <SignaturePad value={fields.localOfficerSignature ?? ""} onChange={up("localOfficerSignature")} readOnly={ro} width={180} height={55} />
          </div>
          <div>Signature of Local Government Officer of</div>
          <div>Area Council/Clerk of Municipal</div>
          <Row label="Council of" v={fields.areaCouncil} onCh={up("areaCouncil")} />
          <div style={{ marginTop: 4 }}>Seal of Area Council or Municipal Council</div>
          <Row label="Date:" v={fields.localOfficerDate} onCh={up("localOfficerDate")} mt={4} />
        </div>

        {/* Declaration | LAB Secretary */}
        <div style={{ border: "1px solid #000", display: "grid", gridTemplateColumns: "1fr 1fr", fontSize: 11 }}>
          <div style={{ borderRight: "1px solid #000", padding: "8px 10px" }}>
            <strong>Declaration:</strong><br />
            I <FF v={fields.declarationApplicantName} onCh={up("declarationApplicantName")} w="90px" />{" "}
            declare that I am the owner of the land and to the best of my knowledge the information I furnished above is correct.
            (If upon investigation, it is found that information furnished in the application is incorrect, either the lease will not be issued or if issued it will be withdrawn).<br />
            <div style={{ marginTop: 8 }}>
              <div style={{ fontSize: 10, marginBottom: 2 }}>(Sgd):</div>
              <SignaturePad value={fields.declarationSignature ?? ""} onChange={up("declarationSignature")} readOnly={ro} width={140} height={48} />
            </div>
            <Row label="Date:" v={fields.localOfficerDate} onCh={up("localOfficerDate")} mt={4} />
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ borderBottom: "1px solid #000", padding: "8px 10px", flex: 1 }}>
              The ownership of the land and the particulars given in this application have been checked and found correct.
              <div style={{ borderBottom: "1px solid #000", marginTop: 10 }} />
            </div>
            <div style={{ borderBottom: "1px solid #000", padding: "8px 10px", flex: 1 }}>
              The ownership of the land and the particulars given in this application are doubtful. The application is to be referred to the{" "}
              <FF v={fields.labSecretaryDecision} onCh={up("labSecretaryDecision")} w="60px" />{" "}
              District Authority for verification.
              <div style={{ borderBottom: "1px solid #000", marginTop: 10 }} />
            </div>
            <div style={{ padding: "8px 10px" }}>LAB Secretary</div>
          </div>
        </div>
      </div>

      {/* Page break */}
      <div style={{ borderTop: "2px dashed #d1d5db", margin: "0", position: "relative", textAlign: "center" }}>
        <span style={{
          position: "absolute", top: -9, left: "50%", transform: "translateX(-50%)",
          background: "#f3f4f6", padding: "0 10px", fontSize: 10, color: "#9ca3af",
          fontFamily: "system-ui, sans-serif",
        }}>PART II</span>
      </div>

      {/* ── PART II ── */}
      <div style={SECTION}>
        <div style={{ marginBottom: 10 }}><u><strong>PART II</strong></u></div>
        <div style={{ textAlign: "center", marginBottom: 12 }}>(For office use only)</div>
        <div style={{ marginBottom: 14 }}><u><strong>Verification and Statement of the District Authority</strong></u></div>

        <Row label="I, on behalf of the" v={fields.districtVerificationName} onCh={up("districtVerificationName")} />
        <div style={{ textAlign: "center", fontWeight: "bold", marginBottom: 12, fontSize: 11 }}>(name of the District) District Authority</div>

        <div style={{ marginBottom: 4 }}>have verified the ownership of the above mentioned land at</div>
        <BL v={fields.districtVerificationLocation} onCh={up("districtVerificationLocation")} />

        <Row label="and found that the applicant, Mr/Mrs/Miss" v={fields.applicantName} onCh={up("applicantName")} />
        <BL v={fields.applicantAddress} onCh={up("applicantAddress")} />

        <div style={{ marginBottom: 4 }}>
          <strong><u>is</u></strong> the rightful owner / <strong><u>is not</u></strong> the rightful owner of the land.
        </div>
        <div style={{ marginBottom: 28, color: "#555", fontSize: 11 }}>(delete whichever is not applicable)</div>

        <Row label="Date:" v={fields.districtVerificationDate} onCh={up("districtVerificationDate")} />

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginTop: 20 }}>
          <div>
            <div>Seal of the District Authority</div>
            <div style={{
              width: 70, height: 70, borderRadius: "50%",
              border: "1.5px dashed #bbb", display: "flex",
              alignItems: "center", justifyContent: "center",
              fontSize: 8, color: "#bbb", textAlign: "center",
              lineHeight: 1.3, marginTop: 10,
            }}>
              OFFICIAL<br />SEAL
            </div>
          </div>
          <div>
            <div>Signature and Name of Chairman of</div>
            <div style={{ marginBottom: 10 }}>District Authority</div>
            <SignaturePad value={fields.chairmanSignature ?? ""} onChange={up("chairmanSignature")} readOnly={ro} width={180} height={60} />
            <BL v={fields.chairmanName} onCh={up("chairmanName")} />
            <BL v={fields.districtVerificationResult} onCh={up("districtVerificationResult")} />
          </div>
        </div>
      </div>

    </div>
  );
}
