export default function SectionTitle({ children }: { children: string }) {
  return (
    <h2 className="text-sm font-semibold uppercase tracking-wider text-gray border-b border-gray/20 pb-2">
      {children}
    </h2>
  );
}
