import { useEffect, useRef } from "react";
import api from "../lib/api";

let gisScriptPromise = null;

function loadGoogleScript() {
  if (window.google?.accounts?.id) {
    return Promise.resolve();
  }

  if (!gisScriptPromise) {
    gisScriptPromise = new Promise((resolve, reject) => {
      const existingScript = document.querySelector(
        'script[src="https://accounts.google.com/gsi/client"]'
      );

      if (existingScript) {
        if (window.google?.accounts?.id) {
          resolve();
          return;
        }

        existingScript.addEventListener("load", () => resolve(), {
          once: true,
        });
        existingScript.addEventListener(
          "error",
          () => reject(new Error("Nu am putut încărca scriptul Google.")),
          { once: true }
        );
        return;
      }

      const script = document.createElement("script");
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;
      script.onload = () => resolve();
      script.onerror = () =>
        reject(new Error("Nu am putut încărca scriptul Google."));
      document.head.appendChild(script);
    });
  }

  return gisScriptPromise;
}

export default function GoogleSignInButton({
  onSuccess,
  onError,
  onNeedsVerification,
}) {
  const buttonRef = useRef(null);
  const initializedRef = useRef(false);

  const onSuccessRef = useRef(onSuccess);
  const onErrorRef = useRef(onError);
  const onNeedsVerificationRef = useRef(onNeedsVerification);

  useEffect(() => {
    onSuccessRef.current = onSuccess;
  }, [onSuccess]);

  useEffect(() => {
    onErrorRef.current = onError;
  }, [onError]);

  useEffect(() => {
    onNeedsVerificationRef.current = onNeedsVerification;
  }, [onNeedsVerification]);

  useEffect(() => {
    let cancelled = false;

    const initGoogle = async () => {
      try {
        await loadGoogleScript();

        if (cancelled || !buttonRef.current || initializedRef.current) return;

        window.google.accounts.id.initialize({
          client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
          callback: async (response) => {
            try {
              const { data } = await api.post("/auth/google", {
                credential: response.credential,
              });

              if (data?.requiresEmailVerification) {
                onNeedsVerificationRef.current?.(data);
                return;
              }

              onSuccessRef.current?.(data);
            } catch (error) {
              onErrorRef.current?.(error);
            }
          },
        });

        buttonRef.current.innerHTML = "";

        window.google.accounts.id.renderButton(buttonRef.current, {
          theme: "outline",
          size: "large",
          text: "continue_with",
          shape: "pill",
          width: 320,
        });

        initializedRef.current = true;
      } catch (error) {
        onErrorRef.current?.(error);
      }
    };

    initGoogle();

    return () => {
      cancelled = true;
    };
  }, []);

  return <div ref={buttonRef} className="mx-auto w-full max-w-[320px]" />;
}