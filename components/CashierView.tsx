
import React, { useState } from 'react';
import { Order, PaymentMethod, OrderType } from '../types';

interface CashierViewProps {
  orders: Order[];
  onPayOrder: (orderId: string, method: PaymentMethod) => void;
}

export const CashierView: React.FC<CashierViewProps> = ({ orders, onPayOrder }) => {
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(null);
  const [receivedAmount, setReceivedAmount] = useState<string>('');

  const selectedOrder = orders.find(o => o.id === selectedOrderId);
  const change = selectedOrder && receivedAmount 
    ? parseFloat(receivedAmount) - selectedOrder.total 
    : 0;

  const handlePayment = () => {
    if (selectedOrderId && paymentMethod) {
      onPayOrder(selectedOrderId, paymentMethod);
      setSelectedOrderId(null);
      setPaymentMethod(null);
      setReceivedAmount('');
    }
  };

  return (
    <div className="space-y-6">
      <header>
        <h2 className="text-2xl font-bold text-slate-800">Frente de Caixa</h2>
        <p className="text-slate-500">Pedidos aguardando pagamento</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lista de Pedidos Abertos */}
        <div className="lg:col-span-2 space-y-4">
          {orders.length === 0 ? (
            <div className="bg-white p-12 text-center rounded-2xl border border-dashed border-slate-300">
              <p className="text-slate-400">Nenhum pedido aberto no momento.</p>
            </div>
          ) : (
            orders.map(order => (
              <button 
                key={order.id}
                onClick={() => setSelectedOrderId(order.id)}
                className={`w-full p-6 bg-white rounded-2xl border-2 text-left flex justify-between items-center transition-all ${
                  selectedOrderId === order.id 
                    ? 'border-indigo-600 ring-2 ring-indigo-100 shadow-xl scale-[1.01]' 
                    : 'border-transparent hover:border-slate-200 hover:shadow-md'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black ${
                    order.type === OrderType.TABLE ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 text-blue-600'
                  }`}>
                    {order.type === OrderType.TABLE ? order.tableId : 'D'}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-black uppercase text-slate-500">
                        {order.type === OrderType.TABLE ? `Mesa ${order.tableId}` : 'Delivery'}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">#{order.id.substr(0, 5)}</span>
                    </div>
                    <p className="font-bold text-slate-700">
                      {order.items.length} {order.items.length === 1 ? 'item' : 'itens'} no pedido
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-black text-slate-800">R$ {order.total.toFixed(2)}</p>
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded uppercase ${
                    order.status === 'READY' ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'
                  }`}>
                    {order.status === 'READY' ? 'PRONTO' : 'EM PREPARO'}
                  </span>
                </div>
              </button>
            ))
          )}
        </div>

        {/* Painel de Checkout */}
        <div className="space-y-6">
          <div className="bg-slate-800 text-white rounded-3xl shadow-2xl sticky top-24 overflow-hidden flex flex-col max-h-[calc(100vh-120px)]">
            <div className="p-6 bg-slate-900 flex items-center justify-between">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <svg className="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
                Checkout
              </h3>
              {selectedOrder && (
                <span className="text-[10px] font-black bg-slate-700 px-2 py-1 rounded">
                  {selectedOrder.type === OrderType.TABLE ? `MESA ${selectedOrder.tableId}` : 'DELIVERY'}
                </span>
              )}
            </div>

            {!selectedOrder ? (
              <div className="flex-1 flex flex-col items-center justify-center p-12 text-center opacity-40">
                <svg className="w-16 h-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" /></svg>
                <p className="text-sm italic">Selecione um pedido para visualizar os itens e realizar o pagamento</p>
              </div>
            ) : (
              <div className="flex flex-col flex-1 overflow-hidden">
                {/* Lista de Itens para Conferência */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4 border-b border-slate-700/50">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Itens para Conferência</h4>
                  <div className="space-y-3">
                    {selectedOrder.items.map((item, idx) => (
                      <div key={idx} className="bg-slate-700/30 p-3 rounded-2xl border border-slate-700">
                        <div className="flex justify-between items-start mb-1">
                          <p className="text-sm font-bold text-slate-100 flex-1">
                            <span className="text-indigo-400 mr-2">{item.quantity}x</span>
                            {item.productName}
                          </p>
                          <p className="text-sm font-black text-white ml-2">R$ {(item.price * item.quantity).toFixed(2)}</p>
                        </div>
                        {item.customization && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {item.customization.size && <span className="text-[9px] font-bold bg-slate-600 text-slate-300 px-1.5 py-0.5 rounded">TAM: {item.customization.size}</span>}
                            {item.customization.crust && <span className="text-[9px] font-bold bg-indigo-900/40 text-indigo-300 px-1.5 py-0.5 rounded border border-indigo-800/50">{item.customization.crust.name}</span>}
                            {item.customization.addons?.map((addon, aIdx) => (
                              <span key={aIdx} className="text-[9px] font-bold bg-emerald-900/40 text-emerald-300 px-1.5 py-0.5 rounded border border-emerald-800/50">+{addon.name}</span>
                            ))}
                          </div>
                        )}
                        {item.observation && (
                          <p className="text-[10px] text-orange-300 italic mt-1.5 border-t border-slate-700 pt-1">
                            Obs: {item.observation}
                          </p>
                        )}
                      </div>
                    ))}

                    {/* Taxa de Entrega (Frete) na Conferência */}
                    {selectedOrder.type === OrderType.DELIVERY && selectedOrder.deliveryFee && selectedOrder.deliveryFee > 0 ? (
                      <div className="bg-indigo-900/20 p-3 rounded-2xl border border-indigo-800/50 flex justify-between items-center animate-in fade-in slide-in-from-bottom-1">
                        <div className="flex items-center gap-2">
                           <svg className="w-4 h-4 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                           <p className="text-sm font-bold text-indigo-100 uppercase tracking-tight">Taxa de Entrega (Frete)</p>
                        </div>
                        <p className="text-sm font-black text-indigo-300">R$ {selectedOrder.deliveryFee.toFixed(2)}</p>
                      </div>
                    ) : null}
                  </div>
                </div>

                {/* Opções de Pagamento */}
                <div className="p-6 bg-slate-900/50 space-y-6">
                  <div className="flex justify-between items-end">
                    <div>
                      <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest mb-1">Total a Pagar</p>
                      <p className="text-4xl font-black text-white">R$ {selectedOrder.total.toFixed(2)}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: PaymentMethod.CASH, label: 'Dinheiro', icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
                      { id: PaymentMethod.PIX, label: 'PIX', icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z' },
                      { id: PaymentMethod.CARD, label: 'Cartão', icon: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z' }
                    ].map(method => (
                      <button 
                        key={method.id}
                        onClick={() => setPaymentMethod(method.id)}
                        className={`flex flex-col items-center p-3 rounded-2xl border-2 transition-all ${
                          paymentMethod === method.id 
                            ? 'bg-indigo-600 border-indigo-400 text-white shadow-lg' 
                            : 'bg-slate-700 border-slate-600 text-slate-300 hover:border-slate-500'
                        }`}
                      >
                        <svg className="w-5 h-5 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={method.icon} /></svg>
                        <span className="text-[9px] font-black uppercase tracking-tight">{method.label}</span>
                      </button>
                    ))}
                  </div>

                  {paymentMethod === PaymentMethod.CASH && (
                    <div className="animate-in slide-in-from-top-2 duration-200">
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Valor Recebido</label>
                        {change > 0 && <span className="text-xs font-black text-emerald-400">Troco: R$ {change.toFixed(2)}</span>}
                      </div>
                      <input 
                        type="number" 
                        className="w-full bg-slate-700 border-slate-600 text-white p-3 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-black text-xl text-center"
                        placeholder="0,00"
                        value={receivedAmount}
                        onChange={(e) => setReceivedAmount(e.target.value)}
                      />
                    </div>
                  )}

                  <button 
                    onClick={handlePayment}
                    disabled={!paymentMethod}
                    className="w-full py-4 bg-emerald-500 hover:bg-emerald-600 text-white font-black rounded-2xl transition-all disabled:opacity-30 disabled:cursor-not-allowed shadow-xl shadow-emerald-900/40 uppercase tracking-widest text-sm"
                  >
                    FINALIZAR PAGAMENTO
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
