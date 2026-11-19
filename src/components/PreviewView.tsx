import React, { useState } from 'react';
import { RotateCcw, ZoomIn, ZoomOut } from 'lucide-react';
import type {
  AppConfigResponse,
  GeneratedDocumentsResponse,
} from '../types/cv';
import {
  CoverLetterDocumentView,
  CvDocumentView,
} from './DocumentTemplates';

interface PaystackPopInstance {
  openIframe: () => void;
}

declare global {
  interface Window {
    PaystackPop?: {
      setup: (options: {
        key: string;
        email: string;
        amount: number;
        currency: string;
        ref: string;
        metadata?: Record<string, unknown>;
        callback: (response: { reference: string }) => void;
        onClose: () => void;
      }) => PaystackPopInstance;
    };
  }
}

interface PreviewViewProps {
  documents: GeneratedDocumentsResponse;
  userEmail: string;
  config: AppConfigResponse;
  isUnlocked: boolean;
  onEditDetails: () => void;
  onPaymentVerified: () => void;
  onDownload: (type: 'cv' | 'cl') => void;
  onNotify: (msg: string) => void;
}

const MIN_ZOOM = 60;
const MAX_ZOOM = 150;
const ZOOM_STEP = 5;

export const PreviewView: React.FC<PreviewViewProps> = ({
  documents,
  userEmail,
  config,
  isUnlocked,
  onEditDetails,
  onPaymentVerified,
  onDownload,
  onNotify,
}) => {
  const [activeTab, setActiveTab] = useState<'cv' | 'cl'>('cv');
  const [isVerifying, setIsVerifying] = useState(false);
  const [zoom, setZoom] = useState<number>(100);

  const formattedPrice = `${config.currency} ${Math.round(
    config.amountKobo / 100
  )}`;

  const adjustZoom = (delta: number) => {
    setZoom((prev) =>
      Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, prev + delta))
    );
  };

  const handlePaystackCheckout = () => {
    if (!config.paystackPublicKey) {
      onNotify(
        'Paystack is not configured yet. Add PAYSTACK_PUBLIC_KEY and PAYSTACK_SECRET_KEY in Settings > Secrets.'
      );
      return;
    }

    if (!window.PaystackPop) {
      onNotify(
        'Paystack checkout script is still loading. Please try again in a moment.'
      );
      return;
    }

    const handler = window.PaystackPop.setup({
      key: config.paystackPublicKey,
      email: userEmail || 'guest@swiftcv.app',
      amount: config.amountKobo,
      currency: config.currency,
      ref: `SCV_${Date.now()}`,
      metadata: {
        custom_fields: [
          {
            display_name: 'Product',
            variable_name: 'product',
            value: 'SwiftCV CV + Cover Letter',
          },
        ],
      },
      callback: async (response: { reference: string }) => {
        setIsVerifying(true);
        try {
          const res = await fetch('/api/paystack/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ reference: response.reference }),
          });
          const data = (await res.json()) as {
            verified?: boolean;
            error?: string;
          };
          if (!res.ok || !data.verified) {
            onNotify(
              data.error ||
                'Payment verification failed. Please contact support with your reference.'
            );
            return;
          }
          onPaymentVerified();
        } catch {
          onNotify('Network error while verifying payment. Please try again.');
        } finally {
          setIsVerifying(false);
        }
      },
      onClose: () => {
        onNotify('Payment cancelled — your documents are still waiting.');
      },
    });

    handler.openIframe();
  };

  return (
    <div className="mx-auto max-w-[880px] px-5 pt-7 pb-20 sm:px-7">
      <div className="mb-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="font-display text-2xl text-[#111318]">
            Your documents are ready
          </h1>
          <p className="text-xs text-[#72757f]">
            {isUnlocked
              ? 'Both documents are unlocked and ready to download'
              : `Preview below — pay ${formattedPrice} to unlock and download`}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={onEditDetails}
            className="rounded-lg border border-[#cccdd4] bg-white px-4 py-2 text-xs font-medium text-[#3a3d47] hover:border-[#72757f] hover:text-[#111318] whitespace-nowrap cursor-pointer"
          >
            Edit details
          </button>
          {isUnlocked ? (
            <button
              type="button"
              onClick={() => onDownload(activeTab)}
              className="rounded-lg bg-[#14397a] px-4 py-2 text-xs font-semibold text-white hover:bg-[#1d52b0] whitespace-nowrap cursor-pointer"
            >
              {activeTab === 'cv' ? 'Download CV' : 'Download Cover Letter'}
            </button>
          ) : (
            <button
              type="button"
              disabled={isVerifying}
              onClick={handlePaystackCheckout}
              className="rounded-lg bg-[#14397a] px-4 py-2 text-xs font-semibold text-white shadow-[0_2px_8px_rgba(20,57,122,0.18)] hover:bg-[#1d52b0] disabled:opacity-60 whitespace-nowrap cursor-pointer"
            >
              {isVerifying
                ? 'Verifying payment...'
                : `Pay ${formattedPrice} & Download`}
            </button>
          )}
        </div>
      </div>

      {/* Segmented Tabs + Zoom Control Bar */}
      <div className="mb-4 flex flex-col gap-3 border-b border-[#e3e3e8] pb-2 sm:flex-row sm:items-center sm:justify-between sm:pb-0">
        <div className="flex">
          <button
            type="button"
            onClick={() => setActiveTab('cv')}
            className={`-mb-px border-b-2 px-4 py-2.5 text-sm transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'cv'
                ? 'border-[#14397a] font-semibold text-[#14397a]'
                : 'border-transparent font-medium text-[#72757f] hover:text-[#111318]'
            }`}
          >
            Curriculum Vitae
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('cl')}
            className={`-mb-px border-b-2 px-4 py-2.5 text-sm transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'cl'
                ? 'border-[#14397a] font-semibold text-[#14397a]'
                : 'border-transparent font-medium text-[#72757f] hover:text-[#111318]'
            }`}
          >
            Cover Letter
          </button>
        </div>

        {/* Document Zoom Control Slider */}
        <div
          aria-label="Document zoom controls"
          className="flex items-center gap-2 self-start rounded-lg border border-[#e3e3e8] bg-white px-2.5 py-1.5 sm:mb-1.5 sm:self-auto"
        >
          <button
            type="button"
            onClick={() => adjustZoom(-ZOOM_STEP)}
            disabled={zoom <= MIN_ZOOM}
            aria-label="Zoom out"
            className="rounded p-1 text-[#3a3d47] transition-colors hover:bg-[#f6f6f7] hover:text-[#111318] disabled:opacity-35 cursor-pointer"
          >
            <ZoomOut className="h-3.5 w-3.5" aria-hidden="true" />
          </button>

          <input
            type="range"
            min={MIN_ZOOM}
            max={MAX_ZOOM}
            step={ZOOM_STEP}
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
            aria-label="Zoom percentage"
            className="h-1.5 w-24 sm:w-28 cursor-pointer accent-[#14397a]"
          />

          <button
            type="button"
            onClick={() => adjustZoom(ZOOM_STEP)}
            disabled={zoom >= MAX_ZOOM}
            aria-label="Zoom in"
            className="rounded p-1 text-[#3a3d47] transition-colors hover:bg-[#f6f6f7] hover:text-[#111318] disabled:opacity-35 cursor-pointer"
          >
            <ZoomIn className="h-3.5 w-3.5" aria-hidden="true" />
          </button>

          <span className="w-10 text-right font-mono text-xs font-medium text-[#111318] tabular-nums">
            {zoom}%
          </span>

          {zoom !== 100 && (
            <button
              type="button"
              onClick={() => setZoom(100)}
              aria-label="Reset zoom to 100%"
              title="Reset zoom"
              className="ml-0.5 rounded p-1 text-[#72757f] transition-colors hover:bg-[#f6f6f7] hover:text-[#14397a] cursor-pointer"
            >
              <RotateCcw className="h-3 w-3" aria-hidden="true" />
            </button>
          )}
        </div>
      </div>

      {/* Document Frame */}
      <div className="relative overflow-hidden rounded-xl border border-[#e3e3e8] bg-white shadow-[0_6px_24px_rgba(0,0,0,0.06)]">
        <div
          className={
            isUnlocked
              ? 'overflow-x-auto'
              : 'max-h-[580px] overflow-x-auto overflow-y-hidden'
          }
        >
          <div
            style={{ zoom: zoom / 100 }}
            className="px-6 py-8 sm:px-12 sm:py-11"
          >
            {activeTab === 'cv' ? (
              <CvDocumentView cv={documents.cv} />
            ) : (
              <CoverLetterDocumentView coverLetter={documents.coverLetter} />
            )}
          </div>
        </div>

        {!isUnlocked && (
          <div className="absolute inset-x-0 bottom-0 flex h-64 flex-col items-center justify-end bg-gradient-to-t from-white via-white/95 to-transparent p-6">
            <div className="w-full max-w-[330px] rounded-xl border border-[#e3e3e8] bg-white px-6 py-5 text-center shadow-[0_8px_28px_rgba(17,19,24,0.1)]">
              <div className="text-xs text-[#72757f] mb-1">
                Unlock both documents
              </div>
              <div className="font-display text-3xl text-[#14397a] mb-3 tabular-nums">
                {formattedPrice}
              </div>
              <button
                type="button"
                disabled={isVerifying}
                onClick={handlePaystackCheckout}
                className="w-full rounded-lg bg-[#14397a] py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#1d52b0] disabled:opacity-60 cursor-pointer"
              >
                {isVerifying
                  ? 'Verifying payment...'
                  : 'Pay with M-Pesa or Card'}
              </button>
              <p className="mt-2.5 text-[11px] text-[#72757f]">
                Secure payment via Paystack · Instant PDF download
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
