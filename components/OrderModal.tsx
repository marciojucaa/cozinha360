
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Product, OrderItem, Order, OrderType, OrderStatus, ProductOption, OrderItemCustomization, PaymentMethod } from '../types';

interface OrderModalProps {
  type: OrderType;
  tableId?: number;
  existingOrder?: Order;
  products: Product[];
  onClose: () => void;
  onSave: (order: Order) => void;
  onCancelOrder?: () => void;
}

export const OrderModal: React.FC<OrderModalProps> = ({ type, tableId, existingOrder, products, onClose, onSave, onCancelOrder }) => {
  const [items, setItems] = useState<OrderItem[]>(existingOrder?.items || []);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [activeMobileTab, setActiveMobileTab] = useState<'menu' | 'cart'>('menu');
  
  // New State for Order Type (Delivery vs Pickup)
  const [isPickup, setIsPickup] = useState(existingOrder?.type === OrderType.DELIVERY && existingOrder?.deliveryFee === 0);

  const [customerInfo, setCustomerInfo] = useState({ 
    name: existingOrder?.customer?.name || '', 
    phone: existingOrder?.customer?.phone || '', 
    address: existingOrder?.customer?.address || '' 
  });
  
  const categoriesRef = useRef<HTMLDivElement>(null);

  // Delivery Fee States
  const [distanceKm, setDistanceKm] = useState<string>(existingOrder?.deliveryFee ? (existingOrder.deliveryFee / 2).toString() : ''); 
  const [ratePerKm, setRatePerKm] = useState<string>('2.00'); 
  const [deliveryFee, setDeliveryFee] = useState<number>(existingOrder?.deliveryFee || 0);

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | undefined>(existingOrder?.paymentMethod);
  const [changeFor, setChangeFor] = useState<string>('');

  // Customization State
  const [customizingProduct, setCustomizingProduct] = useState<Product | null>(null);
  const [currentCustomization, setCurrentCustomization] = useState<OrderItemCustomization>({});
  const [itemObservation, setItemObservation] = useState('');

  useEffect(() => {
    if (isPickup) {
      setDeliveryFee(0);
    } else {
      const km = parseFloat(distanceKm) || 0;
      const rate = parseFloat(ratePerKm) || 0;
      setDeliveryFee(km * rate);
    }
  }, [distanceKm, ratePerKm, isPickup]);

  const categories = useMemo(() => {
    return Array.from(new Set(products.map(p => p.category)));
  }, [products]);

  const allPizzas = useMemo(() => {
    return products.filter(p => p.category === 'Pizzas');
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory ? p.category === selectedCategory : true;
      return matchesSearch && matchesCategory;
    });
  }, [products, searchTerm, selectedCategory]);

  const total = useMemo(() => {
    const itemsTotal = items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    return itemsTotal + (type === OrderType.DELIVERY ? deliveryFee : 0);
  }, [items, deliveryFee, type]);

  const handleCategoryClick = (category: string | null, e: React.MouseEvent) => {
    setSelectedCategory(category);
    const target = e.currentTarget as HTMLElement;
    const container = categoriesRef.current;
    if (container && target) {
      const scrollLeft = target.offsetLeft - (container.offsetWidth / 2) + (target.offsetWidth / 2);
      container.scrollTo({ left: scrollLeft, behavior: 'smooth' });
    }
  };

  const getMaxFlavors = (size?: string) => {
    if (!size) return 1;
    switch (size.toUpperCase()) {
      case 'P': return 1;
      case 'M': return 2;
      case 'G': return 3;
      case 'GG': return 4;
      default: return 1;
    }
  };

  const startCustomization = (product: Product) => {
    const hasOptions = product.availableSizes?.length || product.availableCrusts?.length || product.availableAddons?.length || product.category === 'Pizzas';
    if (!hasOptions) {
      addItemDirectly(product);
      return;
    }
    const defaultSize = product.availableSizes?.[0] || 'M';
    setCustomizingProduct(product);
    setCurrentCustomization({
      size: product.availableSizes?.length ? defaultSize : undefined,
      flavors: product.category === 'Pizzas' ? [product.name] : undefined,
      crust: undefined,
      addons: []
    });
    setItemObservation('');
  };

  const addItemDirectly = (product: Product) => {
    setItems(prev => {
      const existingItem = prev.find(i => i.productId === product.id && !i.customization);
      if (existingItem) {
        return prev.map(i => i.productId === product.id && !i.customization ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, {
        id: Math.random().toString(36).substr(2, 9),
        productId: product.id,
        productName: product.name,
        quantity: 1,
        price: product.price
      }];
    });
  };

  const toggleFlavor = (flavorName: string) => {
    if (!currentCustomization.flavors) return;
    const max = getMaxFlavors(currentCustomization.size);
    
    if (currentCustomization.flavors.includes(flavorName)) {
      if (currentCustomization.flavors.length > 1) {
        setCurrentCustomization(prev => ({
          ...prev,
          flavors: prev.flavors?.filter(f => f !== flavorName)
        }));
      }
    } else if (currentCustomization.flavors.length < max) {
      setCurrentCustomization(prev => ({
        ...prev,
        flavors: [...(prev.flavors || []), flavorName]
      }));
    }
  };

  const toggleAddon = (addon: ProductOption) => {
    setCurrentCustomization(prev => {
      const currentAddons = prev.addons || [];
      const exists = currentAddons.find(a => a.name === addon.name);
      if (exists) {
        return { ...prev, addons: currentAddons.filter(a => a.name !== addon.name) };
      }
      return { ...prev, addons: [...currentAddons, addon] };
    });
  };

  const confirmCustomization = () => {
    if (!customizingProduct) return;
    let finalPrice = customizingProduct.price;
    if (currentCustomization.crust) finalPrice += currentCustomization.crust.price;
    currentCustomization.addons?.forEach(a => finalPrice += a.price);

    const newItem: OrderItem = {
      id: Math.random().toString(36).substr(2, 9),
      productId: customizingProduct.id,
      productName: customizingProduct.category === 'Pizzas' && currentCustomization.flavors 
        ? `Pizza ${currentCustomization.size} - ${currentCustomization.flavors.join(' / ')}` 
        : customizingProduct.name,
      quantity: 1,
      price: finalPrice,
      observation: customizingProduct.category === 'Bebidas' ? undefined : itemObservation,
      customization: currentCustomization
    };
    setItems(prev => [...prev, newItem]);
    setCustomizingProduct(null);
  };

  const handleSave = () => {
    const order: Order = {
      id: existingOrder?.id || Math.random().toString(36).substr(2, 9),
      type,
      tableId,
      customer: type === OrderType.DELIVERY ? customerInfo : undefined,
      deliveryFee: type === OrderType.DELIVERY ? (isPickup ? 0 : deliveryFee) : 0,
      items,
      status: existingOrder?.status || OrderStatus.SENT,
      total,
      paymentMethod,
      isPaid: false,
      createdAt: existingOrder?.createdAt || Date.now()
    };
    onSave(order);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white rounded-[2rem] w-full max-w-5xl h-full max-h-[96vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="p-4 sm:p-6 border-b flex justify-between items-center bg-slate-50 shrink-0">
          <div>
            <h3 className="text-lg sm:text-xl font-bold text-slate-800 leading-tight">
              {existingOrder ? `Editando ${type === OrderType.TABLE ? `Mesa ${tableId}` : 'Delivery'}` : (type === OrderType.TABLE ? `Novo Pedido Mesa ${tableId}` : 'Novo Delivery')}
            </h3>
            <p className="text-[10px] sm:text-xs text-slate-500">
              {existingOrder ? 'Altere os itens ou informações' : 'Adicione produtos e personalize'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {onCancelOrder && (
               <button 
                onClick={onCancelOrder} 
                className="px-2 py-2 text-[10px] font-black text-red-500 hover:bg-red-50 rounded-xl transition-colors uppercase tracking-widest"
              >
                Cancelar
              </button>
            )}
            <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
              <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
        </div>

        {/* Mobile Tab Switcher */}
        <div className="flex md:hidden border-b bg-white shrink-0">
          <button 
            onClick={() => setActiveMobileTab('menu')}
            className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest transition-all border-b-2 ${activeMobileTab === 'menu' ? 'border-[#8B1D1D] text-[#8B1D1D]' : 'border-transparent text-slate-400'}`}
          >
            1. Cardápio
          </button>
          <button 
            onClick={() => setActiveMobileTab('cart')}
            className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest transition-all border-b-2 ${activeMobileTab === 'cart' ? 'border-[#8B1D1D] text-[#8B1D1D]' : 'border-transparent text-slate-400'}`}
          >
            2. Pedido ({items.length})
          </button>
        </div>

        <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
          
          {/* Menu Selection */}
          <div className={`flex-1 p-4 sm:p-6 border-r overflow-y-auto bg-white scrollbar-hide ${activeMobileTab === 'menu' ? 'flex flex-col' : 'hidden md:flex flex-col'}`}>
            <div className="space-y-6 flex-1">
              {/* Search & Categories */}
              <div className="space-y-4 sticky top-0 bg-white z-10 pb-2">
                <div className="relative">
                  <input 
                    type="text" 
                    placeholder="Buscar no cardápio..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-slate-100 border-none rounded-xl focus:ring-2 focus:ring-[#8B1D1D] outline-none transition-all text-sm"
                  />
                  <svg className="absolute left-3 top-3.5 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                </div>

                <div 
                  ref={categoriesRef}
                  className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide"
                >
                  <button 
                    onClick={(e) => handleCategoryClick(null, e)} 
                    className={`px-4 py-2 rounded-full text-[10px] font-bold whitespace-nowrap transition-all ${!selectedCategory ? 'bg-[#8B1D1D] text-white shadow-md' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
                  >
                    TODOS
                  </button>
                  {categories.map(cat => (
                    <button 
                      key={cat} 
                      onClick={(e) => handleCategoryClick(cat, e)} 
                      className={`px-4 py-2 rounded-full text-[10px] font-bold whitespace-nowrap transition-all ${selectedCategory === cat ? 'bg-[#8B1D1D] text-white shadow-md' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
                    >
                      {cat.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              {/* Product Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3 pb-4">
                {filteredProducts.map(p => (
                  <button key={p.id} onClick={() => startCustomization(p)} className="group p-3 sm:p-4 text-left bg-white border border-slate-100 rounded-2xl hover:border-[#8B1D1D]/30 hover:shadow-lg transition-all active:scale-95 flex flex-col justify-between h-full min-h-[110px]">
                    <div>
                      <span className="text-[9px] font-black text-[#8B1D1D]/60 uppercase tracking-widest">{p.category}</span>
                      <p className="font-bold text-slate-700 text-xs sm:text-sm leading-tight mt-1 group-hover:text-[#8B1D1D] transition-colors line-clamp-2">{p.name}</p>
                    </div>
                    <div className="mt-2 flex items-center justify-between">
                      <p className="text-slate-900 font-black text-xs">R$ {p.price.toFixed(2)}</p>
                      <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-[#8B1D1D] group-hover:text-white transition-all"><svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4" /></svg></div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Cart Panel */}
          <div className={`w-full md:w-96 p-4 sm:p-6 bg-slate-50 overflow-y-auto scrollbar-hide pb-32 md:pb-6 ${activeMobileTab === 'cart' ? 'flex flex-col' : 'hidden md:flex flex-col'}`}>
            {type === OrderType.DELIVERY && (
              <div className="space-y-4 mb-6 shrink-0">
                {/* Order Type Selection (Delivery vs Pickup) */}
                <div className="p-4 bg-white rounded-2xl border border-slate-100 shadow-sm space-y-3">
                  <h4 className="font-bold text-slate-400 text-[9px] uppercase tracking-widest leading-none">Tipo de Pedido</h4>
                  <div className="flex items-center gap-6">
                    <button 
                      onClick={() => setIsPickup(false)}
                      className="flex items-center gap-2 group cursor-pointer"
                    >
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${!isPickup ? 'border-[#8B1D1D]' : 'border-slate-200'}`}>
                        {!isPickup && <div className="w-2.5 h-2.5 rounded-full bg-[#8B1D1D] animate-in zoom-in-50"></div>}
                      </div>
                      <span className={`text-xs font-medium transition-colors ${!isPickup ? 'text-slate-900 font-bold' : 'text-slate-500'}`}>Entrega</span>
                    </button>
                    <button 
                      onClick={() => setIsPickup(true)}
                      className="flex items-center gap-2 group cursor-pointer"
                    >
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${isPickup ? 'border-[#8B1D1D]' : 'border-slate-200'}`}>
                        {isPickup && <div className="w-2.5 h-2.5 rounded-full bg-[#8B1D1D] animate-in zoom-in-50"></div>}
                      </div>
                      <span className={`text-xs font-medium transition-colors ${isPickup ? 'text-slate-900 font-bold' : 'text-slate-500'}`}>Retirada no Balcão</span>
                    </button>
                  </div>
                </div>

                <div>
                  <h4 className="font-bold text-slate-400 text-[9px] uppercase tracking-widest mb-2">Informações do Cliente</h4>
                  <div className="grid grid-cols-2 gap-2">
                    <input type="text" placeholder="Nome" className="px-3 py-2 text-xs border rounded-lg bg-white outline-none focus:ring-1 focus:ring-[#8B1D1D]" value={customerInfo.name} onChange={(e) => setCustomerInfo({...customerInfo, name: e.target.value})}/>
                    <input type="text" placeholder="Tel" className="px-3 py-2 text-xs border rounded-lg bg-white outline-none focus:ring-1 focus:ring-[#8B1D1D]" value={customerInfo.phone} onChange={(e) => setCustomerInfo({...customerInfo, phone: e.target.value})}/>
                  </div>
                  {!isPickup && (
                    <input type="text" placeholder="Endereço Completo" className="w-full mt-2 px-3 py-2 text-xs border rounded-lg bg-white outline-none focus:ring-1 focus:ring-[#8B1D1D] animate-in slide-in-from-top-1" value={customerInfo.address} onChange={(e) => setCustomerInfo({...customerInfo, address: e.target.value})}/>
                  )}
                  
                  {/* Delivery Fee by KM - Only shown if not Pickup */}
                  {!isPickup && (
                    <div className="mt-3 p-3 bg-white rounded-xl border border-slate-200 space-y-2 animate-in slide-in-from-top-2">
                      <h5 className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Cálculo de Frete</h5>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <label className="text-[8px] font-bold text-slate-400 uppercase">KM</label>
                          <input type="number" placeholder="0" className="w-full px-2 py-1 text-xs bg-slate-50 rounded-lg outline-none focus:ring-1 focus:ring-[#8B1D1D] font-bold" value={distanceKm} onChange={(e) => setDistanceKm(e.target.value)}/>
                        </div>
                        <div className="space-y-1">
                          <label className="text-[8px] font-bold text-slate-400 uppercase">Taxa p/ KM</label>
                          <input type="number" step="0.10" className="w-full px-2 py-1 text-xs bg-slate-50 rounded-lg outline-none focus:ring-1 focus:ring-[#8B1D1D] font-bold" value={ratePerKm} onChange={(e) => setRatePerKm(e.target.value)}/>
                        </div>
                      </div>
                      <div className="flex justify-between items-center pt-2 border-t border-slate-50">
                        <span className="text-[9px] font-bold text-slate-500">Frete:</span>
                        <span className="text-xs font-black text-[#8B1D1D]">R$ {deliveryFee.toFixed(2)}</span>
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <h4 className="font-bold text-slate-400 text-[9px] uppercase tracking-widest mb-2">Pagamento</h4>
                  <div className="grid grid-cols-3 gap-1">
                    <button onClick={() => setPaymentMethod(PaymentMethod.CASH)} className={`py-2 text-[9px] font-black rounded-lg border transition-all ${paymentMethod === PaymentMethod.CASH ? 'bg-[#8B1D1D] border-[#8B1D1D] text-white shadow-md' : 'bg-white border-slate-200 text-slate-500'}`}>DINHEIRO</button>
                    <button onClick={() => setPaymentMethod(PaymentMethod.PIX)} className={`py-2 text-[9px] font-black rounded-lg border transition-all ${paymentMethod === PaymentMethod.PIX ? 'bg-[#8B1D1D] border-[#8B1D1D] text-white shadow-md' : 'bg-white border-slate-200 text-slate-500'}`}>PIX</button>
                    <button onClick={() => setPaymentMethod(PaymentMethod.CARD)} className={`py-2 text-[9px] font-black rounded-lg border transition-all ${paymentMethod === PaymentMethod.CARD ? 'bg-[#8B1D1D] border-[#8B1D1D] text-white shadow-md' : 'bg-white border-slate-200 text-slate-500'}`}>CARTÃO</button>
                  </div>
                </div>
              </div>
            )}

            <div className="flex-1 space-y-3 shrink-0">
              <h4 className="font-bold text-slate-400 text-[9px] uppercase tracking-widest">Itens do Pedido</h4>
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-slate-300">
                  <svg className="w-8 h-8 mb-2 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
                  <p className="text-[10px] italic">Seu carrinho está vazio</p>
                </div>
              ) : (
                items.map((item, idx) => (
                  <div key={item.id + idx} className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm animate-in slide-in-from-right-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1 pr-2">
                        <div className="flex items-center gap-2">
                          <span className="bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded text-[9px] font-black">{item.quantity}x</span>
                          <p className="text-xs font-bold text-slate-800">{item.productName}</p>
                        </div>
                        {item.customization && (
                          <div className="mt-1 flex flex-wrap gap-1">
                            {item.customization.size && <span className="text-[8px] bg-slate-50 text-slate-500 px-1.5 py-0.5 rounded font-bold">Tam: {item.customization.size}</span>}
                            {item.customization.crust && <span className="text-[8px] bg-emerald-50 text-emerald-600 px-1.5 py-0.5 rounded font-bold">{item.customization.crust.name}</span>}
                            {item.customization.addons?.map(a => (<span key={a.name} className="text-[8px] bg-orange-50 text-orange-600 px-1.5 py-0.5 rounded font-bold">+{a.name}</span>))}
                          </div>
                        )}
                        {item.observation && <p className="text-[9px] text-red-400 italic mt-1 font-medium">* {item.observation}</p>}
                      </div>
                      <div className="text-right flex flex-col items-end">
                        <p className="text-xs font-black text-slate-800">R$ {(item.price * item.quantity).toFixed(2)}</p>
                        <button onClick={() => setItems(prev => prev.filter((_, i) => i !== idx))} className="text-red-300 hover:text-red-500 transition-colors mt-2"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Fixed Action Footer */}
          <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-4 sm:p-6 z-20 shadow-[0_-10px_20px_rgba(0,0,0,0.05)] md:static md:shadow-none md:mt-auto">
            <div className="max-w-md mx-auto">
              <div className="flex justify-between items-center mb-4">
                <div className="text-slate-400 leading-none">
                  <p className="text-[9px] uppercase font-bold tracking-widest mb-0.5">Total Geral</p>
                  <p className="text-[8px] font-medium">{items.length} {items.length === 1 ? 'item selecionado' : 'itens selecionados'}</p>
                </div>
                <span className="text-2xl sm:text-3xl font-black text-slate-800">R$ {total.toFixed(2)}</span>
              </div>
              
              <div className="flex gap-2">
                {activeMobileTab === 'menu' && (
                  <button 
                    onClick={() => setActiveMobileTab('cart')}
                    className="flex-1 py-4 bg-slate-900 text-white rounded-2xl font-black md:hidden uppercase tracking-widest text-[10px] active:scale-95"
                  >
                    Ver Pedido
                  </button>
                )}
                <button 
                  onClick={handleSave}
                  disabled={items.length === 0}
                  className={`py-4 bg-[#8B1D1D] text-white rounded-2xl font-black hover:bg-[#721818] disabled:bg-slate-300 disabled:cursor-not-allowed transition-all shadow-xl shadow-red-900/10 uppercase tracking-widest active:scale-95 text-[10px] ${activeMobileTab === 'menu' ? 'px-6 md:w-full' : 'w-full'}`}
                >
                  {existingOrder ? 'Salvar' : 'Confirmar Pedido'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Customization Overlay Modal */}
        {customizingProduct && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-2 sm:p-4 bg-slate-900/80 backdrop-blur-md">
            <div className="bg-white rounded-[2rem] w-full max-w-lg shadow-2xl flex flex-col max-h-[90vh] animate-in slide-in-from-bottom-10 duration-300 overflow-hidden">
              <div className="p-4 sm:p-6 border-b flex justify-between items-start bg-white shrink-0">
                <div>
                  <h4 className="text-[10px] font-black text-[#8B1D1D] uppercase mb-1 tracking-widest">Personalizar</h4>
                  <h3 className="text-xl sm:text-2xl font-black text-slate-800">{customizingProduct.name}</h3>
                </div>
                <button onClick={() => setCustomizingProduct(null)} className="p-2 hover:bg-slate-100 rounded-full transition-colors"><svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg></button>
              </div>
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-8 scrollbar-hide">
                {/* Size Selection */}
                {customizingProduct.availableSizes && customizingProduct.availableSizes.length > 0 && (
                  <section className="space-y-3">
                    <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Tamanho</h5>
                    <div className="grid grid-cols-4 gap-2">
                      {customizingProduct.availableSizes.map(size => (
                        <button key={size} onClick={() => setCurrentCustomization(prev => ({...prev, size}))} className={`py-3 rounded-xl border-2 font-black text-xs transition-all ${currentCustomization.size === size ? 'bg-[#8B1D1D] border-[#8B1D1D] text-white shadow-lg' : 'bg-white border-slate-100 text-slate-400 hover:border-slate-200'}`}>
                          {size}
                        </button>
                      ))}
                    </div>
                  </section>
                )}

                {/* Flavor Selection (Pizzas Only) */}
                {customizingProduct.category === 'Pizzas' && (
                  <section className="space-y-3">
                    <div className="flex justify-between items-end">
                      <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Sabores</h5>
                      <span className="text-[9px] font-black text-[#8B1D1D] uppercase">
                        Máx: {getMaxFlavors(currentCustomization.size)}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {allPizzas.map(pizza => (
                        <button 
                          key={pizza.id} 
                          onClick={() => toggleFlavor(pizza.name)}
                          className={`p-3 text-left rounded-xl border transition-all ${
                            currentCustomization.flavors?.includes(pizza.name)
                            ? 'bg-red-50 border-[#8B1D1D]/40 text-[#8B1D1D] shadow-sm'
                            : 'bg-white border-slate-100 text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          <p className="text-[10px] font-bold">{pizza.name}</p>
                        </button>
                      ))}
                    </div>
                  </section>
                )}

                {/* Crust Selection */}
                {customizingProduct.availableCrusts && customizingProduct.availableCrusts.length > 0 && (
                  <section className="space-y-3">
                    <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Borda</h5>
                    <div className="grid grid-cols-2 gap-2">
                      <button 
                        onClick={() => setCurrentCustomization(prev => ({...prev, crust: undefined}))}
                        className={`p-3 text-left rounded-xl border transition-all ${
                          !currentCustomization.crust
                          ? 'bg-emerald-50 border-emerald-400 text-emerald-700 font-black'
                          : 'bg-white border-slate-100 text-slate-600'
                        }`}
                      >
                        <p className="text-[10px]">Sem Borda</p>
                      </button>
                      {customizingProduct.availableCrusts.map(crust => (
                        <button 
                          key={crust.name} 
                          onClick={() => setCurrentCustomization(prev => ({...prev, crust}))}
                          className={`p-3 text-left rounded-xl border transition-all ${
                            currentCustomization.crust?.name === crust.name
                            ? 'bg-emerald-50 border-emerald-400 text-emerald-700 shadow-sm'
                            : 'bg-white border-slate-100 text-slate-600'
                          }`}
                        >
                          <div className="flex justify-between items-center">
                            <p className="text-[10px] font-bold">{crust.name}</p>
                            <span className="text-[8px] font-black">+R${crust.price.toFixed(2)}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </section>
                )}

                {/* Addons Selection */}
                {customizingProduct.availableAddons && customizingProduct.availableAddons.length > 0 && (
                  <section className="space-y-3">
                    <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Adicionais</h5>
                    <div className="grid grid-cols-2 gap-2">
                      {customizingProduct.availableAddons.map(addon => (
                        <button 
                          key={addon.name} 
                          onClick={() => toggleAddon(addon)}
                          className={`p-3 text-left rounded-xl border transition-all ${
                            currentCustomization.addons?.find(a => a.name === addon.name)
                            ? 'bg-orange-50 border-orange-400 text-orange-700 shadow-sm'
                            : 'bg-white border-slate-100 text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          <div className="flex justify-between items-center">
                            <p className="text-[10px] font-bold">{addon.name}</p>
                            <span className="text-[8px] font-black">+R${addon.price.toFixed(2)}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </section>
                )}

                {/* Observations */}
                {customizingProduct.category !== 'Bebidas' && (
                  <section className="space-y-3 pb-6">
                    <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Observações</h5>
                    <textarea value={itemObservation} onChange={(e) => setItemObservation(e.target.value)} placeholder="Ex: Tirar cebola, ponto da carne..." className="w-full p-4 bg-slate-50 border-none rounded-2xl text-xs focus:ring-2 focus:ring-[#8B1D1D] outline-none resize-none" rows={2}/>
                  </section>
                )}
              </div>

              {/* Action Footer for Customization */}
              <div className="p-4 sm:p-6 border-t bg-slate-50 shrink-0">
                <button onClick={confirmCustomization} className="w-full py-4 bg-[#8B1D1D] text-white font-black rounded-2xl hover:bg-[#721818] transition-all shadow-xl shadow-red-900/10 flex justify-between px-6 text-[10px]">
                  <span className="uppercase tracking-widest">Confirmar Item</span>
                  <span className="font-black">R$ {(customizingProduct.price + (currentCustomization.crust?.price || 0) + (currentCustomization.addons?.reduce((sum, a) => sum + a.price, 0) || 0)).toFixed(2)}</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
