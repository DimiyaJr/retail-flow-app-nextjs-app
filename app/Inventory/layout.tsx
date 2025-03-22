export default function InventoryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <section className="absolute inset-0 md:inset-4 bg-white py-8 px-4 md:px-5 sm:px-3">
      {children}
    </section>
  );
}
