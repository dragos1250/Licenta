import { useEffect, useRef } from "react";
import api from "../lib/api";

const GOOGLE_SCRIPT_SRC = "https://accounts.google.com/gsi/client";

let gisScriptPromise = null;
let googleInitialized = false;
let googleCredentialHandler = null;

function loadGoogleScript() {
  if (window.google?.accounts?.id) {
    return Promise.resolve();
  }

  if (!gisScriptPromise) {
    gisScriptPromise = new Promise((resolve, reject) => {
      const existingScript = document.querySelector(
        `script[src="${GOOGLE_SCRIPT_SRC}"]`
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
      script.src = GOOGLE_SCRIPT_SRC;
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

function initializeGoogleIdentity() {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  if (!clientId) {
    throw new Error("Lipsește VITE_GOOGLE_CLIENT_ID din .env.");
  }

  if (googleInitialized) return;

  window.google.accounts.id.initialize({
    client_id: clientId,
    callback: (response) => {
      googleCredentialHandler?.(response);
    },
  });

  googleInitialized = true;
}

export default function GoogleSignInButton({
  onSuccess,
  onError,
  onNeedsVerification,
}) {
  const buttonRef = useRef(null);

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

    const currentCredentialHandler = async (response) => {
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
    };

    googleCredentialHandler = currentCredentialHandler;

    const renderGoogleButton = async () => {
      try {
        await loadGoogleScript();

        if (cancelled || !buttonRef.current) return;

        initializeGoogleIdentity();

        buttonRef.current.innerHTML = "";

        window.google.accounts.id.renderButton(buttonRef.current, {
          theme: "outline",
          size: "large",
          text: "continue_with",
          shape: "pill",
          width: 320,
        });
      } catch (error) {
        onErrorRef.current?.(error);
      }
    };

    renderGoogleButton();

    return () => {
      cancelled = true;

      if (googleCredentialHandler === currentCredentialHandler) {
        googleCredentialHandler = null;
      }

      if (buttonRef.current) {
        buttonRef.current.innerHTML = "";
      }
    };
  }, []);

  return <div ref={buttonRef} className="mx-auto w-full max-w-[320px]" />;
}
