type PasswordToggleIconProps = {
  visible: boolean;
};

export default function PasswordToggleIcon({ visible }: PasswordToggleIconProps) {
  if (visible) {
    return (
      <svg
        aria-hidden="true"
        className="password-toggle-icon"
        fill="none"
        viewBox="0 0 24 24"
      >
        <path
          d="M3 3L21 21"
          stroke="currentColor"
          strokeLinecap="round"
          strokeWidth="1.8"
        />
        <path
          d="M10.58 6.41C11.03 6.31 11.5 6.25 12 6.25C16.45 6.25 20.07 8.6 21.75 12C21.04 13.43 19.99 14.66 18.7 15.57"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.8"
        />
        <path
          d="M14.83 14.83C14.11 15.55 13.1 16 12 16C9.79 16 8 14.21 8 12C8 10.9 8.45 9.89 9.17 9.17"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.8"
        />
        <path
          d="M6.1 6.11C4.56 7.08 3.26 8.41 2.25 12C3.93 15.4 7.55 17.75 12 17.75C13.38 17.75 14.69 17.52 15.89 17.09"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.8"
        />
      </svg>
    );
  }

  return (
    <svg
      aria-hidden="true"
      className="password-toggle-icon"
      fill="none"
      viewBox="0 0 24 24"
    >
      <path
        d="M2.25 12C3.93 8.6 7.55 6.25 12 6.25C16.45 6.25 20.07 8.6 21.75 12C20.07 15.4 16.45 17.75 12 17.75C7.55 17.75 3.93 15.4 2.25 12Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
      <circle
        cx="12"
        cy="12"
        r="2.75"
        stroke="currentColor"
        strokeWidth="1.8"
      />
    </svg>
  );
}
