import { useMemo, useState } from "react";
import onboardingImageOne from "../../../../assets/images/onboarding-1.png";
import onboardingImageTwo from "../../../../assets/images/onboarding-2.png";
import onboardingImageThree from "../../../../assets/images/onboarding-3.png";
import type { PwaInstallState } from "../hooks/usePwaInstall";
import PwaInstallCard from "./PwaInstallCard";

type OnboardingScreenProps = {
  install: PwaInstallState;
  onComplete: () => void;
};

type OnboardingSlide = {
  description: string;
  id: string;
  image: string;
  showGreenDot?: boolean;
  subtitle: string;
  title: string;
};

const slides: OnboardingSlide[] = [
  {
    description:
      "Helping you connect with customer, optimize routes, and ensure compliance, effortlessly.",
    id: "1",
    image: onboardingImageOne,
    subtitle: "Your Intelligent Field Companion",
    title: "Welcome to Promolocation",
  },
  {
    description:
      "We’ll guide you to designated with “Activation Zones” and keep you informed of your real-time compliance status.",
    id: "2",
    image: onboardingImageTwo,
    showGreenDot: true,
    subtitle: "Activation Zones",
    title: "Navigate with Confidence",
  },
  {
    description:
      "Access real-time maps, and efficiently plan your visits for maximum impact.",
    id: "3",
    image: onboardingImageThree,
    subtitle: "Plan Your Perfect Day",
    title: "Smart Route, Better Result",
  },
];

export default function OnboardingScreen({
  install,
  onComplete,
}: OnboardingScreenProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const activeSlide = useMemo(() => slides[currentIndex], [currentIndex]);

  const goToNextSlide = () => {
    setCurrentIndex((currentValue) =>
      Math.min(currentValue + 1, slides.length - 1),
    );
  };

  return (
    <main className="onboarding-shell">
      <section className="onboarding-card">
        <header className="onboarding-header">
          <div className="onboarding-header-placeholder" />
          {currentIndex < slides.length - 1 ? (
            <button
              className="onboarding-skip-button"
              onClick={onComplete}
              type="button"
            >
              Skip
            </button>
          ) : (
            <div className="onboarding-header-placeholder" />
          )}
        </header>

        <div className="onboarding-slide">
          <img
            alt={activeSlide.title}
            className="onboarding-slide-image"
            src={activeSlide.image}
          />

          <div className="onboarding-copy">
            <h1 className="onboarding-title">{activeSlide.title}</h1>
            <div className="onboarding-subtitle-row">
              <p className="onboarding-subtitle">{activeSlide.subtitle}</p>
              {activeSlide.showGreenDot ? (
                <span className="onboarding-green-dot" />
              ) : null}
            </div>
            <p className="onboarding-description">{activeSlide.description}</p>
          </div>
        </div>

        <div className="onboarding-paginator" role="tablist">
          {slides.map((slide, index) => (
            <button
              aria-label={`Show onboarding slide ${slide.id}`}
              className={`onboarding-dot ${index === currentIndex ? "onboarding-dot-active" : ""}`}
              key={slide.id}
              onClick={() => setCurrentIndex(index)}
              type="button"
            />
          ))}
        </div>

        <PwaInstallCard install={install} variant="onboarding" />

        <footer className="onboarding-footer">
          {currentIndex < slides.length - 1 ? (
            <button
              className="onboarding-next-button"
              onClick={goToNextSlide}
              type="button"
            >
              Next
            </button>
          ) : (
            <div className="onboarding-footer-spacer" />
          )}

          <button
            className="onboarding-start-button"
            onClick={onComplete}
            type="button"
          >
            Get Started
          </button>
        </footer>
      </section>
    </main>
  );
}
