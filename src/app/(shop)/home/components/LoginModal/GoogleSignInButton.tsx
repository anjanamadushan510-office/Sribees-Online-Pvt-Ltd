"use client";

import React, { useEffect, useRef, useState } from "react";
import { authService } from "@/api/services/auth.service";

/**
 * "Continue with Google", drawn by Google Identity Services.
 *
 * Security notes:
 * - The client ID comes from the server's public app-config at run time; it is
 *   public by design and no client secret exists on the web side.
 * - Every attempt gets a fresh random nonce. Google signs its SHA-256 into the
 *   ID token and the server checks the raw value, so a token lifted from
 *   another sign-in cannot be replayed here.
 * - The ID token goes straight to our server and is never stored or logged.
 */

const GSI_SRC = "https://accounts.google.com/gsi/client";

interface GoogleCredentialResponse {
  credential?: string;
}

interface GoogleAccountsId {
  initialize: (config: {
    client_id: string;
    callback: (response: GoogleCredentialResponse) => void;
    nonce?: string;
    ux_mode?: "popup" | "redirect";
    auto_select?: boolean;
    cancel_on_tap_outside?: boolean;
    use_fedcm_for_button?: boolean;
  }) => void;
  renderButton: (
    parent: HTMLElement,
    options: Record<string, string | number>,
  ) => void;
}

declare global {
  interface Window {
    google?: { accounts?: { id?: GoogleAccountsId } };
  }
}

let gsiScript: Promise<void> | null = null;

const loadGsi = (): Promise<void> => {
  if (window.google?.accounts?.id) return Promise.resolve();
  if (!gsiScript) {
    gsiScript = new Promise<void>((resolve, reject) => {
      const script = document.createElement("script");
      script.src = GSI_SRC;
      script.async = true;
      script.defer = true;
      script.onload = () => resolve();
      script.onerror = () => {
        gsiScript = null;
        reject(new Error("Google sign-in could not be loaded"));
      };
      document.head.appendChild(script);
    });
  }
  return gsiScript;
};

const randomNonce = (): string => {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
};

const sha256Hex = async (value: string): Promise<string> => {
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(value),
  );
  return Array.from(new Uint8Array(digest), (b) =>
    b.toString(16).padStart(2, "0"),
  ).join("");
};

interface GoogleSignInButtonProps {
  /** Called with Google's ID token and the raw nonce it was issued for. */
  onCredential: (idToken: string, nonce: string) => void;
  disabled?: boolean;
}

export const GoogleSignInButton: React.FC<GoogleSignInButtonProps> = ({
  onCredential,
  disabled,
}) => {
  const holder = useRef<HTMLDivElement>(null);
  const callback = useRef(onCredential);
  const [state, setState] = useState<"loading" | "ready" | "unavailable">(
    "loading",
  );

  useEffect(() => {
    callback.current = onCredential;
  }, [onCredential]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const clientId = await authService.getGoogleClientId();
        if (!clientId) throw new Error("Google sign-in is not set up");
        await loadGsi();
        const gsi = window.google?.accounts?.id;
        if (cancelled || !gsi || !holder.current) return;

        const nonce = randomNonce();
        gsi.initialize({
          client_id: clientId,
          nonce: await sha256Hex(nonce),
          ux_mode: "popup",
          auto_select: false,
          cancel_on_tap_outside: true,
          use_fedcm_for_button: true,
          callback: (response) => {
            if (response.credential) {
              callback.current(response.credential, nonce);
            }
          },
        });
        holder.current.innerHTML = "";
        gsi.renderButton(holder.current, {
          type: "standard",
          theme: "outline",
          size: "large",
          text: "continue_with",
          shape: "pill",
          logo_alignment: "center",
          width: Math.min(holder.current.offsetWidth || 320, 400),
        });
        if (!cancelled) setState("ready");
      } catch {
        if (!cancelled) setState("unavailable");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (state === "unavailable") return null;

  return (
    <div
      className={`flex justify-center min-h-[44px] ${
        disabled ? "pointer-events-none opacity-60" : ""
      }`}
      aria-busy={state === "loading"}
    >
      <div ref={holder} className="w-full flex justify-center" />
    </div>
  );
};
