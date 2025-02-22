"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Input,
  Button,
  Badge,
  Table,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Spacer,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
  TableColumn,
  ModalContent,
} from "@nextui-org/react";
import { IconEdit, IconTrashX, IconSquareRoundedPlus } from "@tabler/icons-react";
import API_ENPOINTS from "../../API";

export default function ProductCategoriesPage() {
  interface ProductCategory {
    id: string;
    Category: string;
    Status: number;
  }

  const [viewAddItem, setViewAddItem] = useState(false);
  const [viewEditItem, setViewEditItem] = useState(false);
  const [viewDelete, setViewDelete] = useState(false);
  const [selectedProductCategoryId, setSelectedProductCategoryId] = useState<string>("");
  const [productCategoryList, setProductCategoryList] = useState<ProductCategory[]>([]);
  const [categoryName, setCategoryName] = useState("");

  const loadProductCategories = async () => {
    try {
      const response = await axios.get<{ success: string; data: ProductCategory[] }>(
        API_ENPOINTS.GET_PRODUCT_CATEGORIES
      );
      setProductCategoryList(response.data.data || []);
    } catch (error) {
      console.error(error);
    }
  };

  const handleAddProductCategory = async () => {
    if (!categoryName.trim()) return alert("Category name cannot be empty!");
    try {
      await axios.post(API_ENPOINTS.CREATE_PRODUCT_CATEGORY, { category: categoryName });
      setCategoryName("");
      setViewAddItem(false);
      loadProductCategories();
    } catch (error) {
      console.error(error);
    }
  };

  const handleEditProductCategory = (id: string) => {
    setSelectedProductCategoryId(id);
    const product = productCategoryList.find((p) => p.id === id);
    setCategoryName(product?.Category || "");
    setViewEditItem(true);
  };

  const handleUpdateProductCategory = async () => {
    if (!categoryName.trim()) return alert("Category name cannot be empty!");
    try {
      await axios.put(API_ENPOINTS.UPDATE_PRODUCT_CATEGORY, {
        id: selectedProductCategoryId,
        category: categoryName,
      });
      setCategoryName("");
      setViewEditItem(false);
      loadProductCategories();
    } catch (error) {
      console.error(error);
    }
  };

  const handleDeleteConfirm = (id: string) => {
    setSelectedProductCategoryId(id);
    setViewDelete(true);
  };

  const handleDeleteProceed = async () => {
    try {
      await axios.delete(API_ENPOINTS.DELETE_PRODUCT_CATEGORY, {
        params: { id: selectedProductCategoryId },
      });
      setViewDelete(false);
      loadProductCategories();
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    loadProductCategories();
  }, []);

  return (
    <>
      {/* Delete Confirmation Modal */}
      <Modal isOpen={viewDelete} onClose={() => setViewDelete(false)}>
        <ModalContent>
          <ModalHeader>Delete Product Category</ModalHeader>
          <ModalBody>
            <p>Are you sure you want to delete this product category?</p>
          </ModalBody>
          <ModalFooter>
            <Button color="danger" onClick={handleDeleteProceed}>Delete</Button>
            <Button onClick={() => setViewDelete(false)}>Close</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Add Product Category Modal */}
      <Modal isOpen={viewAddItem} onClose={() => setViewAddItem(false)}>
        <ModalContent>
          <ModalHeader>Add New Product Category</ModalHeader>
          <ModalBody>
            <Input
              fullWidth
              label="Category Name"
              placeholder="Electronics"
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
            />
          </ModalBody>
          <ModalFooter>
            <Button onClick={handleAddProductCategory}>Create</Button>
            <Button onClick={() => setViewAddItem(false)}>Close</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Edit Product Category Modal */}
      <Modal isOpen={viewEditItem} onClose={() => setViewEditItem(false)}>
        <ModalContent>
          <ModalHeader>Edit Product Category</ModalHeader>
          <ModalBody>
            <Input
              fullWidth
              label="Category Name"
              placeholder="Electronics"
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
            />
          </ModalBody>
          <ModalFooter>
            <Button onClick={handleUpdateProductCategory}>Update</Button>
            <Button onClick={() => setViewEditItem(false)}>Close</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Main View */}
      <div>
        <div className="sticky top-0 bg-white px-4 pb-4 pt-4 shadow-xl rounded-t-2xl flex justify-between items-center">
          <h1 className="text-3xl font-bold text-purple-800">Product Categories</h1>
          <button
            className="absolute top-4 right-0 linear rounded-[20px] bg-purple-600 px-4 py-2 text-base font-medium text-white transition duration-200 hover:bg-purple-400 active:bg-purple-500 dark:bg-white/5 dark:text-white dark:hover:bg-white/10 dark:active:bg-white/20"
            onClick={() => setViewAddItem(true)}
          >
            Add Product Categories
          </button>
        </div>
        <Spacer y={1} />
        <div style={{ maxHeight: "400px", overflowY: "auto", border: "1px solid #ddd", borderRadius: "8px" }}>
          <Table>
            <TableHeader>
              <TableColumn>Product Category</TableColumn>
              <TableColumn>Status</TableColumn>
              <TableColumn>Actions</TableColumn>
            </TableHeader>
            <TableBody>
              {productCategoryList.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>{product.Category}</TableCell>
                  <TableCell>
                    <Badge color={product.Status === 1 ? "primary" : "danger"}>
                      {product.Status === 1 ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell className="flex gap-2 justify-center">
                    <Button onClick={() => handleEditProductCategory(product.id)}>
                      <IconEdit />
                    </Button>
                    <Button color="secondary" onClick={() => handleDeleteConfirm(product.id)}>
                      <IconTrashX />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </>
  );
}