/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useState, useCallback } from 'react';
import { X } from 'lucide-react';
import { TopBar, type ScreenId } from './components/TopBar';
import { LandingView } from './components/LandingView';
import { CvFormView } from './components/CvFormView';
import { GeneratingView } from './components/GeneratingView';
import { PreviewView } from './components/PreviewView';
import { SuccessView } from './components/SuccessView';
import type {
  AppConfigResponse,
  CvFormData,
  GeneratedDocumentsResponse,
} from './types/cv';
import {
  buildCoverLetterPrintHtml,
  buildCvPrintHtml,
  printHtmlDocument,
} from './utils/printDocument';

const INITIAL_FORM_DATA: CvFormData = {
  name: '',
  role: '',
  email: '',
  phone: '',
  location: '',
  linkedin: '',
  summary: '',
  languages: '',
  experiences: [],
  education: [],
  skills: [],
  achievements: [''],
};

const DEFAULT_CONFIG: AppConfigResponse = {
  paystackPublicKey: '',
  amountKobo: 5000,
  currency: 'KES',
  hasPaystackSecret: false,
};

export default function App() {
  const [screen, setScreen] = useState<ScreenId>('landing');
  const [formData, setFormData] = useState<CvFormData>(INITIAL_FORM_DATA);
  const [documents, setDocuments] =
    useState<GeneratedDocumentsResponse | null>(null);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [config, setConfig] = useState<AppConfigResponse>(DEFAULT_CONFIG);
  const [toast, setToast] = useState<string | null>(null);
  const [legalModal, setLegalModal] = useState<'privacy' | 'terms' | null>(
    null
  );

  const showToast = useCallback((msg: string) => {
    setToast(msg);
  }, []);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(timer);
  }, [toast]);

  useEffect(() => {
    let active = true;
    fetch('/api/config')
      .then((res) => (res.ok ? res.json() : null))
      .then((data: AppConfigResponse | null) => {
        if (active && data) {
          setConfig(data);
        }
      })
      .catch(() => {
        // Non-blocking: handled at checkout if config fails
      });
    return () => {
      active = false;
    };
  }, []);

  const navigate = (nextScreen: ScreenId) => {
    setScreen(nextScreen);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const scrollToSection = (sectionId: string) => {
    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleGenerate = async () => {
    setIsSubmitting(true);
    setIsUnlocked(false);
    navigate('generating');

    try {
      const cleanedPayload: CvFormData = {
        ...formData,
        achievements: formData.achievements
          .map((a) => a.trim())
          .filter(Boolean),
      };

      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cleanedPayload),
      });

      const data = (await res.json()) as
        | GeneratedDocumentsResponse
        | { error?: string };

      if (!res.ok || !('cv' in data) || !('coverLetter' in data)) {
        const errorMessage =
          'error' in data && data.error
            ? data.error
            : 'Failed to generate documents. Please try again.';
        throw new Error(errorMessage);
      }

      setDocuments(data);
      navigate('preview');
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Unable to generate documents.';
      showToast(message);
      navigate('form');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDownload = (type: 'cv' | 'cl') => {
    if (!documents) return;
    const html =
      type === 'cv'
        ? buildCvPrintHtml(documents.cv)
        : buildCoverLetterPrintHtml(documents.coverLetter);
    printHtmlDocument(html);
  };

  const handleBuildAnother = () => {
    setFormData(INITIAL_FORM_DATA);
    setDocuments(null);
    setIsUnlocked(false);
    navigate('form');
  };

  return (
    <div className="min-h-screen bg-[#f6f6f7] text-[#111318]">
      <TopBar
        activeScreen={screen}
        onNavigate={navigate}
        onScrollToSection={scrollToSection}
      />

      <main>
        {screen === 'landing' && (
          <LandingView
            onStartBuilding={() => navigate('form')}
            onOpenLegal={(type) => setLegalModal(type)}
          />
        )}

        {screen === 'form' && (
          <CvFormView
            formData={formData}
            onChange={setFormData}
            onBackHome={() => navigate('landing')}
            onSubmit={handleGenerate}
            onNotify={showToast}
            isSubmitting={isSubmitting}
          />
        )}

        {screen === 'generating' && <GeneratingView />}

        {screen === 'preview' && documents && (
          <PreviewView
            documents={documents}
            userEmail={formData.email}
            config={config}
            isUnlocked={isUnlocked}
            onEditDetails={() => navigate('form')}
            onPaymentVerified={() => {
              setIsUnlocked(true);
              navigate('success');
            }}
            onDownload={handleDownload}
            onNotify={showToast}
          />
        )}

        {screen === 'success' && documents && (
          <SuccessView
            onDownload={handleDownload}
            onViewDocuments={() => navigate('preview')}
            onBuildAnother={handleBuildAnother}
          />
        )}
      </main>

      {/* Legal Modal */}
      {legalModal && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setLegalModal(null);
          }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#111318]/40 p-4 backdrop-blur-[2px]"
        >
          <div className="w-full max-w-md rounded-xl border border-[#e3e3e8] bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-[#e3e3e8] px-5 py-3.5">
              <h2 className="text-sm font-semibold text-[#111318]">
                {legalModal === 'privacy'
                  ? 'Privacy Policy'
                  : 'Terms of Service'}
              </h2>
              <button
                type="button"
                onClick={() => setLegalModal(null)}
                aria-label="Close legal notice"
                className="rounded-md border border-[#e3e3e8] bg-[#f6f6f7] p-1 text-[#72757f] hover:text-[#111318] cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-3 p-5 text-xs leading-relaxed text-[#3a3d47]">
              {legalModal === 'privacy' ? (
                <>
                  <p>
                    SwiftCV processes your career details solely to draft your
                    CV and cover letter for your active session.
                  </p>
                  <p>
                    Payments are processed directly by Paystack over encrypted
                    connections. SwiftCV does not store M-Pesa PINs or card
                    numbers.
                  </p>
                </>
              ) : (
                <>
                  <p>
                    Each KES 20 unlock covers one generated CV and matching
                    cover letter package. You are responsible for verifying the
                    accuracy of all dates, qualifications, and employment
                    details before submitting job applications.
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast && (
        <div
          role="status"
          aria-live="polite"
          className="fixed right-5 bottom-5 z-50 max-w-xs rounded-lg bg-[#111318] px-4 py-2.5 text-xs font-medium text-white shadow-lg"
        >
          {toast}
        </div>
      )}
    </div>
  );
}
