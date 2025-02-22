"use client";
import { Card, CardBody, Image } from "@nextui-org/react";
import { useRouter } from "next/navigation";

export default function Inventory() {
  const router = useRouter();

  const list = [
    {
      title: "PRODUCTS",
      img: "/productslogo.svg",
      href: "Inventory/Products",
    },
    {
      title: "PRODUCT CATEGORIES",
      img: "/productscatogories.svg",
      href: "Inventory/ProductCategories",
    },
    {
      title: "PURCHASE ORDERS",
      img: "/purchaseorders.svg",
      href: "Inventory/PurchaseOrder",
    },
  ];

  return (
    <div className="container mx-auto px-4 md:px-16 xl:px-24 max-w-[1300px]">
      <h1 className="text-center text-5xl font-bold text-black pb-12 pt-16">INVENTORY</h1>
      
      <div className="flex justify-center gap-6">
        {list.map((item, index) => (
          <Card
            key={index}
            radius="lg"
            isPressable
            className="w-[220px] h-[250px] bg-purple-500 rounded-xl shadow-lg transform transition-all duration-300 hover:scale-105"
            onClick={() => router.push(item.href)}
          >
            <CardBody className="flex flex-col items-center justify-center p-4">
              <Image
                src={item.img}
                alt={`Image for ${item.title}`}
                className="w-20 h-20 filter brightness-0"
              />
              <p className="text-white text-lg font-semibold mt-4 text-center">
                {item.title}
              </p>
            </CardBody>
          </Card>
        ))}
      </div>
    </div>
  );
}
