import { useEffect, useRef } from "react";

declare global {
  interface Window {
    PaystackPop: {
      setup: (options: {
        key: string;
        email: string;
        amount: number;
        currency?: string;
        ref: string;
        metadata?: Record<string, unknown>;
        onClose: () => void;
        callback: (response: { reference: string }) => void;
      }) => { openIframe: () => void };
    };
  }
}

export function usePaystack() {
  const scriptLoaded = useRef(false);

  useEffect(() => {
    if (scriptLoaded.current || document.getElementById("paystack-inline")) return;
    const script = document.createElement("script");
    script.id = "paystack-inline";
    script.src = "https://js.paystack.co/v1/inline.js";
    script.async = true;
    script.onload = () => { scriptLoaded.current = true; };
    document.body.appendChild(script);
    return () => {};
  }, []);

  const openPayment = (options: {
    email: string;
    amount: number;
    ref: string;
    metadata?: Record<string, unknown>;
    onSuccess: (reference: string) => void;
    onClose: () => void;
  }) => {
    if (!window.PaystackPop) {
      options.onClose();
      return;
    }
    const handler = window.PaystackPop.setup({
      key: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY as string,
      email: options.email,
      amount: options.amount,
      currency: "NGN",
      ref: options.ref,
      metadata: options.metadata,
      onClose: options.onClose,
      callback: (response) => options.onSuccess(response.reference),
    });
    handler.openIframe();
  };

  return { openPayment };
}
