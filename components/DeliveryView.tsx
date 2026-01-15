
import React, { useState } from 'react';
import { Product, Order, OrderType, OrderStatus } from '../types';
import { OrderModal } from './OrderModal';

interface DeliveryViewProps {
  products: Product[];
  activeOrders: Order[];
  onAddOrder: (order: Order) => void;
  onCancelOrder: (orderId: string) => void;
}

export const DeliveryView: React.FC<DeliveryViewProps> = ({ products, activeOrders, onAddOrder, onCancelOrder }) => {
  const [showModal, setShowModal] = useState(false);
  const [editingOrder, setEditingOrder] = useState<Order | undefined>(undefined);

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.SENT: return <span className="px-2 py-0.5 bg-red-100 text-red-600 rounded text-[10px] font-black uppercase">Enviado</span>;
      case OrderStatus.PREPARING: return <span className="px-2 py-0.5 bg-blue-100 text-blue-600 rounded text-[10px] font-black uppercase">Preparando</span>;
      case OrderStatus.READY: return <span className="px-2 py-0.5 bg-emerald-100 text-emerald-600 rounded text-[10px] font-black uppercase">Pronto</span>;
      default: return null;
    }
  };

  const handleEdit = (order: Order) => {
    setEditingOrder(order);
    setShowModal(true);
  };

  const handleNew = () => {
    setEditingOrder(undefined);
    setShowModal(true);
  };

  return (
    <div className="space-y-6">
      <header className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Pedidos Delivery</h2>
          <p className="text-slate-500">Gestão de entregas externas ({activeOrders.length})</p>
        </div>
        <button 
          onClick={handleNew}
          className="bg-emerald-500 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-emerald-600 transition-colors shadow-lg shadow-emerald-100"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
          Novo Pedido
        </button>
      </header>

      {activeOrders.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400 shadow-sm">
          <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-slate-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </div>
          <p className="font-medium">Nenhuma entrega em andamento</p>
          <p className="text-sm">Clique em 'Novo Pedido' para começar</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {activeOrders.map(order => (
            <div key={order.id} className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between relative group">
              <div>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Cliente</p>
                    <h3 className="font-bold text-slate-800">{order.customer?.name || 'Cliente sem nome'}</h3>
                  </div>
                  {getStatusBadge(order.status)}
                </div>

                <div className="space-y-3">
                  <div className="flex gap-2">
                    <svg className="w-4 h-4 text-slate-300 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                    <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">{order.customer?.address || 'Retirada no balcão'}</p>
                  </div>
                  <div className="flex gap-2">
                    <svg className="w-4 h-4 text-slate-300 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                    <p className="text-xs text-slate-500">{order.customer?.phone || 'N/A'}</p>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-slate-50">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Itens</p>
                  <div className="flex flex-wrap gap-1">
                    {order.items.map((item, idx) => (
                      <span key={idx} className="text-[10px] font-bold bg-slate-50 text-slate-600 px-2 py-0.5 rounded">
                        {item.quantity}x {item.productName.split(' - ')[0]}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-between items-end">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Total</p>
                  <p className="text-xl font-black text-slate-800">R$ {order.total.toFixed(2)}</p>
                </div>
                <div className="flex gap-3">
                   <button 
                    onClick={() => onCancelOrder(order.id)}
                    className="text-[10px] font-black text-red-400 hover:text-red-600 uppercase tracking-widest transition-colors"
                  >
                    Cancelar
                  </button>
                  <button 
                    onClick={() => handleEdit(order)}
                    className="text-[10px] font-black text-indigo-600 hover:text-indigo-800 uppercase tracking-widest transition-colors"
                  >
                    Ver Detalhes / Editar
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <OrderModal 
          type={OrderType.DELIVERY}
          existingOrder={editingOrder}
          products={products}
          onClose={() => setShowModal(false)}
          onSave={onAddOrder}
          onCancelOrder={editingOrder ? () => { onCancelOrder(editingOrder.id); setShowModal(false); } : undefined}
        />
      )}
    </div>
  );
};
