import type {
  GeneratedCoverLetterData,
  GeneratedCvData,
} from '../types/cv';

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

export function buildCvPrintHtml(cv: GeneratedCvData): string {
  const contactHtml = cv.contactItems
    .filter(Boolean)
    .map((item) => `<span>${escapeHtml(item)}</span>`)
    .join('');

  const expHtml = cv.experience.length
    ? `<div class="cv-section-h">Work Experience</div>` +
      cv.experience
        .map(
          (exp) => `
      <div class="cv-exp">
        <div class="cv-exp-top">
          <div class="cv-exp-role">${escapeHtml(exp.role)}</div>
          <div class="cv-exp-date">${escapeHtml(exp.dateRange)}</div>
        </div>
        <div class="cv-exp-co">${escapeHtml(exp.company)}</div>
        ${
          exp.bullets.length
            ? `<ul class="cv-exp-list">${exp.bullets
                .map((b) => `<li>${escapeHtml(b)}</li>`)
                .join('')}</ul>`
            : ''
        }
      </div>`
        )
        .join('')
    : '';

  const eduHtml = cv.education.length
    ? `<div class="cv-section-h">Education</div>` +
      cv.education
        .map(
          (edu) => `
      <div class="cv-edu">
        <div class="cv-edu-deg">${escapeHtml(edu.degree)}</div>
        <div class="cv-edu-co">${escapeHtml(edu.institution)}</div>
        ${
          edu.meta
            ? `<div class="cv-edu-meta">${escapeHtml(edu.meta)}</div>`
            : ''
        }
      </div>`
        )
        .join('')
    : '';

  const skillsHtml = cv.skills.length
    ? `<div class="cv-section-h">Skills</div>
       <div class="cv-skills-wrap">${cv.skills
         .map((s) => `<span class="cv-skill">${escapeHtml(s)}</span>`)
         .join('')}</div>`
    : '';

  const achHtml = cv.achievements.length
    ? `<div class="cv-section-h">Achievements &amp; Awards</div>
       <ol class="cv-ach-list">${cv.achievements
         .map((a) => `<li>${escapeHtml(a)}</li>`)
         .join('')}</ol>`
    : '';

  const langsHtml = cv.languages.trim()
    ? `<div class="cv-section-h">Languages</div>
       <p class="cv-langs">${escapeHtml(cv.languages)}</p>`
    : '';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>${escapeHtml(cv.fullName)} — Curriculum Vitae</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: Georgia, "Times New Roman", serif;
      color: #111318;
      padding: 40px 48px;
      font-size: 12px;
      line-height: 1.6;
      max-width: 780px;
      margin: 0 auto;
    }
    .cv-h-name { font-size: 24px; font-weight: 700; margin-bottom: 2px; }
    .cv-h-role { font-size: 13px; color: #3a3d47; margin-bottom: 8px; }
    .cv-h-contact {
      display: flex; flex-wrap: wrap; gap: 12px;
      font-size: 11px; color: #72757f;
      padding-bottom: 11px; border-bottom: 2px solid #14397a; margin-bottom: 14px;
    }
    .cv-section-h {
      font-size: 9px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase;
      color: #14397a; margin: 14px 0 6px; padding-bottom: 3px; border-bottom: 1px solid #e3e3e8;
    }
    .cv-summary { font-size: 12px; color: #3a3d47; line-height: 1.7; }
    .cv-exp { margin-bottom: 11px; }
    .cv-exp-top { display: flex; justify-content: space-between; align-items: baseline; gap: 12px; }
    .cv-exp-role { font-size: 13px; font-weight: 700; color: #111318; }
    .cv-exp-date { font-size: 11px; color: #72757f; white-space: nowrap; }
    .cv-exp-co { font-size: 12px; color: #3a3d47; font-style: italic; margin-bottom: 3px; }
    .cv-exp-list { padding-left: 16px; margin-top: 3px; }
    .cv-exp-list li { font-size: 11px; color: #3a3d47; line-height: 1.65; margin-bottom: 2px; }
    .cv-skills-wrap { display: flex; flex-wrap: wrap; gap: 5px; }
    .cv-skill {
      background: #e8edf7; color: #14397a;
      font-size: 10px; font-weight: 600; padding: 2px 7px; border-radius: 3px;
    }
    .cv-edu { margin-bottom: 8px; }
    .cv-edu-deg { font-size: 12px; font-weight: 700; color: #111318; }
    .cv-edu-co { font-size: 11px; color: #3a3d47; font-style: italic; }
    .cv-edu-meta { font-size: 10px; color: #72757f; }
    .cv-ach-list { list-style: none; counter-reset: ach; padding-left: 0; }
    .cv-ach-list li {
      counter-increment: ach; display: flex; gap: 7px;
      font-size: 11px; color: #3a3d47; line-height: 1.65; margin-bottom: 3px;
    }
    .cv-ach-list li::before { content: counter(ach) '.'; color: #14397a; font-weight: 700; flex-shrink: 0; }
    .cv-langs { font-size: 11px; color: #3a3d47; line-height: 1.7; }
    @media print { body { padding: 20px 24px; } }
  </style>
</head>
<body>
  <div class="cv-h-name">${escapeHtml(cv.fullName)}</div>
  <div class="cv-h-role">${escapeHtml(cv.targetRole)}</div>
  <div class="cv-h-contact">${contactHtml}</div>
  <div class="cv-section-h">Professional Summary</div>
  <p class="cv-summary">${escapeHtml(cv.professionalSummary)}</p>
  ${expHtml}
  ${eduHtml}
  ${skillsHtml}
  ${achHtml}
  ${langsHtml}
</body>
</html>`;
}

export function buildCoverLetterPrintHtml(
  cl: GeneratedCoverLetterData
): string {
  const recipientHtml = cl.recipientLines
    .map((line) => `<div>${escapeHtml(line)}</div>`)
    .join('');
  const bodyHtml = cl.paragraphs
    .map((p) => `<p class="cl-body-p">${escapeHtml(p)}</p>`)
    .join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>${escapeHtml(cl.signatureName)} — Cover Letter</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: Georgia, "Times New Roman", serif;
      color: #111318;
      padding: 48px 56px;
      font-size: 12px;
      line-height: 1.65;
      max-width: 780px;
      margin: 0 auto;
    }
    .cl-date { font-size: 11px; color: #72757f; margin-bottom: 16px; }
    .cl-addr { font-size: 12px; color: #3a3d47; margin-bottom: 16px; line-height: 1.6; }
    .cl-subj { font-size: 13px; font-weight: 700; color: #111318; margin-bottom: 14px; }
    .cl-sal { font-size: 12px; color: #3a3d47; margin-bottom: 12px; }
    .cl-body-p { font-size: 12px; color: #3a3d47; line-height: 1.8; margin-bottom: 12px; }
    .cl-sign { font-size: 12px; color: #3a3d47; margin-top: 22px; }
    .cl-name { font-size: 14px; font-weight: 700; color: #111318; margin-top: 6px; }
    @media print { body { padding: 24px 28px; } }
  </style>
</head>
<body>
  <div class="cl-date">${escapeHtml(cl.date)}</div>
  <div class="cl-addr">${recipientHtml}</div>
  <div class="cl-subj">${escapeHtml(cl.subject)}</div>
  <p class="cl-sal">${escapeHtml(cl.salutation)}</p>
  ${bodyHtml}
  <div class="cl-sign">${escapeHtml(cl.closing)}</div>
  <div class="cl-name">${escapeHtml(cl.signatureName)}</div>
</body>
</html>`;
}

export function printHtmlDocument(html: string): void {
  const iframe = document.createElement('iframe');
  iframe.style.position = 'fixed';
  iframe.style.right = '0';
  iframe.style.bottom = '0';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = '0';
  iframe.setAttribute('aria-hidden', 'true');
  document.body.appendChild(iframe);

  const cleanup = () => {
    setTimeout(() => {
      if (iframe.parentNode) {
        iframe.parentNode.removeChild(iframe);
      }
    }, 1000);
  };

  iframe.onload = () => {
    try {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
    } finally {
      cleanup();
    }
  };

  iframe.srcdoc = html;
}
