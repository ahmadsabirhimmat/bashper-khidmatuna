import benawaLogo from "../assets/benawa-logo.png";

const SIZE = {
  "2xs": "h-5 max-w-5",
  xs: "h-6 max-w-6",
  sm: "h-14",
  md: "h-20",
  lg: "h-24",
};

export const BenawaLogo = ({ size = "md", className = "" }) => (
  <img
    src={benawaLogo}
    alt="Benawa University"
    className={`w-auto object-contain ${SIZE[size] || SIZE.md} ${className}`.trim()}
  />
);
