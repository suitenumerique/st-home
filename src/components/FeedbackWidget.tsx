import { useEffect } from "react";

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
