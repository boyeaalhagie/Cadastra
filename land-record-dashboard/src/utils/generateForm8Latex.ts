import type { CertificateFields } from "../types/certificate";

function esc(s: string): string {
  return s
    .replace(/\\/g, "\\textbackslash{}")
    .replace(/&/g, "\\&")
    .replace(/%/g, "\\%")
    .replace(/\$/g, "\\$")
    .replace(/#/g, "\\#")
    .replace(/_/g, "\\_")
    .replace(/\{/g, "\\{")
    .replace(/\}/g, "\\}")
    .replace(/~/g, "\\textasciitilde{}")
    .replace(/\^/g, "\\textasciicircum{}");
}

/** Filled value or dotted blank */
function f(s: string, dotWidth = "6cm"): string {
  return s.trim()
    ? `\\underline{${esc(s)}}`
    : `\\underline{\\hspace{${dotWidth}}}`;
}

/** Full-width filled line or dotfill */
function fl(s: string): string {
  return s.trim() ? `\\underline{\\mbox{${esc(s)}}\\hfill}` : "\\dotfill";
}

export function generateForm8Latex(fields: CertificateFields): string {
  const descLines = (fields.landDescription ?? "").split("\n");
  while (descLines.length < 4) descLines.push("");
  const desc4 = descLines.slice(0, 4);

  return `\\documentclass[12pt]{article}
\\usepackage[top=0.75in,bottom=0.75in,left=1in,right=1in]{geometry}
\\usepackage[T1]{fontenc}
\\usepackage{courier}
\\renewcommand{\\familydefault}{\\ttdefault}
\\usepackage{ulem}
\\usepackage{array}
\\usepackage{tabularx}
\\usepackage{multirow}
\\usepackage{makecell}
\\setlength{\\parindent}{0pt}
\\setlength{\\parskip}{0.45em}
\\pagestyle{empty}

\\begin{document}

% ─── PAGE 1 – PART I ───────────────────────────────────────

\\begin{center}
\\textbf{FORM 8}
\\end{center}

\\vspace{-0.3em}

\\begin{center}
\\textbf{CERTIFICATE OF OCCUPANCY OF LAND HELD\\\\[2pt]
UNDER CUSTOMARY TENANCY OR YEAR TO YEAR\\\\[2pt]
\\uline{TENANCY}}
\\end{center}

\\medskip

\\uline{\\textbf{PART I}}

\\medskip

We, the undersigned, have checked and hereby certify that\\\\
Mr/Mrs/Miss ${fl(fields.applicantName)}

\\noindent of ${fl(fields.applicantAddress)}\\\\
has been holding the land described as follows:

${desc4.map((l) => fl(l)).join("\n\n")}

and as shown in the location plan attached to this certificate\\\\
under customary tenure since \\quad ${f(fields.customaryTenureSince, "8cm")}\\\\
\\begin{center}\\textbf{(state the date or No. of years)}\\end{center}

\\vspace{0.4em}

\\begin{minipage}[t]{0.46\\textwidth}
Date: ${f(fields.certificateDateAlkali, "5cm")}\\\\[2em]
Signature and\\\\
Name of Alkali of ${f(fields.alkaliName, "4cm")}\\\\[3em]
\\rule{0.94\\textwidth}{0.5pt}
\\end{minipage}%
\\hfill
\\begin{minipage}[t]{0.46\\textwidth}
Date: ${f(fields.certificateDateChief, "5cm")}\\\\[2em]
Signature and\\\\
Name of Chief of ${f(fields.chiefName, "4cm")}\\\\[3em]
\\rule{0.94\\textwidth}{0.5pt}
\\end{minipage}

\\vspace{0.8em}

\\hfill\\begin{minipage}[t]{0.54\\textwidth}
\\dotfill\\\\
Seal of District Authority

\\medskip
Date: ${f(fields.localOfficerDate, "5cm")}

\\vspace{1.8em}
\\rule{0.94\\textwidth}{0.5pt}\\\\
Signature of Local Government Officer of\\\\
Area Council/Clerk of Municipal\\\\
Council of ${f(fields.areaCouncil, "4cm")}

\\medskip
Seal of Area Council or Municipal Council

\\medskip
Date: ${f(fields.localOfficerDate, "5cm")}
\\end{minipage}

\\vspace{0.8em}

% Bottom table: Declaration | LAB Secretary boxes
\\noindent
\\begin{tabular}{|p{0.44\\textwidth}|p{0.44\\textwidth}|}
\\hline
\\begin{minipage}[t]{\\linewidth}\\vspace{2pt}
  \\textbf{Declaration:}\\\\[0.4em]
  I ${f(fields.declarationApplicantName, "3.5cm")} declare that I
  am the owner of the land and to the best of my knowledge the information I
  furnished above is correct. (If upon investigation, it is found that
  information furnished in the application is incorrect, either the lease will
  not be issued or if issued it will be withdrawn).\\\\[0.8em]
  (Sgd): ${fl(fields.declarationApplicantName)}\\\\
  Date: \\quad ${f(fields.localOfficerDate, "4cm")}
  \\vspace{4pt}
\\end{minipage}
&
\\begin{minipage}[t]{\\linewidth}\\vspace{2pt}
  The ownership of the land and the particulars given in this application have
  been checked and found correct.\\\\[0.6em]
  \\rule{\\linewidth}{0.5pt}\\\\[0.6em]
  The ownership of the land and the particulars given in this application are
  doubtful. The application is to be referred to the
  ${f(fields.labSecretaryDecision, "2.5cm")} District Authority for
  verification.\\\\[0.6em]
  \\rule{\\linewidth}{0.5pt}\\\\[0.6em]
  LAB Secretary
  \\vspace{4pt}
\\end{minipage}
\\\\
\\hline
\\end{tabular}

\\newpage

% ─── PAGE 2 – PART II ──────────────────────────────────────

\\uline{\\textbf{PART II}}

\\begin{center}
(For office use only)
\\end{center}

\\uline{\\textbf{Verification and Statement of the District Authority}}

\\medskip

I, on behalf of the ${f(fields.districtVerificationName, "5cm")} District Authority\\\\
\\begin{center}\\textbf{(name of the District)}\\end{center}

have verified the ownership of the above mentioned land at

${fl(fields.districtVerificationLocation)}

and found that the applicant, Mr/Mrs/Miss ${f(fields.applicantName, "5cm")}

${fl(fields.applicantAddress)}

\\textbf{\\uline{is}} the rightful owner/\\, \\textbf{\\uline{is not}} the rightful owner of the land.\\\\
(delete whichever is not applicable)

\\vspace{2.5em}

\\begin{center}
Date: \\quad ${f(fields.districtVerificationDate, "6cm")}
\\end{center}

\\vspace{2.5em}

\\begin{minipage}[t]{0.4\\textwidth}
Seal of the\\\\
District Authority \\dotfill\\\\[1.5em]
\\begin{center}
\\begin{tikzpicture}
  \\draw[thick] (0,0) circle (1.4cm);
  \\node[align=center,font=\\small] at (0,0) {OFFICIAL\\\\SEAL};
\\end{tikzpicture}
\\end{center}
\\end{minipage}%
\\hfill
\\begin{minipage}[t]{0.52\\textwidth}
Signature and Name of Chairman of\\\\
District Authority\\\\[3em]
\\rule{\\textwidth}{0.5pt}\\\\
${fl(fields.chairmanName)}\\\\
${fl(fields.districtVerificationResult)}
\\end{minipage}

\\vspace*{\\fill}
\\begin{center}
  \\tiny{Demo template based on Form 8 structure --- not an official government-issued certificate}
\\end{center}

\\end{document}
`;
}
