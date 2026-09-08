import benawaLogo from "../assets/benawa-logo.png";

const SIZE = {
  header: "4rem",
  "2xs": "4.5rem",
  xs: "1.25rem",
  sm: "3.5rem",
  md: "5rem",
  lg: "6rem",
};

export const BenawaLogo = ({ size = "md", className = "" }) => {
  const height = SIZE[size] || SIZE.md;
  return (
    <img
      src={benawaLogo}
      alt="Benawa University"
      className={`benawa-logo object-contain ${className}`.trim()}
      style={{ height, width: "auto", maxHeight: height }}
    />
  );
};
