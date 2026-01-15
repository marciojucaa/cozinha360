
import React, { useState } from 'react';
import { Table, Product, Order, OrderType, OrderStatus, TableStatus } from '../types';
import { OrderModal } from './OrderModal';

interface WaiterViewProps {
  tables: Table[];
  products: Product[];
  activeOrders: Order[];
  onAddOrder: (order: Order) => void;
  onCancelOrder: (orderId: string) => void;
}

export const WaiterView: React.FC<WaiterViewProps> = ({ tables, products, activeOrders, onAddOrder, onCancelOrder }) => {
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);

  const getTableOrder = (tableId: number) => {
    return activeOrders.find(o => o.tableId === tableId);
  };

  return (
    <div className="space-y-6">
      <header className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-800">Mapa de Mesas</h2>
        <div className="flex gap-4 text-xs font-medium uppercase tracking-wider text-slate-500">
          <div className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-emerald-400"></span> Livre</div>
          <div className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-orange-400"></span> Ocupada</div>
        </div>
      </header>

      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4">
        {tables.map((table) => {
          const order = getTableOrder(table.id);
          const isOccupied = !!order;
          
          return (
            <button
              key={table.id}
              onClick={() => setSelectedTable(table)}
              className={`aspect-square rounded-2xl flex flex-col items-center justify-center gap-2 border-2 transition-all transform active:scale-95 ${
                isOccupied 
                  ? 'bg-orange-50 border-orange-200 text-orange-700 shadow-sm' 
                  : 'bg-white border-slate-100 text-slate-600 hover:border-indigo-200 hover:shadow-md'
              }`}
            >
              <span className="text-xs font-bold uppercase tracking-widest opacity-60">Mesa</span>
              <span className="text-3xl font-black">{table.id}</span>
              {order && (
                <div className="mt-1 px-2 py-0.5 bg-orange-200 rounded text-[10px] font-bold">
                  R$ {order.total.toFixed(2)}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {selectedTable && (
        <OrderModal 
          type={OrderType.TABLE}
          tableId={selectedTable.id}
          existingOrder={getTableOrder(selectedTable.id)}
          products={products}
          onClose={() => setSelectedTable(null)}
          onSave={onAddOrder}
          onCancelOrder={getTableOrder(selectedTable.id) ? () => { 
            const order = getTableOrder(selectedTable.id);
            if(order) onCancelOrder(order.id); 
            setSelectedTable(null); 
          } : undefined}
        />
      )}
    </div>
  );
};
