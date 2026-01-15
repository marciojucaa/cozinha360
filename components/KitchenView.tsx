
import React from 'react';
import { Order, OrderStatus, OrderType } from '../types';

interface KitchenViewProps {
  orders: Order[];
  onUpdateStatus: (orderId: string, status: OrderStatus) => void;
}

export const KitchenView: React.FC<KitchenViewProps> = ({ orders, onUpdateStatus }) => {
  return (
    <div className="space-y-6">
      <header>
        <h2 className="text-2xl font-bold text-slate-800">Cozinha / Preparo</h2>
        <p className="text-slate-500">Controle de produção em tempo real</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {orders.length === 0 ? (
          <div className="col-span-full py-20 text-center text-slate-400">
            <p>Aguardando novos pedidos...</p>
          </div>
        ) : (
          orders.map(order => (
            <div key={order.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden flex flex-col shadow-sm">
              <div className={`p-4 flex justify-between items-center ${
                order.status === OrderStatus.SENT ? 'bg-red-50 text-red-700' : 'bg-blue-50 text-blue-700'
              }`}>
                <span className="font-black text-lg">
                  {order.type === OrderType.TABLE ? `Mesa ${order.tableId}` : 'Delivery'}
                </span>
                <span className="text-xs font-bold uppercase">{order.status === OrderStatus.SENT ? 'Pendente' : 'Em Preparo'}</span>
              </div>
              
              <div className="p-4 flex-1 space-y-3">
                {order.items.map(item => (
                  <div key={item.id} className="flex justify-between items-start">
                    <div className="flex-1">
                      <p className="font-bold text-slate-700">{item.quantity}x {item.productName}</p>
                      {item.observation && <p className="text-xs text-orange-600 bg-orange-50 p-1 rounded mt-1">Obs: {item.observation}</p>}
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-4 bg-slate-50 border-t flex gap-2">
                {order.status === OrderStatus.SENT ? (
                  <button 
                    onClick={() => onUpdateStatus(order.id, OrderStatus.PREPARING)}
                    className="flex-1 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors"
                  >
                    Iniciar Preparo
                  </button>
                ) : (
                  <button 
                    onClick={() => onUpdateStatus(order.id, OrderStatus.READY)}
                    className="flex-1 py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition-colors"
                  >
                    Marcar como Pronto
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
