import React from 'react';

export type ScreenId = 'landing' | 'form' | 'generating' | 'preview' | 'success';

interface TopBarProps {
  activeScreen: ScreenId;
  onNavigate: (screen: ScreenId) => void;
  onScrollToSection: (sectionId: string) => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  activeScreen,
  onNavigate,
  onScrollToSection,
}) => {
  const handleSectionLink = (sectionId: string) => {
    if (activeScreen !== 'landing') {
      onNavigate('landing');
      setTimeout(() => onScrollToSection(sectionId), 60);
    } else {
      onScrollToSection(sectionId);
    }
  };

  return (
    <header className="sticky top-0 z-40 border-b border-[#e3e3e8] bg-white/95 backdrop-blur-sm">
      <div className="mx-auto flex h-14 max-w-[1160px] items-center justify-between gap-8 px-5 sm:px-7">
        {/* Zone 1: Single text element wordmark */}
        <button
          type="button"
          onClick={() => onNavigate('landing')}
          className="font-display text-xl tracking-tight text-[#111318] whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#14397a]"
        >
          Swift<span className="text-[#14397a]">CV</span>
        </button>

        {/* Zone 2: Concise single-line navigation links */}
        <nav
          aria-label="Primary navigation"
          className="hidden md:flex items-center gap-7 text-sm font-medium text-[#3a3d47]"
        >
          <button
            type="button"
            onClick={() => handleSectionLink('how-it-works')}
            className="hover:text-[#111318] hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            How it works
          </button>
          <button
            type="button"
            onClick={() => handleSectionLink('pricing')}
            className="hover:text-[#111318] hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            Pricing
          </button>
          <button
            type="button"
            onClick={() => onNavigate('form')}
            className="hover:text-[#111318] hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            CV Builder
          </button>
        </nav>

        {/* Zone 3: Single primary action */}
        <div className="flex items-center shrink-0">
          <button
            type="button"
            onClick={() => onNavigate('form')}
            className="rounded-lg bg-[#14397a] px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-[#1d52b0] whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#14397a]"
          >
            Build My CV
          </button>
        </div>
      </div>
    </header>
  );
};
