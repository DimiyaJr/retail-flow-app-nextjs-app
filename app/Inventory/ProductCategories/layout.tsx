"use client";
import { useRouter } from 'next/navigation';

export default function ProductCategoriesLayout({
    children,
  }: {
    children: React.ReactNode;
  }) {
    const router = useRouter();  
    return (
      
      <div className="bg-gray-100 h-screen flex">
        <div className="flex w-20 flex-col h-screen items-center space-y-6 py-4 bg-white shadow-md">
          <div className="space-y-6 w-full px-2">
            <ul className="flex flex-col space-y-4 w-full">
              <li className="p-3 bg-purple-700 hover:bg-purple-500 shadow-lg rounded-lg flex justify-center items-center transition duration-300">
                <a href="/Inventory/Products">
                  <img src="/productslogo.svg" alt="Products" className="w-8 h-8" />
                </a>
              </li>
              <li className="p-3 bg-purple-700 hover:bg-purple-500 shadow-lg rounded-lg flex justify-center items-center transition duration-300">
                <a href="/Inventory/ProductCategories">
                  <img src="/productscatogories.svg" alt="Product Categories" className="w-8 h-8" />
                </a>
              </li>
              <li className="p-3 bg-purple-700 hover:bg-purple-500 shadow-lg rounded-lg flex justify-center items-center transition duration-300">
                <a href="/Inventory/PurchaseOrder">
                  <img src="/purchaseorders.svg" alt="Purchase Order" className="w-8 h-8" />
                </a>
              </li>
              <li className="p-3 bg-purple-700 hover:bg-purple-500 shadow-lg rounded-lg flex justify-center items-center transition duration-300">
                <a href="/Inventory/Suppliers">
                  <img src="/supplier.svg" alt="Suppliers" className="w-8 h-8" />
                </a>
              </li>
            </ul>
          </div>
        </div>
  
        <section className="flex w-full">
          <div className="xl:ml-50 xl:pl-0 xl:w-full xl:flex xl:flex-col mt-5 mx-2">
            {children}
          </div>
        </section>
      </div>
    );
  }