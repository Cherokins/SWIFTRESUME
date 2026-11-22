export type CvTheme = 'navy' | 'charcoal' | 'emerald';

export const CV_THEMES: Record<
  CvTheme,
  { label: string; accent: string; badgeBg: string; badgeText: string }
> = {
  navy: {
    label: 'Classic Navy',
    accent: '#14397a',
    badgeBg: '#e8edf7',
    badgeText: '#14397a',
  },
  charcoal: {
    label: 'Executive Charcoal',
    accent: '#1f2937',
    badgeBg: '#f1f3f5',
    badgeText: '#1f2937',
  },
  emerald: {
    label: 'Forest Emerald',
    accent: '#14532d',
    badgeBg: '#e7f5ec',
    badgeText: '#14532d',
  },
};

export interface ExperienceEntry {
  id: string;
  title: string;
  company: string;
  start: string;
  end: string;
  bullets: string[];
}

export interface EducationEntry {
  id: string;
  degree: string;
  school: string;
  year: string;
  grade: string;
}

export interface CvFormData {
  name: string;
  role: string;
  email: string;
  phone: string;
  location: string;
  linkedin: string;
  targetCompany: string;
  jobDescription: string;
  summary: string;
  languages: string;
  experiences: ExperienceEntry[];
  education: EducationEntry[];
  skills: string[];
  achievements: string[];
}

export interface GeneratedCvExperience {
  role: string;
  company: string;
  dateRange: string;
  bullets: string[];
}

export interface GeneratedCvEducation {
  degree: string;
  institution: string;
  meta: string;
}

export interface GeneratedCvData {
  fullName: string;
  targetRole: string;
  contactItems: string[];
  professionalSummary: string;
  experience: GeneratedCvExperience[];
  education: GeneratedCvEducation[];
  skills: string[];
  achievements: string[];
  languages: string;
}

export interface GeneratedCoverLetterData {
  date: string;
  recipientLines: string[];
  subject: string;
  salutation: string;
  paragraphs: string[];
  closing: string;
  signatureName: string;
}

export interface GeneratedDocumentsResponse {
  cv: GeneratedCvData;
  coverLetter: GeneratedCoverLetterData;
}

export interface AppConfigResponse {
  paystackPublicKey: string;
  amountKobo: number;
  currency: string;
  hasPaystackSecret: boolean;
}
