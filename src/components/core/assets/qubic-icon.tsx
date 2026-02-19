interface Props {
  className?: string;
}

export default function QubicIcon({ className }: Props) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M6.74988 2.00023H3.5356C3.23978 2.00023 3 2.16807 3 2.37515V10.6256C3 10.8326 3.23978 11.0005 3.5356 11.0005H6.74988C7.04603 11.0005 7.28581 10.8326 7.28581 10.6256V2.37515C7.28581 2.16807 7.04603 2.00023 6.74988 2.00023ZM12.4644 2H9.25012C8.9543 2 8.71419 2.16807 8.71419 2.37515V13.6249C8.71419 13.8319 8.9543 14 9.25012 14H12.4644C12.7602 14 13 13.8319 13 13.6249V2.37515C13 2.16807 12.7602 2 12.4644 2Z"
        fill="currentColor"
      />
    </svg>
  );
}
