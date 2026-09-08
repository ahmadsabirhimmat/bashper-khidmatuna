import benawaLogo from "../assets/benawa-logo.png";

const SIZE_PX = {
  "2xs": 16,
  xs: 20,
  sm: 56,
  md: 80,
  lg: 96,
};

export const BenawaLogo = ({ size = "md", className = "" }) => {
  const px = SIZE_PX[size] || SIZE_PX.md;
  return (
    <img
      src={benawaLogo}
      alt="Benawa University"
      className={`benawa-logo object-contain ${className}`.trim()}
      style={{ height: px, width: "auto", maxHeight: px, maxWidth: px }}
    />
  );
};
