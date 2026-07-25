export interface Product {
  id: string;
  name: string;
  barcode: string;
  price: number;
  stock: number;
  category: string;
}

export let mockProducts: Product[] = [
  { id: "1", name: "Classic White T-Shirt", barcode: "TSHIRT001", price: 15.99, stock: 45, category: "Apparel" },
  { id: "2", name: "Vintage Denim Jeans", barcode: "JEANS002", price: 49.50, stock: 12, category: "Apparel" },
  { id: "3", name: "Leather Jacket", barcode: "JACKET003", price: 120.00, stock: 5, category: "Apparel" },
  { id: "4", name: "Running Sneakers", barcode: "SNEAKER004", price: 85.00, stock: 20, category: "Footwear" },
  { id: "5", name: "Cotton Socks (3-Pack)", barcode: "SOCKS005", price: 9.99, stock: 100, category: "Accessories" },
  { id: "6", name: "Graphic Hoodie", barcode: "HOODIE006", price: 35.00, stock: 30, category: "Apparel" },
  { id: "7", name: "Summer Floral Dress", barcode: "DRESS007", price: 42.50, stock: 15, category: "Apparel" },
  { id: "8", name: "Formal Dress Shirt", barcode: "SHIRT008", price: 29.99, stock: 25, category: "Apparel" },
  { id: "9", name: "Silk Tie", barcode: "TIE009", price: 18.00, stock: 40, category: "Accessories" },
  { id: "10", name: "Canvas Tote Bag", barcode: "BAG010", price: 12.00, stock: 60, category: "Accessories" },
];

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  totalSpent: number;
  lastVisit: string;
  status: "Active" | "Inactive";
}

export let mockCustomers: Customer[] = [
  { id: "C001", name: "Alice Johnson", email: "alice@example.com", phone: "555-0101", totalSpent: 450.00, lastVisit: "2026-07-15", status: "Active" },
  { id: "C002", name: "Bob Smith", email: "bob.smith@example.com", phone: "555-0102", totalSpent: 120.50, lastVisit: "2026-06-20", status: "Inactive" },
  { id: "C003", name: "Charlie Davis", email: "charlie.d@example.com", phone: "555-0103", totalSpent: 890.75, lastVisit: "2026-07-18", status: "Active" },
  { id: "C004", name: "Diana Prince", email: "diana@example.com", phone: "555-0104", totalSpent: 310.20, lastVisit: "2026-07-10", status: "Active" },
  { id: "C005", name: "Evan Wright", email: "evan.w@example.com", phone: "555-0105", totalSpent: 55.00, lastVisit: "2026-05-05", status: "Inactive" },
];

export interface SalesDataPoint {
  date: string;
  revenue: number;
  orders: number;
}

export const mockSalesData: SalesDataPoint[] = [
  { date: "Jul 12", revenue: 450, orders: 12 },
  { date: "Jul 13", revenue: 520, orders: 15 },
  { date: "Jul 14", revenue: 380, orders: 9 },
  { date: "Jul 15", revenue: 650, orders: 18 },
  { date: "Jul 16", revenue: 490, orders: 14 },
  { date: "Jul 17", revenue: 720, orders: 22 },
  { date: "Jul 18", revenue: 850, orders: 26 },
];

export interface CategoryDataPoint {
  name: string;
  value: number;
}

export const mockCategoryData: CategoryDataPoint[] = [
  { name: "Apparel", value: 65 },
  { name: "Footwear", value: 20 },
  { name: "Accessories", value: 15 },
];

export interface Supplier {
  id: string;
  name: string;
  contactPerson: string;
  phone: string;
  email: string;
  category: string;
  status: "Active" | "Inactive";
}

export let mockSuppliers: Supplier[] = [
  { id: "S001", name: "Global Threads Inc.", contactPerson: "Sarah Connor", phone: "555-1001", email: "sarah@globalthreads.com", category: "Apparel", status: "Active" },
  { id: "S002", name: "Prime Footwear Co.", contactPerson: "Mike Ross", phone: "555-1002", email: "mike@primefootwear.com", category: "Footwear", status: "Active" },
  { id: "S003", name: "Accessorize Logistics", contactPerson: "Rachel Green", phone: "555-1003", email: "rachel@acc-logistics.com", category: "Accessories", status: "Active" },
  { id: "S004", name: "Vintage Supplies LLC", contactPerson: "Harvey Specter", phone: "555-1004", email: "harvey@vintagesupplies.com", category: "Apparel", status: "Inactive" },
];

export interface Expense {
  id: string;
  date: string;
  category: string;
  description: string;
  amount: number;
}

export let mockExpenses: Expense[] = [
  { id: "E001", date: "2026-07-01", category: "Rent", description: "Monthly Shop Rent", amount: 2500.00 },
  { id: "E002", date: "2026-07-05", category: "Utilities", description: "Electricity Bill", amount: 350.00 },
  { id: "E003", date: "2026-07-10", category: "Marketing", description: "Facebook Ads Campaign", amount: 500.00 },
  { id: "E004", date: "2026-07-12", category: "Supplies", description: "Shopping Bags & Packaging", amount: 150.00 },
  { id: "E005", date: "2026-07-15", category: "Software", description: "POS System Subscription", amount: 99.00 },
];

export interface PurchaseItem {
  id: string;
  name: string;
  quantity: number;
  rate: number;
  gstPercent: number;
}

export interface PurchaseBill {
  id: string;
  invoiceNo: string;
  supplierId: string;
  date: string;
  items: PurchaseItem[];
  subtotal: number;
  totalGst: number;
  grandTotal: number;
  cashPaid: number;
}

export let mockPurchases: PurchaseBill[] = [];

