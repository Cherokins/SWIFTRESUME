import React from 'react';
import type {
  GeneratedCoverLetterData,
  GeneratedCvData,
} from '../types/cv';

export const CvDocumentView: React.FC<{ cv: GeneratedCvData }> = ({ cv }) => {
  return (
    <div style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}>
      <h2 className="text-2xl font-bold tracking-tight text-[#111318] mb-0.5">
        {cv.fullName}
      </h2>
      <div className="text-[13px] text-[#3a3d47] mb-2">{cv.targetRole}</div>
      <div className="flex flex-wrap gap-x-3 gap-y-1 border-b-2 border-[#14397a] pb-3 mb-4 text-[11px] text-[#72757f]">
        {cv.contactItems.filter(Boolean).map((item, idx) => (
          <span key={idx}>{item}</span>
        ))}
      </div>

      <h3 className="mt-4 mb-2 border-b border-[#e3e3e8] pb-1 text-[9px] font-bold uppercase tracking-[0.16em] text-[#14397a]">
        Professional Summary
      </h3>
      <p className="text-xs leading-relaxed text-[#3a3d47]">
        {cv.professionalSummary}
      </p>

      {cv.experience.length > 0 && (
        <>
          <h3 className="mt-5 mb-2.5 border-b border-[#e3e3e8] pb-1 text-[9px] font-bold uppercase tracking-[0.16em] text-[#14397a]">
            Work Experience
          </h3>
          <div className="space-y-3">
            {cv.experience.map((exp, idx) => (
              <div key={idx}>
                <div className="flex items-baseline justify-between gap-3">
                  <div className="text-[13px] font-bold text-[#111318]">
                    {exp.role}
                  </div>
                  <div className="text-[11px] text-[#72757f] whitespace-nowrap">
                    {exp.dateRange}
                  </div>
                </div>
                <div className="text-xs italic text-[#3a3d47] mb-1">
                  {exp.company}
                </div>
                {exp.bullets.length > 0 && (
                  <ul className="list-disc pl-4 space-y-0.5 text-[11px] leading-relaxed text-[#3a3d47]">
                    {exp.bullets.map((b, bIdx) => (
                      <li key={bIdx}>{b}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </>
      )}

      {cv.education.length > 0 && (
        <>
          <h3 className="mt-5 mb-2 border-b border-[#e3e3e8] pb-1 text-[9px] font-bold uppercase tracking-[0.16em] text-[#14397a]">
            Education
          </h3>
          <div className="space-y-2.5">
            {cv.education.map((edu, idx) => (
              <div key={idx}>
                <div className="text-xs font-bold text-[#111318]">
                  {edu.degree}
                </div>
                <div className="text-[11px] italic text-[#3a3d47]">
                  {edu.institution}
                </div>
                {edu.meta && (
                  <div className="text-[10px] text-[#72757f]">{edu.meta}</div>
                )}
              </div>
            ))}
          </div>
        </>
      )}

      {cv.skills.length > 0 && (
        <>
          <h3 className="mt-5 mb-2 border-b border-[#e3e3e8] pb-1 text-[9px] font-bold uppercase tracking-[0.16em] text-[#14397a]">
            Skills
          </h3>
          <div className="flex flex-wrap gap-1.5">
            {cv.skills.map((skill, idx) => (
              <span
                key={idx}
                className="rounded bg-[#e8edf7] px-2 py-0.5 text-[10px] font-semibold text-[#14397a]"
              >
                {skill}
              </span>
            ))}
          </div>
        </>
      )}

      {cv.achievements.length > 0 && (
        <>
          <h3 className="mt-5 mb-2 border-b border-[#e3e3e8] pb-1 text-[9px] font-bold uppercase tracking-[0.16em] text-[#14397a]">
            Achievements &amp; Awards
          </h3>
          <ol className="space-y-1 text-[11px] leading-relaxed text-[#3a3d47]">
            {cv.achievements.map((ach, idx) => (
              <li key={idx} className="flex gap-2">
                <span className="font-bold text-[#14397a] tabular-nums">
                  {idx + 1}.
                </span>
                <span>{ach}</span>
              </li>
            ))}
          </ol>
        </>
      )}

      {cv.languages.trim() && (
        <>
          <h3 className="mt-5 mb-2 border-b border-[#e3e3e8] pb-1 text-[9px] font-bold uppercase tracking-[0.16em] text-[#14397a]">
            Languages
          </h3>
          <p className="text-[11px] leading-relaxed text-[#3a3d47]">
            {cv.languages}
          </p>
        </>
      )}
    </div>
  );
};

export const CoverLetterDocumentView: React.FC<{
  coverLetter: GeneratedCoverLetterData;
}> = ({ coverLetter }) => {
  return (
    <div style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}>
      <div className="mb-4 text-[11px] text-[#72757f]">{coverLetter.date}</div>
      <div className="mb-4 text-xs leading-relaxed text-[#3a3d47]">
        {coverLetter.recipientLines.map((line, idx) => (
          <div key={idx}>{line}</div>
        ))}
      </div>
      <div className="mb-3.5 text-[13px] font-bold text-[#111318]">
        {coverLetter.subject}
      </div>
      <p className="mb-3 text-xs text-[#3a3d47]">{coverLetter.salutation}</p>
      <div className="space-y-3 text-xs leading-[1.8] text-[#3a3d47]">
        {coverLetter.paragraphs.map((p, idx) => (
          <p key={idx}>{p}</p>
        ))}
      </div>
      <div className="mt-5 text-xs text-[#3a3d47]">{coverLetter.closing}</div>
      <div className="mt-1.5 text-sm font-bold text-[#111318]">
        {coverLetter.signatureName}
      </div>
    </div>
  );
};
