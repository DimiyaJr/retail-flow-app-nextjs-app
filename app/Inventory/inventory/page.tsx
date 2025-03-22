"use client";
import { title } from "@/components/primitives";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { Table, TableCell, TableRow, TableHeader, TableBody, Image, Badge, TableColumn, Modal, Button } from "@nextui-org/react";
import API_ENPOINTS from "../../API";

interface Product {
  sku: string;
  productName: string;
  category: string;
  intQty: number;
  cost: number;
  price: number;
  image?: string;
}

export default function InventoryPage() {
  const [viewAddItem, setViewAddItem] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);

  const loadProducts = async () => {
    try {
      const response = await axios.get(API_ENPOINTS.GET_PRODUCTS);
      if (Array.isArray(response.data)) {
        setProducts(response.data);
      } else {
        console.error("Unexpected data format:", response.data);
      }
    } catch (error) {
      console.error("Error loading products:", error);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  return (
    <div className="px-2 sm:px-4 md:px-6">
      <Modal
        isOpen={viewAddItem}
        onClose={() => setViewAddItem(false)}
        title="Add New Item"
        size="lg"
        radius="sm"
      >
        <div className="p-5 bg-gray-200">
          <h1 className="text-lg font-semibold">Add a new product</h1>
          {/* Add form for new product */}
        </div>
      </Modal>

      {/* Table Wrapper for Responsive Scrolling */}
      <div className="overflow-x-auto">
        <Table aria-label="Product Inventory">
          <TableHeader>
            <TableColumn className="text-left">SKU</TableColumn>
            <TableColumn className="text-left">Product Name</TableColumn>
            <TableColumn className="text-left">Product Image</TableColumn>
            <TableColumn className="text-left">Category</TableColumn>
            <TableColumn className="text-right">Available Quantity</TableColumn>
            <TableColumn className="text-right">Cost Price</TableColumn>
            <TableColumn className="text-right">Selling Price</TableColumn>
            <TableColumn className="text-right">Stock Status</TableColumn>
          </TableHeader>
          <TableBody>
            {products.map((product) => (
              <TableRow key={product.sku} className="border border-gray-300">
                <TableCell className="text-left p-2">{product.sku}</TableCell>
                <TableCell className="text-left p-2">{product.productName}</TableCell>
                <TableCell className="text-left p-2">
                  {product.image ? (
                    <Image
                      radius="md"
                      height={50}
                      width="auto"
                      src={product.image}
                      className="border border-gray-300 max-w-[50px] sm:max-w-[70px]"
                    />
                  ) : (
                    <Badge color="secondary">No Image</Badge>
                  )}
                </TableCell>
                <TableCell className="text-left p-2">{product.category}</TableCell>
                <TableCell className="text-right p-2">{product.intQty}</TableCell>
                <TableCell className="text-right p-2">${product.cost.toFixed(2)}</TableCell>
                <TableCell className="text-right p-2">${product.price.toFixed(2)}</TableCell>
                <TableCell className="flex justify-end gap-2 p-2">
                  {product.intQty === 0 ? (
                    <Badge color="danger">Out of Stock</Badge>
                  ) : product.intQty < 50 ? (
                    <Badge color="warning">Low in Stock</Badge>
                  ) : (
                    <Badge color="success">In Stock</Badge>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
