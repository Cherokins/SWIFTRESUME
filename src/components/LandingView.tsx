import React from 'react';
import { ArrowRight } from 'lucide-react';

interface LandingViewProps {
  onStartBuilding: () => void;
  onOpenLegal: (type: 'privacy' | 'terms') => void;
}

const CAPABILITIES = [
  {
    num: '01.',
    title: 'Guided Career Intake',
    desc: 'Enter your work history, education, and skills in a focused form built for speed. Takes around two minutes.',
  },
  {
    num: '02.',
    title: 'Instant Document Drafting',
    desc: 'Your career summary, impact-driven experience bullets, and matching cover letter are drafted together.',
  },
  {
    num: '03.',
    title: 'Free Preview, KES 50 Unlock',
    desc: 'Review both documents before paying. Pay KES 50 once via M-Pesa or card to unlock print-ready PDFs.',
  },
  {
    num: '04.',
    title: 'ATS-Optimised Structure',
    desc: 'Clean typographic hierarchy engineered to pass Applicant Tracking Systems used by Kenyan banks, telcos, and NGOs.',
  },
  {
    num: '05.',
    title: 'Cover Letter Included',
    desc: 'Every build includes a tailored cover letter aligned to your target role and experience at no extra charge.',
  },
  {
    num: '06.',
    title: 'Tailored for East Africa',
    desc: 'Structured with the tone, clarity, and recruiter expectations of Kenyan and regional hiring managers.',
  },
];

export const LandingView: React.FC<LandingViewProps> = ({
  onStartBuilding,
  onOpenLegal,
}) => {
  const scrollToFeatures = () => {
    document
      .getElementById('how-it-works')
      ?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="bg-[#f6f6f7]">
      {/* Hero Split */}
      <section className="mx-auto max-w-[1160px] px-5 pt-12 pb-14 sm:px-7 lg:pt-16 lg:pb-16">
        <div className="grid grid-cols-1 items-stretch gap-10 lg:grid-cols-12 lg:gap-12">
          <div className="flex flex-col justify-center lg:col-span-7">
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.14em] text-[#14397a]">
              Kenyan CV &amp; Cover Letter Studio
            </p>
            <h1 className="max-w-2xl text-balance font-display text-[clamp(2.25rem,4.2vw,3.5rem)] leading-[1.08] tracking-tight text-[#111318] mb-5">
              Land your next job with a{' '}
              <em className="italic text-[#14397a]">standout CV</em>
            </h1>
            <p className="max-w-xl text-base leading-relaxed text-[#3a3d47] mb-7">
              SwiftCV writes an ATS-optimised CV and a tailored cover letter in
              under two minutes. Clear, recruiter-ready formatting for just KES 50.
            </p>

            <div className="flex flex-wrap items-center gap-3 mb-6">
              <button
                type="button"
                onClick={onStartBuilding}
                className="inline-flex items-center gap-2 rounded-lg bg-[#14397a] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#1d52b0] whitespace-nowrap cursor-pointer"
              >
                Build My CV — KES 50
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={scrollToFeatures}
                className="rounded-lg border border-[#cccdd4] bg-white px-5 py-3 text-sm font-medium text-[#3a3d47] transition-colors hover:border-[#72757f] hover:text-[#111318] whitespace-nowrap cursor-pointer"
              >
                See how it works
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 text-xs text-[#72757f]">
              <span>No account needed</span>
              <span aria-hidden="true">·</span>
              <span>M-Pesa &amp; card via Paystack</span>
              <span aria-hidden="true">·</span>
              <span>Instant PDF print &amp; download</span>
            </div>
          </div>

          {/* Right Column: Live CV Specimen Card */}
          <div className="lg:col-span-5 flex items-stretch">
            <div className="w-full rounded-xl border border-[#e3e3e8] bg-white shadow-[0_6px_24px_rgba(17,19,24,0.06)] overflow-hidden flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between bg-[#14397a] px-5 py-3.5">
                  <span className="font-mono text-[11px] uppercase tracking-wider text-white/80">
                    Specimen CV
                  </span>
                  <span className="font-mono text-[11px] text-white/70">
                    ATS Format
                  </span>
                </div>
                <div className="p-6">
                  <div className="font-display text-xl text-[#111318]">
                    Brian K. Otieno
                  </div>
                  <div className="text-xs text-[#72757f] mb-3">
                    Senior Software Engineer · Nairobi, Kenya
                  </div>
                  <div className="h-0.5 w-full bg-[#14397a] mb-4" />

                  <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#14397a] mb-2">
                    Work Experience
                  </div>
                  <div className="mb-4">
                    <div className="flex items-baseline justify-between gap-2">
                      <span className="text-xs font-semibold text-[#111318]">
                        Lead Developer — Safaricom PLC
                      </span>
                      <span className="font-mono text-[10px] text-[#72757f] tabular-nums">
                        Jan 2021 – Present
                      </span>
                    </div>
                    <p className="mt-1.5 text-xs leading-relaxed text-[#3a3d47]">
                      Architected high-throughput M-Pesa API microservices serving
                      4.2M+ daily transactions with 99.98% uptime.
                    </p>
                  </div>

                  <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#14397a] mb-2">
                    Core Skills
                  </div>
                  <div className="text-xs text-[#3a3d47] leading-relaxed">
                    React · Node.js · TypeScript · Python · Cloud Architecture
                  </div>
                </div>
              </div>
              <div className="border-t border-[#e3e3e8] bg-[#f6f6f7] px-6 py-3 text-xs text-[#72757f] flex items-center justify-between">
                <span>Includes matching Cover Letter</span>
                <span className="font-mono font-medium text-[#111318] tabular-nums">
                  KES 50
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Full-Width 4-Column KPI Strip */}
      <section className="border-y border-[#e3e3e8] bg-white">
        <div className="mx-auto grid max-w-[1160px] grid-cols-2 divide-y sm:divide-y-0 sm:grid-cols-4 sm:divide-x divide-[#e3e3e8] px-5 sm:px-7">
          <div className="py-5 sm:px-4 text-center">
            <div className="font-display text-3xl text-[#14397a] tabular-nums">
              2 min
            </div>
            <div className="mt-1 text-xs text-[#72757f]">Average build time</div>
          </div>
          <div className="py-5 sm:px-4 text-center">
            <div className="font-display text-3xl text-[#14397a] tabular-nums">
              KES 50
            </div>
            <div className="mt-1 text-xs text-[#72757f]">
              One-time unlock fee
            </div>
          </div>
          <div className="py-5 sm:px-4 text-center">
            <div className="font-display text-3xl text-[#14397a]">ATS</div>
            <div className="mt-1 text-xs text-[#72757f]">
              Recruiter-ready format
            </div>
          </div>
          <div className="py-5 sm:px-4 text-center">
            <div className="font-display text-3xl text-[#14397a] tabular-nums">
              2-in-1
            </div>
            <div className="mt-1 text-xs text-[#72757f]">
              CV + Cover Letter
            </div>
          </div>
        </div>
      </section>

      {/* Editorial Capabilities Grid */}
      <section
        id="how-it-works"
        className="mx-auto max-w-[1160px] px-5 py-14 sm:px-7 lg:py-16"
      >
        <div className="mb-9 max-w-xl">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#72757f]">
            How it works
          </p>
          <h2 className="font-display text-3xl leading-tight text-[#111318] text-balance">
            From blank page to interview-ready in three steps
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-px overflow-hidden rounded-xl border border-[#e3e3e8] bg-[#e3e3e8] sm:grid-cols-2 lg:grid-cols-3">
          {CAPABILITIES.map((item) => (
            <div
              key={item.num}
              className="bg-white p-6 transition-colors hover:bg-[#fafafb]"
            >
              <div className="mb-3 font-display text-2xl text-[#b0b3bc] tabular-nums">
                {item.num}
              </div>
              <h3 className="mb-1.5 text-sm font-semibold text-[#111318]">
                {item.title}
              </h3>
              <p className="text-xs leading-relaxed text-[#3a3d47]">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Conversion Strip */}
      <section
        id="pricing"
        className="mx-auto max-w-[1160px] px-5 pb-16 sm:px-7"
      >
        <div className="flex flex-col items-start justify-between gap-6 rounded-xl bg-[#14397a] px-7 py-9 sm:flex-row sm:items-center sm:px-10">
          <div>
            <h3 className="font-display text-2xl sm:text-3xl text-white mb-1.5">
              Your next opportunity starts here.
            </h3>
            <p className="text-sm text-white/75">
              Preview your complete CV and cover letter first — unlock PDFs for
              KES 50 via M-Pesa or card.
            </p>
          </div>
          <button
            type="button"
            onClick={onStartBuilding}
            className="rounded-lg bg-white px-6 py-3 text-sm font-semibold text-[#14397a] transition-opacity hover:opacity-90 whitespace-nowrap shrink-0 cursor-pointer"
          >
            Build My CV — KES 50
          </button>
        </div>
      </section>

      {/* Quiet Footer */}
      <footer className="border-t border-[#e3e3e8] bg-white">
        <div className="mx-auto flex max-w-[1160px] flex-col items-center justify-between gap-3 px-5 py-5 text-xs text-[#72757f] sm:flex-row sm:px-7">
          <span>&copy; 2026 SwiftCV. All rights reserved.</span>
          <div className="flex items-center gap-5">
            <button
              type="button"
              onClick={() => onOpenLegal('privacy')}
              className="hover:text-[#111318] transition-colors cursor-pointer"
            >
              Privacy
            </button>
            <button
              type="button"
              onClick={() => onOpenLegal('terms')}
              className="hover:text-[#111318] transition-colors cursor-pointer"
            >
              Terms
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};
