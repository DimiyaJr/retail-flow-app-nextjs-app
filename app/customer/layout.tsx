export default function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <section className="flex w-full px-4 md:px-6">
      {/* Main Content Area */}
      <div className="w-full flex flex-col mt-5">
        {children}
      </div>
    </section>
  );
}
