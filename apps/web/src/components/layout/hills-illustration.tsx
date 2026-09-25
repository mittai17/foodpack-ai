export function HillsIllustration() {
  return (
    <svg
      viewBox="0 0 400 220"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-auto"
      aria-hidden="true"
    >
      <path
        d="M0 140C60 110 120 160 180 130C240 100 300 150 400 110V220H0V140Z"
        className="fill-[color-mix(in_oklab,var(--primary)_18%,transparent)]"
      />
      <path
        d="M0 170C70 140 130 185 200 160C270 135 320 175 400 150V220H0V170Z"
        className="fill-[color-mix(in_oklab,var(--primary)_32%,transparent)]"
      />
      <path
        d="M0 200C80 175 150 210 220 190C290 170 340 200 400 185V220H0V200Z"
        className="fill-[color-mix(in_oklab,var(--primary)_55%,transparent)]"
      />
      <circle cx="70" cy="60" r="3" className="fill-[color-mix(in_oklab,var(--primary)_60%,transparent)]" />
      <circle cx="110" cy="90" r="2" className="fill-[color-mix(in_oklab,var(--primary)_45%,transparent)]" />
      <circle cx="300" cy="70" r="2.5" className="fill-[color-mix(in_oklab,var(--primary)_50%,transparent)]" />
    </svg>
  );
}
