import React, { useState, useRef } from 'react';
import {
  User,
  Briefcase,
  GraduationCap,
  Wrench,
  Award,
  FileText,
  Plus,
  RotateCcw,
  Sparkles,
  Target,
  X,
} from 'lucide-react';
import type {
  CvFormData,
  EducationEntry,
  ExperienceEntry,
} from '../types/cv';
import { MonthYearField } from './MonthYearField';

interface CvFormViewProps {
  formData: CvFormData;
  onChange: (next: CvFormData) => void;
  onBackHome: () => void;
  onSubmit: () => void;
  onLoadSample: () => void;
  onClearForm: () => void;
  onNotify: (msg: string) => void;
  isSubmitting: boolean;
}

export const CvFormView: React.FC<CvFormViewProps> = ({
  formData,
  onChange,
  onBackHome,
  onSubmit,
  onLoadSample,
  onClearForm,
  onNotify,
  isSubmitting,
}) => {
  const [skillInput, setSkillInput] = useState('');
  const skillInputRef = useRef<HTMLInputElement>(null);

  // Experience modal state
  const [expModalOpen, setExpModalOpen] = useState(false);
  const [expTitle, setExpTitle] = useState('');
  const [expCompany, setExpCompany] = useState('');
  const [expStart, setExpStart] = useState('');
  const [expEnd, setExpEnd] = useState('');
  const [expBullets, setExpBullets] = useState<string[]>(['']);

  // Education modal state
  const [eduModalOpen, setEduModalOpen] = useState(false);
  const [eduDegree, setEduDegree] = useState('');
  const [eduSchool, setEduSchool] = useState('');
  const [eduYear, setEduYear] = useState('');
  const [eduGrade, setEduGrade] = useState('');

  const updateField = <K extends keyof CvFormData>(
    key: K,
    value: CvFormData[K]
  ) => {
    onChange({ ...formData, [key]: value });
  };

  // Progress computation
  const stepDone = [
    Boolean(formData.name.trim() && formData.role.trim()),
    formData.experiences.length > 0,
    formData.education.length > 0,
    formData.skills.length > 0,
  ];
  const completedCount = stepDone.filter(Boolean).length;
  const progressLabels = [
    'Getting started',
    'Personal info done',
    'Experience added',
    'Education added',
    'Ready to build',
  ];

  // Skills handlers
  const commitSkill = (raw: string) => {
    const cleaned = raw.replace(/,/g, '').trim();
    if (!cleaned) return;
    if (
      formData.skills.some((s) => s.toLowerCase() === cleaned.toLowerCase())
    ) {
      setSkillInput('');
      return;
    }
    updateField('skills', [...formData.skills, cleaned]);
    setSkillInput('');
  };

  const handleSkillKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      commitSkill(skillInput);
    } else if (
      e.key === 'Backspace' &&
      !skillInput &&
      formData.skills.length > 0
    ) {
      updateField('skills', formData.skills.slice(0, -1));
    }
  };

  const removeSkill = (index: number) => {
    updateField(
      'skills',
      formData.skills.filter((_, idx) => idx !== index)
    );
  };

  // Achievements handlers
  const achievements =
    formData.achievements.length > 0 ? formData.achievements : [''];

  const updateAchievement = (index: number, value: string) => {
    const next = [...achievements];
    next[index] = value;
    updateField('achievements', next);
  };

  const addAchievement = () => {
    updateField('achievements', [...achievements, '']);
  };

  const removeAchievement = (index: number) => {
    const next = achievements.filter((_, idx) => idx !== index);
    updateField('achievements', next.length > 0 ? next : ['']);
  };

  // Experience modal handlers
  const openExpModal = () => {
    setExpTitle('');
    setExpCompany('');
    setExpStart('');
    setExpEnd('');
    setExpBullets(['']);
    setExpModalOpen(true);
  };

  const saveExperience = () => {
    if (!expTitle.trim() || !expCompany.trim()) {
      onNotify('Please enter a job title and company name.');
      return;
    }
    const newExp: ExperienceEntry = {
      id: `exp_${Date.now()}`,
      title: expTitle.trim(),
      company: expCompany.trim(),
      start: expStart.trim(),
      end: expEnd.trim(),
      bullets: expBullets.map((b) => b.trim()).filter(Boolean),
    };
    updateField('experiences', [...formData.experiences, newExp]);
    setExpModalOpen(false);
  };

  const removeExperience = (id: string) => {
    updateField(
      'experiences',
      formData.experiences.filter((e) => e.id !== id)
    );
  };

  // Education modal handlers
  const openEduModal = () => {
    setEduDegree('');
    setEduSchool('');
    setEduYear('');
    setEduGrade('');
    setEduModalOpen(true);
  };

  const saveEducation = () => {
    if (!eduDegree.trim() || !eduSchool.trim()) {
      onNotify('Please enter a degree and institution name.');
      return;
    }
    const newEdu: EducationEntry = {
      id: `edu_${Date.now()}`,
      degree: eduDegree.trim(),
      school: eduSchool.trim(),
      year: eduYear.trim(),
      grade: eduGrade.trim(),
    };
    updateField('education', [...formData.education, newEdu]);
    setEduModalOpen(false);
  };

  const removeEducation = (id: string) => {
    updateField(
      'education',
      formData.education.filter((e) => e.id !== id)
    );
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !formData.name.trim() ||
      !formData.role.trim() ||
      !formData.email.trim() ||
      !formData.phone.trim()
    ) {
      onNotify('Please fill in name, role, email, and phone number.');
      return;
    }
    if (skillInput.trim()) {
      commitSkill(skillInput);
    }
    onSubmit();
  };

  return (
    <div className="mx-auto max-w-[780px] px-5 pt-7 pb-20 sm:px-7">
      <nav aria-label="Breadcrumb" className="mb-5 flex items-center gap-2 text-xs text-[#72757f]">
        <button
          type="button"
          onClick={onBackHome}
          className="hover:text-[#14397a] transition-colors cursor-pointer"
        >
          Home
        </button>
        <span aria-hidden="true">/</span>
        <span className="text-[#111318] font-medium">Build CV</span>
      </nav>

      <div className="mb-6 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <h1 className="font-display text-3xl text-[#111318] mb-1">
            Build Your CV
          </h1>
          <p className="text-sm text-[#72757f]">
            Fill in your details and we will draft your CV and cover letter. Your
            progress is saved automatically in this browser.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={onLoadSample}
            className="inline-flex items-center gap-1.5 rounded-lg border border-[#cccdd4] bg-white px-3 py-1.5 text-xs font-medium text-[#3a3d47] hover:border-[#14397a] hover:text-[#14397a] whitespace-nowrap cursor-pointer"
          >
            <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
            Load sample
          </button>
          <button
            type="button"
            onClick={onClearForm}
            className="inline-flex items-center gap-1.5 rounded-lg border border-[#cccdd4] bg-white px-3 py-1.5 text-xs font-medium text-[#72757f] hover:border-[#b91c1c] hover:text-[#b91c1c] whitespace-nowrap cursor-pointer"
          >
            <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
            Clear
          </button>
        </div>
      </div>

      {/* Progress */}
      <div className="mb-6 flex items-center gap-1.5">
        {stepDone.map((done, i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-colors ${
              done ? 'bg-[#14397a]' : 'bg-[#e3e3e8]'
            }`}
          />
        ))}
        <span className="ml-2 font-mono text-[11px] text-[#72757f] whitespace-nowrap">
          {progressLabels[completedCount]}
        </span>
      </div>

      <form onSubmit={handleFormSubmit} className="space-y-3">
        {/* Personal Information */}
        <section className="overflow-hidden rounded-xl border border-[#e3e3e8] bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
          <div className="flex items-center justify-between border-b border-[#e3e3e8] px-5 py-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-[#111318]">
              <span className="flex h-6 w-6 items-center justify-center rounded bg-[#e8edf7] text-[#14397a]">
                <User className="h-3.5 w-3.5" aria-hidden="true" />
              </span>
              Personal Information
            </div>
          </div>
          <div className="grid grid-cols-1 gap-3.5 p-5 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="f-name" className="text-xs font-medium text-[#3a3d47]">
                Full Name <span className="text-[#b91c1c]">*</span>
              </label>
              <input
                id="f-name"
                value={formData.name}
                onChange={(e) => updateField('name', e.target.value)}
                placeholder="e.g. Brian Otieno"
                autoComplete="name"
                className="w-full rounded-lg border border-[#cccdd4] bg-white px-3 py-2 text-sm text-[#111318] placeholder-[#b0b3bc] outline-none focus:border-[#14397a] focus:ring-2 focus:ring-[#14397a]/15"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="f-role" className="text-xs font-medium text-[#3a3d47]">
                Role / Position Applying For <span className="text-[#b91c1c]">*</span>
              </label>
              <input
                id="f-role"
                value={formData.role}
                onChange={(e) => updateField('role', e.target.value)}
                placeholder="e.g. Sales Manager"
                className="w-full rounded-lg border border-[#cccdd4] bg-white px-3 py-2 text-sm text-[#111318] placeholder-[#b0b3bc] outline-none focus:border-[#14397a] focus:ring-2 focus:ring-[#14397a]/15"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="f-email" className="text-xs font-medium text-[#3a3d47]">
                Email Address <span className="text-[#b91c1c]">*</span>
              </label>
              <input
                id="f-email"
                type="email"
                value={formData.email}
                onChange={(e) => updateField('email', e.target.value)}
                placeholder="you@email.com"
                autoComplete="email"
                className="w-full rounded-lg border border-[#cccdd4] bg-white px-3 py-2 text-sm text-[#111318] placeholder-[#b0b3bc] outline-none focus:border-[#14397a] focus:ring-2 focus:ring-[#14397a]/15"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="f-phone" className="text-xs font-medium text-[#3a3d47]">
                Phone Number <span className="text-[#b91c1c]">*</span>
              </label>
              <input
                id="f-phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => updateField('phone', e.target.value)}
                placeholder="+254 7XX XXX XXX"
                autoComplete="tel"
                className="w-full rounded-lg border border-[#cccdd4] bg-white px-3 py-2 text-sm text-[#111318] placeholder-[#b0b3bc] outline-none focus:border-[#14397a] focus:ring-2 focus:ring-[#14397a]/15"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="f-location" className="text-xs font-medium text-[#3a3d47]">
                Location
              </label>
              <input
                id="f-location"
                value={formData.location}
                onChange={(e) => updateField('location', e.target.value)}
                placeholder="e.g. Nairobi, Kenya"
                className="w-full rounded-lg border border-[#cccdd4] bg-white px-3 py-2 text-sm text-[#111318] placeholder-[#b0b3bc] outline-none focus:border-[#14397a] focus:ring-2 focus:ring-[#14397a]/15"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="f-linkedin" className="text-xs font-medium text-[#3a3d47]">
                LinkedIn / Portfolio URL
              </label>
              <input
                id="f-linkedin"
                value={formData.linkedin}
                onChange={(e) => updateField('linkedin', e.target.value)}
                placeholder="linkedin.com/in/yourname"
                className="w-full rounded-lg border border-[#cccdd4] bg-white px-3 py-2 text-sm text-[#111318] placeholder-[#b0b3bc] outline-none focus:border-[#14397a] focus:ring-2 focus:ring-[#14397a]/15"
              />
            </div>
          </div>
        </section>

        {/* Work Experience */}
        <section className="overflow-hidden rounded-xl border border-[#e3e3e8] bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
          <div className="flex items-center justify-between border-b border-[#e3e3e8] px-5 py-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-[#111318]">
              <span className="flex h-6 w-6 items-center justify-center rounded bg-[#e8edf7] text-[#14397a]">
                <Briefcase className="h-3.5 w-3.5" aria-hidden="true" />
              </span>
              Work Experience
            </div>
          </div>
          <div className="p-5">
            {formData.experiences.length > 0 && (
              <div className="mb-3 space-y-2">
                {formData.experiences.map((item) => {
                  const dateLabel = item.start
                    ? item.end
                      ? `${item.start} – ${item.end}`
                      : item.start
                    : item.end || '';
                  const meta = [item.company, dateLabel]
                    .filter(Boolean)
                    .join(' · ');
                  return (
                    <div
                      key={item.id}
                      className="flex items-start justify-between gap-3 rounded-lg border border-[#e3e3e8] bg-[#f6f6f7] p-3"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-semibold text-[#111318]">
                          {item.title}
                        </div>
                        <div className="text-xs text-[#72757f]">{meta}</div>
                        {item.bullets.length > 0 && (
                          <ul className="mt-1.5 space-y-0.5 text-xs text-[#3a3d47]">
                            {item.bullets.slice(0, 2).map((b, idx) => (
                              <li key={idx} className="truncate">
                                · {b}
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => removeExperience(item.id)}
                        aria-label={`Remove ${item.title}`}
                        className="rounded p-1 text-[#72757f] hover:text-[#b91c1c] cursor-pointer"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}

            <button
              type="button"
              onClick={openExpModal}
              className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-[#cccdd4] py-2.5 text-xs font-medium text-[#14397a] transition-colors hover:border-[#14397a] hover:bg-[#e8edf7]/50 cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" aria-hidden="true" />
              Add Work Experience
            </button>
          </div>
        </section>

        {/* Education */}
        <section className="overflow-hidden rounded-xl border border-[#e3e3e8] bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
          <div className="flex items-center justify-between border-b border-[#e3e3e8] px-5 py-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-[#111318]">
              <span className="flex h-6 w-6 items-center justify-center rounded bg-[#e8edf7] text-[#14397a]">
                <GraduationCap className="h-3.5 w-3.5" aria-hidden="true" />
              </span>
              Education
            </div>
          </div>
          <div className="p-5">
            {formData.education.length > 0 && (
              <div className="mb-3 space-y-2">
                {formData.education.map((item) => {
                  const meta = [item.school, item.year, item.grade]
                    .filter(Boolean)
                    .join(' · ');
                  return (
                    <div
                      key={item.id}
                      className="flex items-start justify-between gap-3 rounded-lg border border-[#e3e3e8] bg-[#f6f6f7] p-3"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-semibold text-[#111318]">
                          {item.degree}
                        </div>
                        <div className="text-xs text-[#72757f]">{meta}</div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeEducation(item.id)}
                        aria-label={`Remove ${item.degree}`}
                        className="rounded p-1 text-[#72757f] hover:text-[#b91c1c] cursor-pointer"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}

            <button
              type="button"
              onClick={openEduModal}
              className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-[#cccdd4] py-2.5 text-xs font-medium text-[#14397a] transition-colors hover:border-[#14397a] hover:bg-[#e8edf7]/50 cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" aria-hidden="true" />
              Add Education
            </button>
          </div>
        </section>

        {/* Skills */}
        <section className="overflow-hidden rounded-xl border border-[#e3e3e8] bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
          <div className="flex items-center justify-between border-b border-[#e3e3e8] px-5 py-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-[#111318]">
              <span className="flex h-6 w-6 items-center justify-center rounded bg-[#e8edf7] text-[#14397a]">
                <Wrench className="h-3.5 w-3.5" aria-hidden="true" />
              </span>
              Skills
            </div>
          </div>
          <div className="p-5">
            <label
              htmlFor="sg-input"
              className="mb-1.5 block text-xs font-medium text-[#3a3d47]"
            >
              Type a skill and press Enter or comma
            </label>
            <div
              onClick={() => skillInputRef.current?.focus()}
              className="flex min-h-[42px] flex-wrap items-center gap-1.5 rounded-lg border border-[#cccdd4] bg-white px-2.5 py-1.5 cursor-text focus-within:border-[#14397a] focus-within:ring-2 focus-within:ring-[#14397a]/15"
            >
              {formData.skills.map((skill, idx) => (
                <span
                  key={skill}
                  className="inline-flex items-center gap-1 rounded bg-[#e8edf7] px-2 py-0.5 text-xs font-medium text-[#14397a]"
                >
                  {skill}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeSkill(idx);
                    }}
                    aria-label={`Remove skill ${skill}`}
                    className="text-[#72757f] hover:text-[#b91c1c] cursor-pointer"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
              <input
                ref={skillInputRef}
                id="sg-input"
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={handleSkillKeyDown}
                onBlur={() => {
                  if (skillInput.trim()) commitSkill(skillInput);
                }}
                placeholder={
                  formData.skills.length > 0
                    ? 'Add another skill...'
                    : 'e.g. Microsoft Excel, Communication, Project Management...'
                }
                className="min-w-[140px] flex-1 border-none bg-transparent py-1 text-sm text-[#111318] placeholder-[#b0b3bc] outline-none"
              />
            </div>
          </div>
        </section>

        {/* Achievements & Awards */}
        <section className="overflow-hidden rounded-xl border border-[#e3e3e8] bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
          <div className="flex items-center justify-between border-b border-[#e3e3e8] px-5 py-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-[#111318]">
              <span className="flex h-6 w-6 items-center justify-center rounded bg-[#e8edf7] text-[#14397a]">
                <Award className="h-3.5 w-3.5" aria-hidden="true" />
              </span>
              Achievements &amp; Awards
            </div>
            <span className="text-xs text-[#72757f]">Optional</span>
          </div>
          <div className="p-5">
            <p className="mb-2 text-xs font-medium text-[#3a3d47]">
              List your key achievements, certifications, or awards
            </p>
            <div className="overflow-hidden rounded-lg border border-[#cccdd4] bg-white">
              <ol className="divide-y divide-[#efeff1] p-1.5">
                {achievements.map((ach, index) => (
                  <li
                    key={index}
                    className="flex items-start gap-2 rounded px-2 py-1.5 hover:bg-[#f6f6f7]"
                  >
                    <span className="mt-1 w-5 text-right font-display text-xs font-semibold text-[#14397a] tabular-nums">
                      {index + 1}.
                    </span>
                    <input
                      value={ach}
                      onChange={(e) => updateAchievement(index, e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addAchievement();
                        }
                      }}
                      placeholder="e.g. Increased regional sales by 40% in Q3 2024"
                      className="flex-1 bg-transparent py-0.5 text-sm text-[#111318] placeholder-[#b0b3bc] outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => removeAchievement(index)}
                      aria-label="Remove achievement"
                      className="mt-0.5 p-1 text-[#72757f] hover:text-[#b91c1c] cursor-pointer"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </li>
                ))}
              </ol>
              <div className="border-t border-[#e3e3e8] px-3 py-2">
                <button
                  type="button"
                  onClick={addAchievement}
                  className="inline-flex items-center gap-1 text-xs font-medium text-[#72757f] hover:text-[#14397a] cursor-pointer"
                >
                  <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                  Add achievement
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Additional Details */}
        <section className="overflow-hidden rounded-xl border border-[#e3e3e8] bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
          <div className="flex items-center justify-between border-b border-[#e3e3e8] px-5 py-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-[#111318]">
              <span className="flex h-6 w-6 items-center justify-center rounded bg-[#e8edf7] text-[#14397a]">
                <FileText className="h-3.5 w-3.5" aria-hidden="true" />
              </span>
              Additional Details
            </div>
            <span className="text-xs text-[#72757f]">Optional</span>
          </div>
          <div className="space-y-3.5 p-5">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="f-summary" className="text-xs font-medium text-[#3a3d47]">
                Career Summary
              </label>
              <textarea
                id="f-summary"
                rows={3}
                value={formData.summary}
                onChange={(e) => updateField('summary', e.target.value)}
                placeholder="Briefly describe yourself and what makes you a strong candidate..."
                className="w-full rounded-lg border border-[#cccdd4] bg-white px-3 py-2 text-sm text-[#111318] placeholder-[#b0b3bc] outline-none focus:border-[#14397a] focus:ring-2 focus:ring-[#14397a]/15"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="f-languages" className="text-xs font-medium text-[#3a3d47]">
                Languages Spoken
              </label>
              <input
                id="f-languages"
                value={formData.languages}
                onChange={(e) => updateField('languages', e.target.value)}
                placeholder="e.g. English (Fluent), Swahili (Native), French (Conversational)"
                className="w-full rounded-lg border border-[#cccdd4] bg-white px-3 py-2 text-sm text-[#111318] placeholder-[#b0b3bc] outline-none focus:border-[#14397a] focus:ring-2 focus:ring-[#14397a]/15"
              />
            </div>
          </div>
        </section>

        {/* Job Tailoring (Optional) */}
        <section className="overflow-hidden rounded-xl border border-[#e3e3e8] bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
          <div className="flex items-center justify-between border-b border-[#e3e3e8] px-5 py-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-[#111318]">
              <span className="flex h-6 w-6 items-center justify-center rounded bg-[#e8edf7] text-[#14397a]">
                <Target className="h-3.5 w-3.5" aria-hidden="true" />
              </span>
              Tailor to a Job Advert
            </div>
            <span className="text-xs text-[#72757f]">Optional</span>
          </div>
          <div className="space-y-3.5 p-5">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="f-target-company" className="text-xs font-medium text-[#3a3d47]">
                Target Company / Organisation
              </label>
              <input
                id="f-target-company"
                value={formData.targetCompany}
                onChange={(e) => updateField('targetCompany', e.target.value)}
                placeholder="e.g. KCB Bank Kenya, Safaricom PLC, Equity Group"
                className="w-full rounded-lg border border-[#cccdd4] bg-white px-3 py-2 text-sm text-[#111318] placeholder-[#b0b3bc] outline-none focus:border-[#14397a] focus:ring-2 focus:ring-[#14397a]/15"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="f-job-desc" className="text-xs font-medium text-[#3a3d47]">
                Paste Key Job Requirements / Advert Snippet
              </label>
              <textarea
                id="f-job-desc"
                rows={3}
                value={formData.jobDescription}
                onChange={(e) => updateField('jobDescription', e.target.value)}
                placeholder="Optional: paste the role requirements so your CV summary and cover letter match the employer's keywords..."
                className="w-full rounded-lg border border-[#cccdd4] bg-white px-3 py-2 text-sm text-[#111318] placeholder-[#b0b3bc] outline-none focus:border-[#14397a] focus:ring-2 focus:ring-[#14397a]/15"
              />
            </div>
          </div>
        </section>

        <button
          type="submit"
          disabled={isSubmitting}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-[#14397a] px-6 py-3.5 text-sm font-semibold text-white shadow-[0_2px_10px_rgba(20,57,122,0.2)] transition-colors hover:bg-[#1d52b0] disabled:opacity-50 cursor-pointer"
        >
          Build My CV &amp; Cover Letter
        </button>
      </form>

      {/* Experience Modal */}
      {expModalOpen && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setExpModalOpen(false);
          }}
          className="fixed inset-0 z-50 flex items-end justify-center bg-[#111318]/40 p-3 backdrop-blur-[2px] sm:items-center sm:p-5"
        >
          <div className="w-full max-w-[540px] max-h-[90vh] overflow-y-auto rounded-xl border border-[#e3e3e8] bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-[#e3e3e8] px-5 py-3.5">
              <h2 className="text-sm font-semibold text-[#111318]">
                Work Experience
              </h2>
              <button
                type="button"
                onClick={() => setExpModalOpen(false)}
                aria-label="Close modal"
                className="rounded-md border border-[#e3e3e8] bg-[#f6f6f7] p-1 text-[#72757f] hover:text-[#b91c1c] cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-3.5 p-5">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-[#3a3d47]">
                    Job Title <span className="text-[#b91c1c]">*</span>
                  </label>
                  <input
                    value={expTitle}
                    onChange={(e) => setExpTitle(e.target.value)}
                    placeholder="e.g. Sales Manager"
                    className="w-full rounded-lg border border-[#cccdd4] bg-white px-3 py-2 text-sm text-[#111318] outline-none focus:border-[#14397a] focus:ring-2 focus:ring-[#14397a]/15"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-[#3a3d47]">
                    Company / Organisation <span className="text-[#b91c1c]">*</span>
                  </label>
                  <input
                    value={expCompany}
                    onChange={(e) => setExpCompany(e.target.value)}
                    placeholder="e.g. Safaricom PLC"
                    className="w-full rounded-lg border border-[#cccdd4] bg-white px-3 py-2 text-sm text-[#111318] outline-none focus:border-[#14397a] focus:ring-2 focus:ring-[#14397a]/15"
                  />
                </div>
                <MonthYearField
                  label="Start Date"
                  value={expStart}
                  onChange={setExpStart}
                />
                <MonthYearField
                  label="End Date"
                  value={expEnd}
                  onChange={setExpEnd}
                  allowPresent
                />
              </div>

              <div>
                <p className="mb-1.5 text-xs font-medium text-[#3a3d47]">
                  Key Responsibilities &amp; Achievements
                </p>
                <div className="overflow-hidden rounded-lg border border-[#cccdd4] bg-white">
                  <ul className="divide-y divide-[#efeff1] p-1.5">
                    {expBullets.map((bullet, idx) => (
                      <li
                        key={idx}
                        className="flex items-start gap-2 rounded px-2 py-1 hover:bg-[#f6f6f7]"
                      >
                        <span className="mt-1.5 text-xs text-[#72757f]">•</span>
                        <input
                          value={bullet}
                          onChange={(e) => {
                            const next = [...expBullets];
                            next[idx] = e.target.value;
                            setExpBullets(next);
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              setExpBullets([...expBullets, '']);
                            }
                          }}
                          placeholder="Describe a responsibility or achievement..."
                          className="flex-1 bg-transparent py-1 text-sm text-[#111318] placeholder-[#b0b3bc] outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const next = expBullets.filter((_, i) => i !== idx);
                            setExpBullets(next.length > 0 ? next : ['']);
                          }}
                          aria-label="Remove bullet"
                          className="mt-1 p-1 text-[#72757f] hover:text-[#b91c1c] cursor-pointer"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </li>
                    ))}
                  </ul>
                  <div className="flex items-center justify-between border-t border-[#e3e3e8] px-3 py-2">
                    <button
                      type="button"
                      onClick={() => setExpBullets([...expBullets, ''])}
                      className="inline-flex items-center gap-1 text-xs font-medium text-[#72757f] hover:text-[#14397a] cursor-pointer"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      Add point
                    </button>
                    <span className="font-mono text-[11px] text-[#b0b3bc]">
                      Enter for new line
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-2 border-t border-[#e3e3e8] px-5 py-3">
              <button
                type="button"
                onClick={() => setExpModalOpen(false)}
                className="flex-1 rounded-lg border border-[#cccdd4] bg-white py-2 text-sm font-medium text-[#3a3d47] hover:border-[#72757f] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={saveExperience}
                className="flex-[2] rounded-lg bg-[#14397a] py-2 text-sm font-semibold text-white hover:bg-[#1d52b0] cursor-pointer"
              >
                Save Experience
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Education Modal */}
      {eduModalOpen && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setEduModalOpen(false);
          }}
          className="fixed inset-0 z-50 flex items-end justify-center bg-[#111318]/40 p-3 backdrop-blur-[2px] sm:items-center sm:p-5"
        >
          <div className="w-full max-w-[540px] max-h-[90vh] overflow-y-auto rounded-xl border border-[#e3e3e8] bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-[#e3e3e8] px-5 py-3.5">
              <h2 className="text-sm font-semibold text-[#111318]">
                Education
              </h2>
              <button
                type="button"
                onClick={() => setEduModalOpen(false)}
                aria-label="Close modal"
                className="rounded-md border border-[#e3e3e8] bg-[#f6f6f7] p-1 text-[#72757f] hover:text-[#b91c1c] cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 gap-3.5 p-5 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-[#3a3d47]">
                  Degree / Certificate <span className="text-[#b91c1c]">*</span>
                </label>
                <input
                  value={eduDegree}
                  onChange={(e) => setEduDegree(e.target.value)}
                  placeholder="e.g. Bachelor of Commerce"
                  className="w-full rounded-lg border border-[#cccdd4] bg-white px-3 py-2 text-sm text-[#111318] outline-none focus:border-[#14397a] focus:ring-2 focus:ring-[#14397a]/15"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-[#3a3d47]">
                  Institution <span className="text-[#b91c1c]">*</span>
                </label>
                <input
                  value={eduSchool}
                  onChange={(e) => setEduSchool(e.target.value)}
                  placeholder="e.g. University of Nairobi"
                  className="w-full rounded-lg border border-[#cccdd4] bg-white px-3 py-2 text-sm text-[#111318] outline-none focus:border-[#14397a] focus:ring-2 focus:ring-[#14397a]/15"
                />
              </div>
              <MonthYearField
                label="Graduation Date"
                value={eduYear}
                onChange={setEduYear}
              />
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-[#3a3d47]">
                  Grade / Classification
                </label>
                <input
                  value={eduGrade}
                  onChange={(e) => setEduGrade(e.target.value)}
                  placeholder="e.g. Second Upper, 3.8 GPA"
                  className="w-full rounded-lg border border-[#cccdd4] bg-white px-3 py-2 text-sm text-[#111318] outline-none focus:border-[#14397a] focus:ring-2 focus:ring-[#14397a]/15"
                />
              </div>
            </div>

            <div className="flex gap-2 border-t border-[#e3e3e8] px-5 py-3">
              <button
                type="button"
                onClick={() => setEduModalOpen(false)}
                className="flex-1 rounded-lg border border-[#cccdd4] bg-white py-2 text-sm font-medium text-[#3a3d47] hover:border-[#72757f] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={saveEducation}
                className="flex-[2] rounded-lg bg-[#14397a] py-2 text-sm font-semibold text-white hover:bg-[#1d52b0] cursor-pointer"
              >
                Save Education
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
