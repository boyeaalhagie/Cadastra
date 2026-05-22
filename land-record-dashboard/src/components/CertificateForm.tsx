import type { CertificateFields } from "../types/certificate";

interface CertificateFormProps {
  fields: CertificateFields;
  onChange: (fields: CertificateFields) => void;
  readOnly?: boolean;
}

export function CertificateForm({ fields, onChange, readOnly = false }: CertificateFormProps) {
  function updateField(key: keyof CertificateFields, value: string) {
    if (readOnly) return;
    onChange({ ...fields, [key]: value });
  }

  const inputClass =
    "w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black disabled:bg-neutral-50 disabled:text-neutral-500";

  const labelClass =
    "mb-1 block text-xs font-medium uppercase tracking-wide text-neutral-500";

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
              disabled={readOnly}
              onChange={(e) => updateField("applicantName", e.target.value)}
            />
          </div>

          <div>
            <label className={labelClass}>Applicant Address / Place</label>
            <input
              className={inputClass}
              value={fields.applicantAddress}
              disabled={readOnly}
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
              disabled={readOnly}
              onChange={(e) => updateField("landLocation", e.target.value)}
            />
          </div>

          <div>
            <label className={labelClass}>Land Description</label>
            <textarea
              className={`${inputClass} min-h-28`}
              value={fields.landDescription}
              disabled={readOnly}
              onChange={(e) => updateField("landDescription", e.target.value)}
            />
          </div>

          <div>
            <label className={labelClass}>Customary Tenure Since</label>
            <input
              className={inputClass}
              value={fields.customaryTenureSince}
              disabled={readOnly}
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
              disabled={readOnly}
              onChange={(e) => updateField("alkaliName", e.target.value)}
            />
          </div>

          <div>
            <label className={labelClass}>Chief Name</label>
            <input
              className={inputClass}
              value={fields.chiefName}
              disabled={readOnly}
              onChange={(e) => updateField("chiefName", e.target.value)}
            />
          </div>

          <div>
            <label className={labelClass}>District Authority</label>
            <input
              className={inputClass}
              value={fields.districtAuthority}
              disabled={readOnly}
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
              disabled={readOnly}
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
              disabled={readOnly}
              onChange={(e) => updateField("areaCouncil", e.target.value)}
            />
          </div>
        </div>
      </section>

      <section>
        <h3 className="mb-4 text-base font-semibold">Dates</h3>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className={labelClass}>Certificate Date (Alkali)</label>
            <input
              className={inputClass}
              value={fields.certificateDateAlkali}
              disabled={readOnly}
              onChange={(e) =>
                updateField("certificateDateAlkali", e.target.value)
              }
            />
          </div>

          <div>
            <label className={labelClass}>Certificate Date (Chief)</label>
            <input
              className={inputClass}
              value={fields.certificateDateChief}
              disabled={readOnly}
              onChange={(e) =>
                updateField("certificateDateChief", e.target.value)
              }
            />
          </div>

          <div>
            <label className={labelClass}>Local Officer Date</label>
            <input
              className={inputClass}
              value={fields.localOfficerDate}
              disabled={readOnly}
              onChange={(e) => updateField("localOfficerDate", e.target.value)}
            />
          </div>

          <div>
            <label className={labelClass}>District Verification Date</label>
            <input
              className={inputClass}
              value={fields.districtVerificationDate}
              disabled={readOnly}
              onChange={(e) =>
                updateField("districtVerificationDate", e.target.value)
              }
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
              disabled={readOnly}
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
              disabled={readOnly}
              onChange={(e) =>
                updateField("labSecretaryDecision", e.target.value)
              }
            />
          </div>

          <div>
            <label className={labelClass}>District Verification Name</label>
            <input
              className={inputClass}
              value={fields.districtVerificationName}
              disabled={readOnly}
              onChange={(e) =>
                updateField("districtVerificationName", e.target.value)
              }
            />
          </div>

          <div>
            <label className={labelClass}>District Verification Location</label>
            <input
              className={inputClass}
              value={fields.districtVerificationLocation}
              disabled={readOnly}
              onChange={(e) =>
                updateField("districtVerificationLocation", e.target.value)
              }
            />
          </div>

          <div>
            <label className={labelClass}>District Verification Result</label>
            <input
              className={inputClass}
              value={fields.districtVerificationResult}
              disabled={readOnly}
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
              disabled={readOnly}
              onChange={(e) => updateField("chairmanName", e.target.value)}
            />
          </div>

          <div>
            <label className={labelClass}>Officer Notes</label>
            <textarea
              className={`${inputClass} min-h-24`}
              value={fields.notes}
              disabled={readOnly}
              onChange={(e) => updateField("notes", e.target.value)}
            />
          </div>
        </div>
      </section>
    </div>
  );
}
