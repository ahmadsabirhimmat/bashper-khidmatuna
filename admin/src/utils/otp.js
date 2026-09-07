import { useEffect, useRef } from 'react';

export const digitsOnlyOtp = (value = '') => String(value).replace(/\D/g, '').slice(0, 6);

export const OTP_FIELD_PROPS = {
  type: 'text',
  inputMode: 'numeric',
  autoComplete: 'one-time-code',
  name: 'one-time-code',
  id: 'one-time-code',
  autoCorrect: 'off',
  autoCapitalize: 'off',
  spellCheck: false,
  autoFocus: true,
  maxLength: 6,
  pattern: '[0-9]*',
  enterKeyHint: 'done',
};

export const useWebOtpAutofill = (onCode, enabled = true) => {
  const onCodeRef = useRef(onCode);
  onCodeRef.current = onCode;

  useEffect(() => {
    if (!enabled || typeof navigator === 'undefined' || !navigator.credentials?.get) {
      return undefined;
    }
    const abort = new AbortController();
    navigator.credentials
      .get({
        otp: { transport: ['sms'] },
        signal: abort.signal,
      })
      .then((credential) => {
        const code = digitsOnlyOtp(credential?.code);
        if (code.length === 6) {
          onCodeRef.current(code);
        }
      })
      .catch(() => undefined);
    return () => abort.abort();
  }, [enabled]);
};
