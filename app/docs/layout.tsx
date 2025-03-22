export default function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col items-center justify-center gap-4 px-4 py-6 sm:py-8 md:py-10">
      <div className="w-full max-w-lg text-center">
        {children}
      </div>
    </section>
  );
}
