
export enum OrderStatus {
  SENT = 'SENT',
  PREPARING = 'PREPARING',
  READY = 'READY',
  FINISHED = 'FINISHED'
}

export enum OrderType {
  TABLE = 'TABLE',
  DELIVERY = 'DELIVERY'
}

export enum PaymentMethod {
  CASH = 'CASH',
  PIX = 'PIX',
  CARD = 'CARD'
}

export enum TableStatus {
  FREE = 'FREE',
  OPEN = 'OPEN',
  OCCUPIED = 'OCCUPIED'
}

export interface ProductOption {
  name: string;
  price: number;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  image?: string;
  description?: string;
  availableSizes?: string[];
  availableCrusts?: ProductOption[];
  availableAddons?: ProductOption[];
  maxFlavors?: number;
}

export interface OrderItemCustomization {
  size?: string;
  flavors?: string[];
  crust?: ProductOption;
  addons?: ProductOption[];
}

export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  price: number; // Base price + crust + addons
  observation?: string;
  customization?: OrderItemCustomization;
}

export interface Customer {
  name: string;
  phone: string;
  address: string;
}

export interface Order {
  id: string;
  type: OrderType;
  tableId?: number;
  customer?: Customer;
  deliveryFee?: number;
  items: OrderItem[];
  status: OrderStatus;
  total: number;
  paymentMethod?: PaymentMethod;
  isPaid: boolean;
  createdAt: number;
  closedAt?: number;
}

export interface Table {
  id: number;
  status: TableStatus;
}

export interface User {
  id: string;
  name: string;
  role: 'waiter' | 'cashier' | 'admin' | 'kitchen';
}
