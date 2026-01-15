
import { Product, Table, TableStatus, ProductOption } from './types';

const COMMON_ADDONS: ProductOption[] = [
  { name: 'Bacon Extra', price: 4.50 },
  { name: 'Ovo', price: 2.00 },
  { name: 'Queijo Cheddar', price: 3.50 },
  { name: 'Hambúrguer 150g', price: 8.00 },
];

const PIZZA_CRUSTS: ProductOption[] = [
  { name: 'Borda Catupiry', price: 8.00 },
  { name: 'Borda Cheddar', price: 8.00 },
  { name: 'Borda Chocolate', price: 10.00 },
];

export const MOCK_PRODUCTS: Product[] = [
  // PIZZAS
  { 
    id: 'p1', name: 'Calabresa', price: 35.00, category: 'Pizzas', 
    availableSizes: ['P', 'M', 'G'], availableCrusts: PIZZA_CRUSTS 
  },
  { 
    id: 'p2', name: 'Quatro Queijos', price: 42.00, category: 'Pizzas', 
    availableSizes: ['P', 'M', 'G'], availableCrusts: PIZZA_CRUSTS 
  },
  { 
    id: 'p3', name: 'Portuguesa', price: 40.00, category: 'Pizzas', 
    availableSizes: ['P', 'M', 'G'], availableCrusts: PIZZA_CRUSTS 
  },
  { 
    id: 'p4', name: 'Frango com Catupiry', price: 38.00, category: 'Pizzas', 
    availableSizes: ['P', 'M', 'G'], availableCrusts: PIZZA_CRUSTS 
  },

  // HAMBÚRGUERES
  { id: 'h1', name: 'X-Bacon Burger', price: 28.50, category: 'Hambúrgueres', availableAddons: COMMON_ADDONS },
  { id: 'h2', name: 'X-Salada Tradicional', price: 24.00, category: 'Hambúrgueres', availableAddons: COMMON_ADDONS },
  { id: 'h3', name: 'Cheddar Duplo', price: 32.00, category: 'Hambúrgueres', availableAddons: COMMON_ADDONS },
  { id: 'h4', name: 'Veggie Burger', price: 26.00, category: 'Hambúrgueres', availableAddons: COMMON_ADDONS },

  // COMBOS
  { id: 'c1', name: 'Combo Casal (2 Burger + Batata + Refri)', price: 75.00, category: 'Combos' },
  { id: 'c2', name: 'Combo Família (Pizza G + Refri 2L)', price: 65.00, category: 'Combos' },

  // BEBIDAS
  { id: 'b1', name: 'Refrigerante Lata 350ml', price: 6.00, category: 'Bebidas' },
  { id: 'b2', name: 'Refrigerante 2L', price: 14.00, category: 'Bebidas' },
  { id: 'b3', name: 'Suco Natural 500ml', price: 10.00, category: 'Bebidas' },
  { id: 'b4', name: 'Cerveja Long Neck', price: 9.00, category: 'Bebidas' },
];

export const INITIAL_TABLES: Table[] = Array.from({ length: 15 }, (_, i) => ({
  id: i + 1,
  status: TableStatus.FREE,
}));
