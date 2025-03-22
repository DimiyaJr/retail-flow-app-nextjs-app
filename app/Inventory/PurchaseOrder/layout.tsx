"use client";
import { useRouter, usePathname } from "next/navigation";
import { useState, useEffect } from "react";

export default function PrurchesOrderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname(); // Get current path
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Auto-close sidebar on resize for larger screens
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsSidebarOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="bg-gray-100 h-screen flex flex-col md:flex-row overflow-hidden">
      {/* Remove Sidebar Toggle Button if user is on the PurchaseOrder page in mobile view */}
      {!pathname.includes("/Inventory/PurchaseOrder") && (
        <button
          className="md:hidden fixed top-4 left-4 p-2 bg-purple-700 text-white rounded-lg shadow-lg z-50"
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        >
          ☰ Menu
        </button>
      )}

      {/* Sidebar (Fixed on large screens, Toggle on Mobile) */}
      <div
        className={`${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 fixed md:relative top-0 left-0 h-screen md:h-full w-64 md:w-20 flex flex-col items-center space-y-6 py-4 bg-white shadow-md transition-transform duration-300 overflow-y-auto`}
      >
        <div className="space-y-6 w-full px-2">
          <ul className="flex flex-col space-y-4 w-full">
            {[
              { href: "/Inventory/Products", img: "/productslogo.svg", alt: "Products" },
              { href: "/Inventory/ProductCategories", img: "/productscatogories.svg", alt: "Categories" },
              { href: "/Inventory/PurchaseOrder", img: "/purchaseorders.svg", alt: "Orders" },
              { href: "/Inventory/Suppliers", img: "/supplier.svg", alt: "Suppliers" },
            ].map((item, index) => (
              <li
                key={index}
                className="p-3 bg-purple-700 hover:bg-purple-500 shadow-lg rounded-lg flex justify-center items-center transition duration-300"
              >
                <a href={item.href}>
                  <img src={item.img} alt={item.alt} className="w-8 h-8" />
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Main Content Area with Scrollable Purchase Orders */}
      <section className="flex flex-1 flex-col mt-5 mx-2 overflow-auto">
        <div className="overflow-x-auto space-y-4"> {/* Enable horizontal scroll */}
          {children}
        </div>
      </section>

      {/* Bottom Scroll Bar for Mobile (Only for Navigation) */}
      <div className="md:hidden fixed bottom-0 left-0 w-full bg-white shadow-lg border-t">
        <div className="flex justify-around p-2 overflow-x-auto">
          {[
            { href: "/Inventory/Products", img: "/productslogo.svg", alt: "Products" },
            { href: "/Inventory/ProductCategories", img: "/productscatogories.svg", alt: "Categories" },
            { href: "/Inventory/PurchaseOrder", img: "/purchaseorders.svg", alt: "Orders" },
            { href: "/Inventory/Suppliers", img: "/supplier.svg", alt: "Suppliers" },
          ].map((item, index) => (
            <a key={index} href={item.href} className="p-2">
              <img src={item.img} alt={item.alt} className="w-8 h-8" />
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}