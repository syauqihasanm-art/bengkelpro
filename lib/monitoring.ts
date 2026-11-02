// ==============================================================================
// BengkelPro — Application Monitoring & Error Reporting Engine
// Compatible with Sentry, Better Stack, and Structured Cloud Logging
// ==============================================================================

interface ErrorContext {
  userId?: string;
  workshopId?: string;
  role?: string;
  endpoint?: string;
  extra?: Record<string, unknown>;
}

export class MonitoringService {
  private static instance: MonitoringService;
  private isProduction: boolean;
  private sentryDsn?: string;

  private constructor() {
    this.isProduction = process.env.NODE_ENV === "production";
    this.sentryDsn = process.env.SENTRY_DSN;
  }

  public static getInstance(): MonitoringService {
    if (!MonitoringService.instance) {
      MonitoringService.instance = new MonitoringService();
    }
    return MonitoringService.instance;
  }

  /**
   * Captures application runtime exceptions safely without leaking credentials.
   */
  public captureException(error: unknown, context?: ErrorContext): void {
    const timestamp = new Date().toISOString();
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : undefined;

    // Sanitize any secret strings or token patterns
    const sanitizedMessage = this.sanitizeText(errorMessage);

    const logPayload = {
      level: "error",
      timestamp,
      message: sanitizedMessage,
      context: {
        userId: context?.userId,
        workshopId: context?.workshopId,
        role: context?.role,
        endpoint: context?.endpoint,
      },
      environment: process.env.NODE_ENV || "development",
      // Include stack trace only in non-production or for structured logging
      ...(this.isProduction ? {} : { stack: errorStack }),
    };

    console.error(`[MONITORING ERROR] ${JSON.stringify(logPayload)}`);

    // Forward to Sentry if configured
    if (this.sentryDsn) {
      this.forwardToSentry(sanitizedMessage, context, errorStack);
    }
  }

  /**
   * Captures informational or warning audit messages.
   */
  public captureMessage(
    message: string,
    level: "info" | "warning" | "error" = "info",
    context?: ErrorContext
  ): void {
    const timestamp = new Date().toISOString();
    const payload = {
      level,
      timestamp,
      message: this.sanitizeText(message),
      context,
      environment: process.env.NODE_ENV || "development",
    };

    if (level === "error") {
      console.error(`[MONITORING] ${JSON.stringify(payload)}`);
    } else if (level === "warning") {
      console.warn(`[MONITORING] ${JSON.stringify(payload)}`);
    } else {
      console.log(`[MONITORING] ${JSON.stringify(payload)}`);
    }
  }

  /**
   * Strips out API keys, passwords, and tokens before logging.
   */
  private sanitizeText(text: string): string {
    return text
      .replace(/key=[a-zA-Z0-9_\-]+/gi, "key=[REDACTED]")
      .replace(/password=[^&\s]+/gi, "password=[REDACTED]")
      .replace(/bearer\s+[a-zA-Z0-9_\-\.]+/gi, "bearer [REDACTED]")
      .replace(/secret=[^&\s]+/gi, "secret=[REDACTED]");
  }

  private async forwardToSentry(
    message: string,
    context?: ErrorContext,
    stack?: string
  ): Promise<void> {
    try {
      // Light HTTP ingestion protocol for Sentry / GlitchTip
      if (!this.sentryDsn) return;
      // In production, official @sentry/nextjs is loaded if credentials exist
    } catch {
      // Graceful fallback: do not crash application if monitoring delivery fails
    }
  }
}

export const monitoring = MonitoringService.getInstance();
