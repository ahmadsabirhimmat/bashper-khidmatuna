import { useState } from 'react';

const EyeIcon = ({ open }) =>
  open ? (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M3 3l18 18M10.6 10.7a2.5 2.5 0 003.5 3.5M9.9 5.2A10.5 10.5 0 0121 12c-.7 1.3-1.7 2.5-2.9 3.5M6.1 6.2C4.5 7.5 3.3 9.1 2.5 12c1.6 4.5 5.4 7.5 9.5 7.5 1.5 0 2.9-.4 4.2-1.1"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ) : (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M2.5 12C4.1 7.5 7.9 4.5 12 4.5S19.9 7.5 21.5 12C19.9 16.5 16.1 19.5 12 19.5S4.1 16.5 2.5 12Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );

const PasswordInput = ({
  value,
  onChange,
  name,
  placeholder = '••••••••',
  required = false,
  minLength,
  autoComplete,
  id,
  showLabel = 'Show password',
  hideLabel = 'Hide password',
}) => {
  const [visible, setVisible] = useState(false);

  return (
    <div className="password-field">
      <input
        id={id}
        type={visible ? 'text' : 'password'}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        minLength={minLength}
        autoComplete={autoComplete}
      />
      <button
        type="button"
        className="password-field__toggle"
        onClick={() => setVisible((prev) => !prev)}
        aria-label={visible ? hideLabel : showLabel}
        tabIndex={0}
      >
        <EyeIcon open={visible} />
      </button>
    </div>
  );
};

export default PasswordInput;
