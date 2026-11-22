import React from 'react';
import { Check, Copy, Download } from 'lucide-react';

interface SuccessViewProps {
  onDownload: (type: 'cv' | 'cl') => void;
  onCopyCoverLetter: () => void;
  onViewDocuments: () => void;
  onBuildAnother: () => void;
}

export const SuccessView: React.FC<SuccessViewProps> = ({
  onDownload,
  onCopyCoverLetter,
  onViewDocuments,
  onBuildAnother,
}) => {
  return (
    <div className="flex min-h-[calc(100vh-56px)] flex-col items-center justify-center px-6 py-12 text-center">
      <div className="mb-5 flex h-13 w-13 items-center justify-center rounded-full bg-[#dcfce7] text-[#166534]">
        <Check className="h-6 w-6 stroke-[2.5]" aria-hidden="true" />
      </div>
      <h1 className="font-display text-3xl text-[#111318] mb-2">
        Payment confirmed
      </h1>
      <p className="max-w-sm text-sm text-[#72757f] mb-7">
        Your CV and cover letter are unlocked. Download them below as
        print-ready PDFs or copy your cover letter text for email applications.
      </p>

      <div className="flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={() => onDownload('cv')}
          className="inline-flex items-center gap-2 rounded-lg bg-[#14397a] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#1d52b0] cursor-pointer"
        >
          <Download className="h-4 w-4" aria-hidden="true" />
          Download CV (PDF)
        </button>
        <button
          type="button"
          onClick={() => onDownload('cl')}
          className="inline-flex items-center gap-2 rounded-lg bg-[#14397a] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#1d52b0] cursor-pointer"
        >
          <Download className="h-4 w-4" aria-hidden="true" />
          Download Cover Letter (PDF)
        </button>
        <button
          type="button"
          onClick={onCopyCoverLetter}
          className="inline-flex items-center gap-2 rounded-lg border border-[#cccdd4] bg-white px-4 py-2.5 text-sm font-medium text-[#3a3d47] hover:border-[#72757f] cursor-pointer"
        >
          <Copy className="h-4 w-4" aria-hidden="true" />
          Copy Cover Letter Text
        </button>
        <button
          type="button"
          onClick={onViewDocuments}
          className="rounded-lg border border-[#cccdd4] bg-white px-4 py-2.5 text-sm font-medium text-[#3a3d47] hover:border-[#72757f] cursor-pointer"
        >
          View Unlocked Preview
        </button>
        <button
          type="button"
          onClick={onBuildAnother}
          className="rounded-lg border border-[#cccdd4] bg-white px-4 py-2.5 text-sm font-medium text-[#3a3d47] hover:border-[#72757f] cursor-pointer"
        >
          Build another CV
        </button>
      </div>
    </div>
  );
};
