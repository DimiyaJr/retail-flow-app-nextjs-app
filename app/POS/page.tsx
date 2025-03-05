"use client";

import React, { useState, useEffect, useRef } from "react";
import axios, { AxiosError } from "axios";
import {
  Input,
  Button,
  Switch,
  Table,
  Image,
  Modal,
  Badge,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  ModalContent,
  Chip,
  Autocomplete,
  AutocompleteSection,
  AutocompleteItem,
  DateInput,
  Card,
  SelectItem,
  Select,
  DatePicker,
} from "@nextui-org/react";
import { IconX, IconEdit, IconTrashX } from "@tabler/icons-react";
import API_ENPOINTS from "../API";
import config from "../config";
import { AxiosResponse } from "axios";
import { toPng,toCanvas } from "html-to-image";
import { jsPDF } from "jspdf";
import {getLocalTimeZone, today} from "@internationalized/date";
import {useDateFormatter} from "@react-aria/i18n";
import { NextApiRequest, NextApiResponse } from 'next';
import puppeteer from 'puppeteer';
import { CalendarDate } from "@internationalized/date";

interface Product {
  id: number;
  productName: string;
  price: number;
  quantity?: number;
  discount?: number;
  sku?: string;
  isFree?: boolean; 
}

interface Customer {
  code: string;
  name: string;
  email: string;
  contact: string;
  address: string;
  city: string;
  country: string;
  status: number;
}

export default function POSPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [productsDataSet, setProductsDataSet] = useState<any>([]);
  const [productAutocompleteList, setProductAutocompleteList] = useState<any>([]);
  const [invoiceItemsList, setInvoiceItemsList] = useState<any>([]);
  const [cart, setCart] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState<number>(0);
  const [discount, setDiscount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<string>("cash");
  const [checkoutModalOpen, setCheckoutModalOpen] = useState<boolean>(false);
  const [value, setValue] = useState<Date | null>(null);
  const [postDate, setPostDate] = useState(today(getLocalTimeZone()));
  const [dueDate, setDueDate] = useState(today(getLocalTimeZone()));
  const [productName, setProductName] = useState<string>("");
  const [sku, setSKU] = useState<string>("");
  const [maxDiscount, setMaxDiscount] = useState<number>(0);
  const [customerDataSet, setCustomerDataSet] = useState<any>([]);
  const [customerName, setCustomerName] = useState<any>([]);
  const [contactNumber, setContactNumber] = useState<any>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [customerEmail, setCustomerEmail] = useState<string>("");
  const [maxQty, setMaxQty] = useState<number>(0);
  const modalRef = useRef<HTMLDivElement>(null);
  const [search, setSearch] = useState<any>([]);
  const [invoiceID, setInvoiceID] = useState<string>("");
  let formatter = useDateFormatter({dateStyle: "full"});

  const handleAddToCart = () => {
    if (!selectedProduct) {
        alert("Please select a product.");
        return;
    }

    const existingProduct = cart.find((item) => item.sku === selectedProduct.sku);

    if (discount > maxDiscount) {
        alert(`Discount cannot exceed LKR ${maxDiscount}%`);
        setDiscount(0);
        return;
    }

    if (quantity > maxQty) {
        alert(`Quantity cannot exceed ${maxQty}`);
        setQuantity(0);
        return;
    }

    const totalQuantity = existingProduct
        ? (existingProduct.quantity ?? 0) + quantity
        : quantity;

    if (totalQuantity > maxQty) {
        alert(`Cannot add more than ${maxQty} of ${selectedProduct.productName}`);
        return;
    }

    if (!productName || quantity <= 0) return;

    const newCart = [...cart];
    const itemIndex = newCart.findIndex((item) => item.sku === selectedProduct.sku);

    if (itemIndex > -1) {
        const item = newCart[itemIndex];
        if (item) {
            item.quantity = (item.quantity ?? 0) + quantity;
        }
    } else {
        newCart.push({
            sku: selectedProduct.sku,
            productName,
            quantity,
            price: selectedProduct.price,
            discount,
        } as Product & { isFree?: boolean });
    }

    // **DHP Free Product Conditions**
    if (productName === "DHP") {
        let freeDHP = 0;
        let freeLepto = 0;

        if (quantity >= 200) {
            freeDHP = 50;
            freeLepto = 250;
        } else if (quantity >= 150) {
            freeDHP = 35;
            freeLepto = 185;
        } else if (quantity >= 100) {
            freeDHP = 25;
            freeLepto = 125;
        } else if (quantity >= 50) {
            freeDHP = 12;
            freeLepto = 62;
        }

        if (freeDHP > 0) {
            newCart.push({
                sku: "DHP_FREE",
                productName: "DHP (Free)",
                quantity: freeDHP,
                price: 0,
                discount: 100,
                isFree: true,
            } as Product & { isFree: boolean });

            newCart.push({
                sku: "LEPTO_FREE",
                productName: "Lepto (Free)",
                quantity: freeLepto,
                price: 0,
                discount: 100,
                isFree: true,
            } as Product & { isFree: boolean });
        }
    }

    // **Tri Cat Free Product Conditions (Updated)**
    if (productName === "Tri Cat") {
        let freeTriCat = 0;

        if (quantity >= 300) freeTriCat = 30;
        else if (quantity >= 200) freeTriCat = 20;
        else if (quantity >= 100) freeTriCat = 10;
        else if (quantity >= 10) freeTriCat = 1;

        if (freeTriCat > 0) {
            newCart.push({
                sku: "TRI_CAT_FREE",
                productName: "Tri Cat (Free)",
                quantity: freeTriCat,
                price: 0,
                discount: 100,
                isFree: true,
            } as Product & { isFree: boolean });
        }
    }

    // **Beranil Free Product Conditions**
    if (productName === "Beranil") {
        let freeBeranil = 0;
        if (quantity >= 100) freeBeranil = 10;
        else if (quantity >= 10) freeBeranil = 1;

        if (freeBeranil > 0) {
            newCart.push({
                sku: "BERANIL_FREE",
                productName: "Beranil (Free)",
                quantity: freeBeranil,
                price: 0,
                discount: 100,
                isFree: true,
            } as Product & { isFree: boolean });
        }
    }

    // **Avilin Free Product Conditions**
    if (productName === "Avilin") {
        let freeAvilin = 0;
        if (quantity >= 100) freeAvilin = 10;
        else if (quantity >= 10) freeAvilin = 1;

        if (freeAvilin > 0) {
            newCart.push({
                sku: "AVILIN_FREE",
                productName: "Avilin (Free)",
                quantity: freeAvilin,
                price: 0,
                discount: 100,
                isFree: true,
            } as Product & { isFree: boolean });
        }
    }

    // **Prednisolone Free Product Conditions**
    if (productName === "Prednisolone") {
        let freePrednisolone = 0;
        if (quantity >= 100) freePrednisolone = 10;
        else if (quantity >= 10) freePrednisolone = 1;

        if (freePrednisolone > 0) {
            newCart.push({
                sku: "PREDNISOLONE_FREE",
                productName: "Prednisolone (Free)",
                quantity: freePrednisolone,
                price: 0,
                discount: 100,
                isFree: true,
            } as Product & { isFree: boolean });
        }
    }

    // **Parvo Free Product Conditions**
    if (productName === "Parvo") {
        let freeParvo = 0;
        let freeDilund = 0;

        if (quantity >= 200) {
            freeParvo = 50;
            freeDilund = 250;
        } else if (quantity >= 150) {
            freeParvo = 35;
            freeDilund = 185;
        } else if (quantity >= 100) {
            freeParvo = 25;
            freeDilund = 125;
        } else if (quantity >= 50) {
            freeParvo = 12;
            freeDilund = 62;
        }

        if (freeParvo > 0) {
            newCart.push({
                sku: "PARVO_FREE",
                productName: "Parvo (Free)",
                quantity: freeParvo,
                price: 0,
                discount: 100,
                isFree: true,
            } as Product & { isFree: boolean });

            newCart.push({
                sku: "DILUND_FREE",
                productName: "Dilund (Free)",
                quantity: freeDilund,
                price: 0,
                discount: 100,
                isFree: true,
            } as Product & { isFree: boolean });
        }
    }

    // **Puppy DP Free Product Conditions**
    if (productName === "Puppy DP") {
        newCart.push({
            sku: "DILUND_FREE",
            productName: "Dilund (Free)",
            quantity: quantity, // Same count as Puppy DP
            price: 0,
            discount: 100,
            isFree: true,
        } as Product & { isFree: boolean });
    }

    setCart(newCart);
    setQuantity(0);
    setSelectedProduct(null);
    setProductName("");
    setSKU("");
    setDiscount(0);
};


  const handleRemoveFromCart = (index: number) => {
    setCart((prev) => prev.filter((_, i) => i !== index));
  };

  // Example of a mock function for inventory update
const updateInventory = async (items: Product[]) => {
  // Placeholder for actual inventory update logic.
  console.log("Updating inventory with the following items:", items);
  // Simulate a delay for inventory update (e.g., network request)
  return new Promise((resolve) => setTimeout(resolve, 1000));
};

const handleCheckout = async () => {
  const isConfirmed = window.confirm("Are you sure you want to proceed with checkout?");
  
  if (isConfirmed) {
    // Filter out free items (those with isFree: true) from the cart
    const regularItems = cart.filter((item) => !item.isFree);

    try {
      // Call the updateInventory function with the filtered items (excluding free items)
      await updateInventory(regularItems);

      // Proceed with confirming checkout, show the invoice modal, or finalize the order
      handleConfirmCheckout();  // Continue with your confirmation flow
      setCheckoutModalOpen(true); // Show the invoice modal (if needed)
      
    } catch (error) {
      alert('Failed to update inventory. Please try again.');
    }
  }
};

  
  
  const handleCheckoutClose = () => {
    

    setCheckoutModalOpen(false);
    setContactNumber("");
    setCustomerName("");
    setCart([]);
    setSearch("");
    setSelectedProduct(null);

  };

  const handleConfirmCheckout = async () => {
    let response: AxiosResponse<any, any>;
    try {
      console.log(cart);
      console.log(selectedCustomer);
      const updatePayload = cart.map((item) => ({
        sku: item.sku,
        quantity: item.quantity,
      }));

      console.log(updatePayload);
      response = await axios.put(API_ENPOINTS.UPDATE_INVENTORY, { products: updatePayload });

      alert("Checkout confirmed. Inventory updated successfully.");
      const response_ =await saveInvoiceToDB(); 
      console.log(response_);

     
      setCheckoutModalOpen(true);
      
    } catch (error: unknown) {
      // const axiosError = error as AxiosError;
      if (error instanceof AxiosError) {
        console.error("Error response:", error.response?.data.message);
        alert("Failed to update inventory. Please try again. " + error.response?.data.message);
      } else {
        console.error("An unexpected error occurred:", error);
        alert("An unexpected error occurred. Please try again.");
      }
    }
  };

  const handleProductSelect = (sku: string) => {
    sku = sku.split(' ')[0];
    const product = productsDataSet.find((p :any) => p.sku === sku);
    console.log(productsDataSet)
    if (product) {
      setSelectedProduct(product);
      setProductName(product.productName);
      setSKU(product.sku);
      setMaxQty(product.intQty);
      setMaxDiscount(product.maxDiscount)
    }
  };

  const handleCustomerSelect = (contact: string) => {
    let contact_s =contact.split(" ")[0]
    const customer = customerDataSet.find((p: any) => p.contact === contact_s);
    if (customer) {
      setSelectedCustomer(customer);
      setCustomerName(customer.name);
      setContactNumber(customer.contact);
    }
  };

  // const handleDiscountChange = (val: number | undefined) => {
  //   const product = productsDataSet.find((p : any) => p.sku === sku);
  //   if (product) {
  //     setMaxDiscount(product.maxDiscount);
  //     if (val !== undefined) {
  //       if (val > maxDiscount) {
  //         alert(`Discount cannot exceed LKR ${maxDiscount}%`);
  //         setDiscount(0);
  //         return;
  //       } else {
  //         setDiscount(val);
  //       }
  //     } else {
  //       setDiscount(0);
  //     }
  //   }
  // };

  // const handleQtyChange = (val: number | undefined) => {
  //   console.log(val)
  //   const product = productsDataSet.find((p : any) => p.sku === sku);
  //   console.log(product)
  //   if (product) {
  //     setMaxQty(product.intQty);
  //     if (val !== undefined) {
  //       if (val > maxQty) {
  //         alert(`Quantity cannot exceed ${maxQty}`);
  //         setQuantity(0);
  //       } else {
  //         setQuantity(val);
  //       }
  //     } else {
  //       setQuantity(0);
  //     }
  //   }
  // };

  const calculateDiscountedPrice = (price: number, discount: number): number => {
    return price - price * (discount / 100);
  };
  
  const netTotal = cart
    .reduce((acc, item) => acc + (item.price ?? 0) * (item.quantity ?? 0), 0)
    .toFixed(2);
  
  const cartTotal = cart
    .reduce(
      (acc, item) =>
        acc + calculateDiscountedPrice(item.price ?? 0, item.discount ?? 0) * (item.quantity ?? 0),
      0
    )
    .toFixed(2);
  
  // Convert netTotal and cartTotal to numbers for accurate calculations
  const Totaldiscount = (parseFloat(netTotal) - parseFloat(cartTotal)).toFixed(2);

  console.log(`Net Total: LKR ${netTotal}`);
  console.log(`Cart Total: LKR ${cartTotal}`);
  console.log(`Total Discount: LKR ${Totaldiscount}`);


  const loadProducts = async () => {
    try {
      const response = await axios.get(API_ENPOINTS.GET_PRODUCTS);
      const products = response.data;

      const availableProducts = products.filter((product: any) => product.intQty > 0);

      setProductsDataSet(products);
      const autocompleteList = availableProducts.map((element: any) => `${element.sku} ${element.productName}`);
      
      setProductAutocompleteList(autocompleteList);
    } catch (error) {
      console.log(error);
    }
  };

  const loadCustomer = async () => {
    try {
      const response = await axios.get(API_ENPOINTS.GET_CUSTOMERS);
      const customer = response.data;
      setCustomerDataSet(customer);
    } catch (error) {
      console.log(error);
    }
  };

  const saveCheckoutAsPNG = async () => {
    if (!modalRef.current) {
      alert("Modal content not available for rendering.");
      return;
    }
    try {
      const dataUrl = await toPng(modalRef.current);
      const link = document.createElement("a");
      link.download = invoiceID+".png";
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error("Error capturing modal as PNG:", error);
      alert("Failed to save as PNG.");
    }
  };

  // const sendEmail = (event: React.FormEvent) => {
  //   event.preventDefault();

  //   const templateParams = {
  //     to_name: customerName,
  //     from_name: "Your Business Name",
  //     message: `Thank you for your order! Here is your order summary: Total:  LKR ${cartTotal}`,
  //     email: customerEmail,
  //   };

  //   emailjs.send('YOUR_SERVICE_ID', 'YOUR_TEMPLATE_ID', templateParams, 'YOUR_USER_ID')
  //     .then((response) => {
  //       console.log('Email sent successfully!', response.status, response.text);
  //       alert("Email sent successfully!");
  //     }, (error) => {
  //       console.log('Failed to send email:', error);
  //       alert("Failed to send email.");
  //     });
  // };

  // const generatePDF = async () => {
  //   if (!modalRef.current) return alert("No content to render.");

  //   try {
  //     const dataUrl = await toPng(modalRef.current);
  //     console.log(dataUrl)
  //     const pdf = new jsPDF();
  //     pdf.addImage(dataUrl, "PNG", 0, 0, 210, 297);
  //     pdf.save(invoiceID +".pdf");
  //   } catch (error) {
  //     console.error("Error generating PDF:", error);
  //     alert("Failed to generate PDF.");
  //   }
  // };

  const generatePDF = async () => {
    if (!modalRef.current) return alert("No content to render.");
  
    try {
      const htmlContent = modalRef.current.outerHTML;
  
      // Make a POST request to the API route
      const response = await fetch('/app/api/generate-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ htmlContent, invoiceID }),
      });
  
      if (response.ok) {
        // Create a link to download the PDF
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${invoiceID}.pdf`;
        link.click();
        window.URL.revokeObjectURL(url);
      } else {
        alert('Failed to generate PDF.');
      }
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Failed to generate PDF.");
    }
  };

  const saveInvoiceToDB = async () => {
    // Ensure all necessary details are available
    if (!selectedCustomer) {
      alert("Please select a customer.");
      return;
    }
  
    if (cart.length === 0) {
      alert("Cart is empty. Please add products to the cart.");
      return;
    }
  
    // Prepare the invoice payload
    const invoicePayload = {
      customer: {
        code:selectedCustomer.code,
        name: selectedCustomer.name,
        contact: selectedCustomer.contact,
        email: customerEmail,
        address: selectedCustomer.address,
        city: selectedCustomer.city,
        country: selectedCustomer.country,
      },
      invoice: {
        postDate: postDate.toString(),
        dueDate: dueDate.toString(),
        paymentMethod:paymentMethod,
        totalAmount: parseFloat(cartTotal),
        discountAmount: Totaldiscount,
        netTotal: parseFloat(netTotal),
      },
      cartItems: cart.map((item) => ({
        sku: item.sku,
        name: item.productName,
        quantity: item.quantity,
        price: item.price,
        discount: item.discount || 0,
      })),
    };
  
    try {
      // Replace `API_ENDPOINTS.SAVE_INVOICE` with your actual API endpoint
      console.log(invoicePayload)
      const response = await axios.post(API_ENPOINTS.SAVE_INVOICE, invoicePayload);
  
      alert("Invoice saved successfully!");
      console.log("Invoice Response:", response.data);
      setInvoiceID(response.data.invoiceCode)
  
     
    } catch (error) {
      console.error("Error saving invoice:", error);
      alert("Failed to save invoice. Please try again.");
    }
  };

  const handlePaymentMethodChange = (e :any ) => {
    setPaymentMethod(e.target.value);
  };


  useEffect(() => {
    loadProducts();
    loadCustomer();
    // const today = new Date();
    // setPostDate(today);
    // setDueDate(today);
  }, []);


  
  const renderInvoiceTemplate = () => {
    const rows = cart.map((item) => {
      // Type assertion for item to include isFree field
      const itemWithFree = item as Product & { isFree?: boolean };
    
      return `
        <tr ${itemWithFree.isFree ? 'style="color: green; font-weight: bold;"' : ""}>
          <td>${itemWithFree.quantity}</td>
          <td>${itemWithFree.productName}</td>
          <td>${itemWithFree.isFree ? "Free" : itemWithFree.discount + "%"}</td>
          <td>${itemWithFree.isFree ? "0.00" : itemWithFree.price.toFixed(2)}</td>
          <td>${itemWithFree.isFree ? "0.00" : (calculateDiscountedPrice(itemWithFree.price, itemWithFree.discount || 0) * (itemWithFree.quantity || 0)).toFixed(2)}</td>
        </tr>
      `;
    });
    

    return `
    <style>
    body {
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        margin: 0;
        padding: 0;
        background-color: #f4f6f9;
    }

    .invoice-container {
        width: 95%;
        margin: 30px auto;
        background-color: white;
        border-radius: 8px;
        padding: 5px;
       

    .header {
        text-align: center;
        color: #68bbe3;
        font-size: 24px;
        font-weight: 700;
        margin-bottom: 20px;
    }

    .contact-info {
        text-align: center;
        font-size: 14px;
        color: #555;
        margin-bottom: 30px;
    }
  .customer {
        margin-top: 10px;
    }

    .customer table {
        width: 100%;
        border-collapse: collapse;
        font-size: 10px;
        margin-bottom: 20px;
        
    }

    .customer th, .details td {
        text-align: left;
        padding: 12px;
        border: 1px solid #ddd; 
    }

    .customer th {
        background-color: #7209b7;
        color: white;
        text-transform: uppercase;
    }
  .details {
        margin-top: 5px;
    }


   .details table {
    width: 100%;
    border-collapse: collapse;
    font-size: 12px;
    margin-bottom: 20px;
}

.details th, .details td {
    text-align: left;
    padding: 8px;
    border-left: 1px solid #ddd; 
    border-right: 1px solid #ddd; 
}

.details th:first-child, .details td:first-child {
    border-left: none; 
}

.details th:last-child, .details td:last-child {
    border-right: none;
}

.details th {
    background-color: #68bbe3;
    color: white;
    text-transform: uppercase;
}

.details td {
    background-color: #f9f9f9;
}

    .totals {
        margin-top: 20px;
        font-size: 12px;
        text-align: auto;
    }

    .totals p {
        margin: 10px 0;
    }

    .totals b {
        font-weight: 600;
    }

    .footer {
        margin-top: 40px;
        text-align: center;
        font-size: 14px;
        color: #777;
    }

    .signature {
        margin-top: 40px;
        text-align: center;
        font-size: 14px;
        color: #777;
    }

    .signature p {
        border-top: 1px solid #ddd;
        padding-top: 10px;
        width: 100%;
        text-align: center;
    }

    .button {
        display: inline-block;
        background-color: #0044cc;
        color: white;
        padding: 10px 20px;
        text-decoration: none;
        border-radius: 4px;
        margin-top: 20px;
        font-size: 14px;
        text-align: center;
    }

    .button:hover {
        background-color: #0033a0;
    }

    /* Responsive design */
    @media (max-width: 768px) {
        .invoice-container {
            width: 95%;
        }
        .signature {
            flex-direction: column;
            align-items: center;
        }
    }
</style>

<div class="invoice-container">
    <div class="header">ANURADHA TRANSPORT SERVICES</div>
    <div class="contact-info">
        <p>No. 219, Nawana, Mirigama</p>
        <p>Tel: 077 898 929 | 0770 584 959 | 0772 898 929</p>
 </div>
    <div class="customer">
        <table>
            <tr>
                <td style="border: none; padding: 5px;"><b>Invoice No:</b> ${invoiceID}</td>
                <td style="border: none; padding: 5px;"><b>Date:</b> ${postDate ? formatter.format(postDate.toDate(getLocalTimeZone())) : "--"} 
                </br>
                 <b>Due On:</b> ${dueDate ? formatter.format(dueDate.toDate(getLocalTimeZone())) : "--"}
                </td>
               

                </tr>
            <tr>
                <td style="border: none; padding: 5px;">
                 <b>Brown & Company PLC - Pharmacutical Division
                <br>
                34, Sir Mohomed Macan Marker Mawatha
                <br>
                Colombo 03
                <br>
                Tel : 011 266 3000 </b>
                </td>
                <td style="border: none; padding: 5px;">
                
                 <b>Customer:</b> ${customerName} 
                <br>
                <b>Contact Number:</b>${contactNumber}
                <br>
                <b>Address:</b> ${selectedCustomer?.address || "N/A"}
                </td>
        
            </tr>
              
           
        </table>
    </div>

    <div class="details">
        <table>
            <tr>
                <th>Qty</th>
                <th>Description</th>
                <th>Discount</th>
                <th>Unit Price (LKR)</th>
                <th>Amount (LKR)</th>
            </tr>
            ${rows.join("")}
            <tr>
    <td style="border: none; padding: 5px;"></td>
    <td style="border: none; padding: 5px;"></td>
    <td style="border: none; padding: 5px;"></td>
    <td style="padding: 5px;"><b>Gross Total &emsp;:</b> </td>
    <td style="padding: 5px;"> 
        <p>LKR ${Number(cartTotal).toFixed(2)}</p>
    </tr>
             <tr >
    <td style="border: none; padding: 5px;"></td>
    <td style="border: none; padding: 5px;"></td>
    <td style="border: none; padding: 5px;"></td>
    <td style="padding: 5px;"><b>Discount &emsp;&emsp;:</b> </td>
    <td style="padding: 5px;"> 
        <p>LKR ${Number(Totaldiscount).toFixed(2)}</p></td>
    </tr>
              <tr >
    <td style="border: none; padding: 5px;"></td>
    <td style="border: none; padding: 5px;"></td>
    <td style="border: none; padding: 5px;"></td>
    <td style="padding: 5px;"><b>Net Total &emsp;&emsp;:</b> </td>
    <td style="padding: 5px;"> 
        <p>LKR ${Number(netTotal).toFixed(2)}</p></td>
    </tr>
        </table>

    <div class="footer">
        <p>PLEASE DRAW THE CHEQUE IN FAVOUR OF ANURADHA TRANSPORT SERVICES</p>
    </div>

    <div class="signature">
    <p>Signature of the Purchaser</p>
    </br>
    </div>
        <table>
    <tr>
    <td style="border: none; padding: 15px;">
        <p>Checked by: ____________________________</p>
        </td>
        <td style="border: none; padding: 5px;">
        <p>Customer: ____________________________</p>
        </td>
        </tr>
        </table>

</div>
    `;



  };

  function parseZonedDateTime(arg0: string): any {
    throw new Error("Function not implemented.");
  }

  return (
    <>
      <div className="bg-gray-100 w-screen h-screen py-12 overflow-auto" >
        <div className="mx-auto w-11/12 max-w-7xl bg-white border-0 shadow-lg sm:rounded-3xl px-4 py-6">
          <label className="text-2xl font-bold mb-6 block text-center">POS System</label>
  
          {/* Main Layout: Responsive Flex */}
          <div className="flex flex-col lg:flex-row gap-8">
  
            {/* Left Section: Customer and Product Information */}
            <div className="flex-1 space-y-6">
  
              {/* Customer Information Section */}
              <Card shadow="sm" className="flex flex-col gap-4 p-4">
                <label className="text-lg font-semibold">Search</label>
                <Autocomplete
                  aria-label="customer-search"
                  className="w-full"
                  items={customerDataSet.map((customer :any) => `${customer.contact} ${customer.name}`)}
                  value={search}
                  onInputChange={(val) => {
                    setSearch(val);
                    handleCustomerSelect(val);
                  }}
                  placeholder="Customer Name or Contact Number"
                >
                  {customerDataSet.map((customer : any, index :any) => (
                    <AutocompleteItem key={index} value={`${customer.contact} ${customer.name}`}>
                      {`${customer.contact} ${customer.name}`}
                    </AutocompleteItem>
                  ))}
                </Autocomplete>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="flex flex-col">
                    <h5>Customer Name</h5>
                    <Input value={customerName} readOnly />
                  </div>
                  <div className="flex flex-col">
                    <h5>Contact Number</h5>
                    <Input value={contactNumber} readOnly />
                  </div>
                  <div className="flex flex-col">
                    <h5>Post Date</h5>
                    <DatePicker
                      value={postDate}
                      onChange={(date: CalendarDate | null) => date && setPostDate(date)}
                      label="Select date"
                    />
                  </div>
                  <div className="flex flex-col">
                    <h5>Due Date</h5>
                    <DatePicker
                      value={dueDate}
                      onChange={(date: CalendarDate | null) => date && setDueDate(date)}
                      label="Select date"
                    />
                  </div>
                </div>

              </Card>
  
              {/* Product and Cart Section */}
              <Card shadow="sm" className="flex flex-col gap-4 p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="flex flex-col">
                    <h5>SKU</h5>
                    <Autocomplete
                     
                      items={productAutocompleteList}
                      onInputChange={handleProductSelect}
                    >
                      {productAutocompleteList.map((item :any, index: any) => (
                        <AutocompleteItem key={index} value={item}>
                          {item}
                        </AutocompleteItem>
                      ))}
                    </Autocomplete>
                  </div>
                  <div className="flex flex-col">
                    <h5>Product Name</h5>
                    <Input value={productName} readOnly />
                  </div>
                  <div className="flex flex-col">
                    <h5>Quantity</h5>
                    <Input
                      type="number"
                      value={quantity.toString()}
                      onChange={(e) => {
                        // handleQtyChange(Number(e.target.value));
                        setQuantity(Number(e.target.value));
                      }}
                      min={0}
                      max={maxQty}
                    />
                  </div>
                  <div className="flex flex-col">
                    <h5>Discount</h5>
                    <Input type="number" value={discount.toString()} onChange={(e) => 
                    {

                      // handleDiscountChange(Number(e.target.value));
                      setDiscount(Number(e.target.value))
                    }
                    } min={0}
                    max={maxDiscount} />
                  </div>
                </div>
  
                <Button color="secondary" onClick={handleAddToCart} className="w-full">
                  Add to Cart
                </Button>
  
                {/* Cart Table */}
                <div className="overflow-x-auto">
                  <Table aria-label="Cart Table">
                    <TableHeader>
                      <TableColumn>SKU</TableColumn>
                      <TableColumn>Product</TableColumn>
                      <TableColumn>Quantity</TableColumn>
                      <TableColumn>Discount</TableColumn>
                      <TableColumn>Price</TableColumn>
                      <TableColumn>Discounted Price</TableColumn>
                      <TableColumn>Actions</TableColumn>
                    </TableHeader>
                    <TableBody>
                      {cart.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell>{item.sku}</TableCell>
                          <TableCell>{item.productName}</TableCell>
                          <TableCell>{item.quantity}</TableCell>
                          <TableCell>{item.discount}%</TableCell>
                          <TableCell>LKR {item.price.toFixed(2)}</TableCell>
                          <TableCell>
                            LKR {((item.price ?? 0) * (1 - (item.discount ?? 0) / 100) * (item.quantity ?? 0)).toFixed(2)}
                          </TableCell>
                          <TableCell>
                            <Button variant="light" color="danger" onClick={() => handleRemoveFromCart(index)}>
                              Remove
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </Card>
            </div>
  
            {/* Right Section: Cart Summary */}
            <div className="w-full lg:w-1/3">
              <Card shadow="sm" className="flex flex-col gap-4 p-4">
                <h5 className="font-bold text-lg">Cart Summary</h5>
                {cart.length === 0 && <h4>No items in cart</h4>}
                <div>
                <div className="grid grid-cols-2 gap-4 text-left py-4">
  <h4 className="font-bold">Total:</h4>
  <h4 > LKR {Number(netTotal).toFixed(2)}</h4>
  <h4 className="font-bold">Discount:</h4>
  <h4 >LKR {Number(Totaldiscount).toFixed(2)}</h4>
  <h4 className="font-bold">Net Total: </h4>
  <h4>LKR {Number(cartTotal).toFixed(2)}</h4>
</div>
                  <Select
                    label="Payment Method"
                    selectedKeys={[paymentMethod]}
                    onChange={handlePaymentMethodChange}
                  >
                    <SelectItem key="cash">Cash</SelectItem>
                    <SelectItem key="card">Card</SelectItem>
                    <SelectItem key="online">Online</SelectItem>
                  </Select>
                </div>
                <Button onClick={handleCheckout} color="secondary" className="w-full">
                  Checkout
                </Button>
              </Card>
            </div>
          </div>
        </div>
      </div>
  
      {/* Checkout Modal */}
      <Modal isOpen={checkoutModalOpen} onClose={() => setCheckoutModalOpen(false)} size="xl">
        <ModalContent>
          <ModalHeader>
            {/* <h3 id="modal-title">Invoice</h3> */}
          </ModalHeader>
          <ModalBody>
            <div ref={modalRef} dangerouslySetInnerHTML={{ __html: renderInvoiceTemplate() }} />
          </ModalBody>
          <ModalFooter>
            <Button onClick={generatePDF} color="secondary" fullWidth>
              Export as PDF
            </Button>
            <Button onClick={handleCheckoutClose} color="default" fullWidth >
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}