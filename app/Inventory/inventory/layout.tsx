"use client";
import { useRouter, usePathname } from "next/navigation";
import { useState, useEffect } from "react";

export default function InventoryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname(); // Get current path
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Auto-close sidebar when screen size changes
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
    <div className="bg-white-100 min-h-screen flex flex-col md:flex-row overflow-hidden">
      {/* Sidebar Toggle Button for Mobile */}
      {!pathname.includes("/Inventory") && (
        <button
          className="md:hidden fixed top-4 left-4 p-2 bg-purple-700 text-white rounded-lg shadow-lg z-50"
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        >
          ☰ Menu
        </button>
      )}

      {/* Backdrop Overlay for Mobile Sidebar */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}

      {/* Sidebar (Fixed on Desktop, Toggle on Mobile) */}
      <div
        className={`${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 fixed md:relative top-0 left-0 h-screen md:h-full w-64 md:w-16 flex flex-col items-center space-y-6 py-4 bg-purple-200 shadow-md transition-transform duration-300 overflow-y-auto z-50`}
      >
        <div className="space-y-48 w-full rounded-md bg-purple-700">
          <ul className="flex flex-col space-y-4 w-full">
            <li
              className="p-5 hover:bg-purple-500 transition duration-300"
              onClick={() => router.push("/Inventory/Products")}
            >
              <img
                src="/productslogo.svg"
                alt="Products"
                className="w-8 h-8"
              />
            </li>
            <li
              className="p-5 hover:bg-purple-500 transition duration-300"
              onClick={() => router.push("/Inventory/ProductCategories")}
            >
              <img
                src="/productscatogories.svg"
                alt="Categories"
                className="w-8 h-8"
              />
            </li>
            <li
              className="p-5 hover:bg-purple-500 transition duration-300"
              onClick={() => router.push("/Inventory/PurchaseOrder")}
            >
              <img
                src="/purchaseorders.svg"
                alt="Orders"
                className="w-8 h-8"
              />
            </li>
            <li
              className="p-5 hover:bg-purple-500 transition duration-300"
              onClick={() => router.push("/Inventory/Suppliers")}
            >
              <img
                src="/supplier.svg"
                alt="Suppliers"
                className="w-8 h-8"
              />
            </li>
          </ul>
        </div>
      </div>

      {/* Main Content Area with Snap Scrolling */}
      <section className="flex-1 flex flex-col md:flex-row mt-20 md:mt-5 mx-2 md:mx-4 overflow-y-auto snap-y snap-mandatory h-screen">
        {/* Cards Container */}
        <div className="w-full flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
          {/* Products Card */}
          <div className="w-full md:w-1/4 flex items-center justify-center bg-white p-4 rounded-lg shadow-md snap-start">
            <div className="text-center md:text-left">
              <h2 className="text-lg font-semibold">Products</h2>
              <p>This is the Products card. Swipe down to see the next card.</p>
            </div>
          </div>

          {/* Product Categories Card */}
          <div className="w-full md:w-1/4 flex items-center justify-center bg-white p-4 rounded-lg shadow-md snap-start">
            <div className="text-center md:text-left">
              <h2 className="text-lg font-semibold">Product Categories</h2>
              <p>This is the Product Categories card. Swipe down to see the next card.</p>
            </div>
          </div>

          {/* Purchase Orders Card */}
          <div className="w-full md:w-1/4 flex items-center justify-center bg-white p-4 rounded-lg shadow-md snap-start">
            <div className="text-center md:text-left">
              <h2 className="text-lg font-semibold">Purchase Orders</h2>
              <p>This is the Purchase Orders card. Swipe down to see the next card.</p>
            </div>
          </div>

          {/* Suppliers Card */}
          <div className="w-full md:w-1/4 flex items-center justify-center bg-white p-4 rounded-lg shadow-md snap-start">
            <div className="text-center md:text-left">
              <h2 className="text-lg font-semibold">Suppliers</h2>
              <p>This is the Suppliers card.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom Navigation Bar for Mobile */}
      <div className="md:hidden fixed bottom-0 left-0 w-full bg-white shadow-lg border-t z-40">
        <div className="flex justify-around p-2 overflow-x-auto space-x-0 md:space-x-4">
          <div
            className="flex flex-col items-center text-xs text-gray-700 hover:text-purple-700 py-2"
            onClick={() => router.push("/Inventory/Products")}
          >
            <img
              src="/Shopping-Basket-2--Streamline-Sharp-Remix.svg"
              alt="Products"
              className="w-6 h-6"
            />
            <span className="text-xs mt-1">Products</span>
          </div>
          <div
            className="flex flex-col items-center text-xs text-gray-700 hover:text-purple-700 py-2"
            onClick={() => router.push("/Inventory/ProductCategories")}
          >
            <img
              src="/Tag--Streamline-Flex.svg"
              alt="Categories"
              className="w-6 h-6"
            />
            <span className="text-xs mt-1">Categories</span>
          </div>
          <div
            className="flex flex-col items-center text-xs text-gray-700 hover:text-purple-700 py-2"
            onClick={() => router.push("/Inventory/PurchaseOrder")}
          >
            <img
              src="/Shopping-Cart-Download--Streamline-Ultimate.svg"
              alt="Orders"
              className="w-6 h-6"
            />
            <span className="text-xs mt-1">Orders</span>
          </div>
          <div
            className="flex flex-col items-center text-xs text-gray-700 hover:text-purple-700 py-2"
            onClick={() => router.push("/Inventory/Suppliers")}
          >
            <img
              src="/Business-Product-Supplier-1--Streamline-Freehand.svg"
              alt="Suppliers"
              className="w-6 h-6"
            />
            <span className="text-xs mt-1">Suppliers</span>
          </div>
        </div>
      </div>

    </div>
  );
}
