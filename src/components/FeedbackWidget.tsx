import { useEffect } from "react";

/**
 * Opens the feedback panel, as clicking the floating button does.
 *
 * The widget exposes no API of its own: the loader script renders that button
 * inside a shadow root of its own and keeps the whole open sequence there
 * (loading feedback.js, then dispatching its `init` event). Rather than
 * reimplement that sequence, this clicks the button.
 *
 * Returns false when the widget is not on the page — it is only mounted once
 * NEXT_PUBLIC_FEEDBACK_WIDGET_CHANNEL and its two sibling variables are set —
 * so callers can fall back to a plain link.
 */
export function openFeedbackWidget(): boolean {
  if (typeof document === "undefined") return false;

  const host = document.getElementById(`${WIDGET_SHADOW_ID_PREFIX}loader-shadow`);
  const button = host?.shadowRoot?.querySelector<HTMLButtonElement>("button");

  if (!button) return false;

  // The button toggles, so clicking it while the panel is open would close it.
  if (!button.classList.contains("opened")) button.click();

  return true;
}

// The loader mounts its button as `<div id="stmsg-widget-loader-shadow">`.
const WIDGET_SHADOW_ID_PREFIX = "stmsg-widget-";

interface FeedbackWidgetProps {
  widget?: string;
}

export function FeedbackWidget({ widget = "feedback" }: FeedbackWidgetProps) {
  const apiUrl = process.env.NEXT_PUBLIC_FEEDBACK_WIDGET_API_URL;
  const widgetPath = process.env.NEXT_PUBLIC_FEEDBACK_WIDGET_PATH;
  const channel = process.env.NEXT_PUBLIC_FEEDBACK_WIDGET_CHANNEL;

  useEffect(() => {
    if (!channel || !apiUrl || !widgetPath) return;

    // Initialize the widget array if it doesn't exist
    if (typeof window !== "undefined" && widgetPath) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window as any)._stmsg_widget = (window as any)._stmsg_widget || [];

      // Construct script URLs from the base path
      const loaderScript = `${widgetPath}loader.js`;
      const feedbackScript = `${widgetPath}feedback.js`;

      // Push the widget configuration
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window as any)._stmsg_widget.push([
        "loader",
        "init",
        {
          params: {
            title: "Partager un retour ou une question",
            api: apiUrl,
            channel,
            placeholder: "Saisir votre message...",
            emailPlaceholder: "Renseigner votre email...",
            submitText: "Envoyer le message",
            successText: "Merci pour votre message.",
            successText2:
              "En cas de questions, nous vous répondrons dans les meilleurs délais sur l'email renseigné.",
          },
          script: feedbackScript,
          widget,
          label: "Partager un retour ou une question",
        },
      ]);

      // Load the loader script if not already loaded
      if (!document.querySelector(`script[src="${loaderScript}"]`)) {
        const script = document.createElement("script");
        script.async = true;
        script.src = loaderScript;
        const firstScript = document.getElementsByTagName("script")[0];
        if (firstScript && firstScript.parentNode) {
          firstScript.parentNode.insertBefore(script, firstScript);
        }
      }
    }
  }, [channel, apiUrl, widgetPath, widget]);

  // This component doesn't render anything visible
  // The widget is injected via the script
  return null;
}
