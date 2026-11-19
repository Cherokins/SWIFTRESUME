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
