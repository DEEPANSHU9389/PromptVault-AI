/**
 * Privacy-friendly Analytics & Telemetry Layer for PromptVault AI
 * Supports client-side anonymized event tracking and optional Google Analytics / Plausible integration.
 */

type EventCategory = 'auth' | 'prompt' | 'navigation' | 'ai_generation' | 'system';

interface AnalyticsEvent {
  action: string;
  category: EventCategory;
  label?: string;
  value?: number;
  timestamp?: number;
}

class AnalyticsService {
  private isEnabled: boolean = true;
  private gaMeasurementId: string | null = null;

  constructor() {
    // Check if user has opted out in localStorage
    try {
      const optOut = localStorage.getItem('promptvault_analytics_optout');
      if (optOut === 'true') {
        this.isEnabled = false;
      }
    } catch {
      // Ignore localStorage access errors
    }

    // Check for optional GA4 Measurement ID in env
    this.gaMeasurementId = (import.meta as any).env?.VITE_GA_MEASUREMENT_ID || null;
    if (this.gaMeasurementId && typeof window !== 'undefined' && this.isEnabled) {
      this.initGoogleAnalytics(this.gaMeasurementId);
    }
  }

  private initGoogleAnalytics(id: string) {
    if (typeof document === 'undefined') return;
    if (document.getElementById('ga-script')) return;

    try {
      const script = document.createElement('script');
      script.id = 'ga-script';
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${id}`;
      document.head.appendChild(script);

      (window as any).dataLayer = (window as any).dataLayer || [];
      function gtag(...args: any[]) {
        (window as any).dataLayer.push(args);
      }
      (window as any).gtag = gtag;
      gtag('js', new Date());
      gtag('config', id, { anonymize_ip: true });
    } catch (e) {
      console.warn('[Analytics] Failed to initialize external analytics script:', e);
    }
  }

  public setOptOut(optOut: boolean) {
    this.isEnabled = !optOut;
    try {
      localStorage.setItem('promptvault_analytics_optout', optOut ? 'true' : 'false');
    } catch {
      // Ignore
    }
  }

  public getOptOut(): boolean {
    return !this.isEnabled;
  }

  public trackPageView(path: string) {
    if (!this.isEnabled) return;
    if (typeof window !== 'undefined' && (window as any).gtag && this.gaMeasurementId) {
      (window as any).gtag('event', 'page_view', {
        page_path: path,
      });
    }
  }

  public trackEvent({ action, category, label, value }: AnalyticsEvent) {
    if (!this.isEnabled) return;

    // Send to Google Analytics if initialized
    if (typeof window !== 'undefined' && (window as any).gtag && this.gaMeasurementId) {
      (window as any).gtag('event', action, {
        event_category: category,
        event_label: label,
        value: value,
      });
    }
  }
}

export const analytics = new AnalyticsService();
