
import React, { useState, useEffect, useMemo } from 'react';
import { Order, PaymentMethod, Product, OrderType } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';
import { generateDailySummary } from '../services/geminiService';
import { ProductModal } from './ProductModal';

interface ReportsViewProps {
  orders: Order[];
  products: Product[];
  onUpdateProducts: (products: Product[]) => void;
}

export const ReportsView: React.FC<ReportsViewProps> = ({ orders, products, onUpdateProducts }) => {
  const [aiInsight, setAiInsight] = useState<string>('Gerando insights inteligentes...');
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [activeView, setActiveView] = useState<'overview' | 'history'>('overview');

  // History Filters State
  const [historySearch, setHistorySearch] = useState('');
  const [filterType, setFilterType] = useState<OrderType | 'ALL'>('ALL');
  const [filterPayment, setFilterPayment] = useState<PaymentMethod | 'ALL'>('ALL');
  const [filterDate, setFilterDate] = useState<string>(new Date().toISOString().split('T')[0]); // Default to today

  const finishedOrders = useMemo(() => orders.filter(o => o.isPaid), [orders]);
  const totalDaily = finishedOrders.reduce((acc, o) => acc + o.total, 0);
  
  const paymentData = [
    { name: 'Dinheiro', value: finishedOrders.filter(o => o.paymentMethod === PaymentMethod.CASH).reduce((acc, o) => acc + o.total, 0) },
    { name: 'PIX', value: finishedOrders.filter(o => o.paymentMethod === PaymentMethod.PIX).reduce((acc, o) => acc + o.total, 0) },
    { name: 'Cartão', value: finishedOrders.filter(o => o.paymentMethod === PaymentMethod.CARD).reduce((acc, o) => acc + o.total, 0) },
  ].filter(d => d.value > 0);

  const filteredHistory = useMemo(() => {
    return finishedOrders.filter(o => {
      const search = historySearch.toLowerCase();
      const matchesId = o.id.toLowerCase().includes(search);
      const matchesCustomer = o.customer?.name?.toLowerCase().includes(search);
      const matchesTable = o.tableId?.toString().includes(search);
      const matchesSearch = matchesId || matchesCustomer || matchesTable;

      const matchesType = filterType === 'ALL' || o.type === filterType;
      const matchesPayment = filterPayment === 'ALL' || o.paymentMethod === filterPayment;
      
      let matchesDate = true;
      if (filterDate) {
        const orderDate = new Date(o.closedAt || o.createdAt).toISOString().split('T')[0];
        matchesDate = orderDate === filterDate;
      }

      return matchesSearch && matchesType && matchesPayment && matchesDate;
    }).sort((a, b) => (b.closedAt || 0) - (a.closedAt || 0));
  }, [finishedOrders, historySearch, filterType, filterPayment, filterDate]);

  const COLORS = ['#10B981', '#3B82F6', '#6366F1'];

  useEffect(() => {
    const fetchInsight = async () => {
      if (finishedOrders.length > 0) {
        const insight = await generateDailySummary(orders);
        setAiInsight(insight);
      } else {
        setAiInsight("Aguardando vendas para analisar o desempenho.");
      }
    };
    fetchInsight();
  }, [finishedOrders.length]);

  const handleDeleteProduct = (productId: string) => {
    if (confirm('Deseja realmente excluir este produto?')) {
      onUpdateProducts(products.filter(p => p.id !== productId));
    }
  };

  const handleSaveProduct = (product: Product) => {
    const exists = products.find(p => p.id === product.id);
    if (exists) {
      onUpdateProducts(products.map(p => p.id === product.id ? product : p));
    } else {
      onUpdateProducts([...products, product]);
    }
    setIsProductModalOpen(false);
    setEditingProduct(null);
  };

  const clearFilters = () => {
    setHistorySearch('');
    setFilterType('ALL');
    setFilterPayment('ALL');
    setFilterDate(new Date().toISOString().split('T')[0]);
  };

  return (
    <div className="space-y-8 pb-20">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Painel Administrativo</h2>
          <p className="text-slate-500">Relatórios e Gestão do Sistema</p>
        </div>
        <div className="flex bg-white p-1 rounded-xl border border-slate-200 shadow-sm">
          <button 
            onClick={() => setActiveView('overview')}
            className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${activeView === 'overview' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
          >
            Visão Geral
          </button>
          <button 
            onClick={() => setActiveView('history')}
            className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${activeView === 'history' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
          >
            Histórico de Vendas
          </button>
        </div>
      </header>

      {activeView === 'overview' ? (
        <>
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <p className="text-slate-500 text-xs font-bold uppercase mb-1">Total de Vendas</p>
              <p className="text-3xl font-black text-slate-800">R$ {totalDaily.toFixed(2)}</p>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <p className="text-slate-500 text-xs font-bold uppercase mb-1">Pedidos Concluídos</p>
              <p className="text-3xl font-black text-indigo-600">{finishedOrders.length}</p>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <p className="text-slate-500 text-xs font-bold uppercase mb-1">Ticket Médio</p>
              <p className="text-3xl font-black text-emerald-600">
                R$ {finishedOrders.length > 0 ? (totalDaily / finishedOrders.length).toFixed(2) : '0,00'}
              </p>
            </div>
          </div>

          {/* AI Insight Box */}
          <div className="bg-indigo-600 text-white p-6 rounded-3xl shadow-xl shadow-indigo-900/20">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-white/20 p-2 rounded-lg">
                <svg className="w-5 h-5 text-indigo-100" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
              </div>
              <h3 className="font-bold text-lg">Insight Inteligente (Gemini AI)</h3>
            </div>
            <p className="text-indigo-50 text-sm leading-relaxed italic">
              "{aiInsight}"
            </p>
          </div>

          {/* Menu Management Section */}
          <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <h3 className="font-black text-slate-800 uppercase tracking-wider text-sm">Gerenciar Itens do Cardápio</h3>
              <button 
                onClick={() => {
                  setEditingProduct(null);
                  setIsProductModalOpen(true);
                }}
                className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-900/10"
              >
                + Adicionar Item
              </button>
            </div>

            <div className="overflow-x-auto max-h-96 scrollbar-hide">
              <table className="w-full text-left">
                <thead className="sticky top-0 bg-white">
                  <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b">
                    <th className="pb-3 px-2">Item</th>
                    <th className="pb-3 px-2">Categoria</th>
                    <th className="pb-3 px-2">Preço</th>
                    <th className="pb-3 px-2 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {products.map(product => (
                    <tr key={product.id} className="group hover:bg-slate-50 transition-colors">
                      <td className="py-4 px-2">
                        <p className="font-bold text-slate-700 text-sm">{product.name}</p>
                      </td>
                      <td className="py-4 px-2">
                        <span className="text-[10px] font-black bg-slate-100 text-slate-500 px-2 py-0.5 rounded uppercase">{product.category}</span>
                      </td>
                      <td className="py-4 px-2 font-black text-slate-800 text-sm">R$ {product.price.toFixed(2)}</td>
                      <td className="py-4 px-2 text-right">
                        <div className="flex justify-end gap-2">
                          <button 
                            onClick={() => {
                              setEditingProduct(product);
                              setIsProductModalOpen(true);
                            }}
                            className="p-2 text-slate-400 hover:text-indigo-600 transition-colors"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-5M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z" /></svg>
                          </button>
                          <button 
                            onClick={() => handleDeleteProduct(product.id)}
                            className="p-2 text-slate-400 hover:text-red-600 transition-colors"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm h-80">
              <h3 className="font-bold text-slate-700 mb-6 uppercase text-xs tracking-widest">Vendas por Pagamento</h3>
              {paymentData.length > 0 ? (
                <>
                  <ResponsiveContainer width="100%" height="80%">
                    <PieChart>
                      <Pie
                        data={paymentData}
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {paymentData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: number) => `R$ ${value.toFixed(2)}`} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="flex justify-center gap-4 mt-2">
                     {paymentData.map((d, i) => (
                       <div key={d.name} className="flex items-center gap-1">
                         <span className="w-3 h-3 rounded-full" style={{backgroundColor: COLORS[i]}}></span>
                         <span className="text-xs font-medium text-slate-500">{d.name}</span>
                       </div>
                     ))}
                  </div>
                </>
              ) : (
                <div className="flex items-center justify-center h-full text-slate-300 italic text-sm">Nenhum dado para exibir</div>
              )}
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-slate-700 uppercase text-xs tracking-widest">Últimas Transações</h3>
                <button 
                  onClick={() => setActiveView('history')}
                  className="text-[10px] font-black text-indigo-600 uppercase tracking-widest hover:text-indigo-800"
                >
                  Ver Tudo
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b">
                      <th className="pb-3">Ref</th>
                      <th className="pb-3">Tipo</th>
                      <th className="pb-3">Forma</th>
                      <th className="pb-3 text-right">Valor</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {finishedOrders.slice(-5).reverse().map(order => (
                      <tr key={order.id} className="text-sm">
                        <td className="py-3 text-slate-600 font-mono">#{order.id.substr(0, 5)}</td>
                        <td className="py-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${order.type === OrderType.TABLE ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'}`}>
                            {order.type === OrderType.TABLE ? 'Mesa' : 'Delivery'}
                          </span>
                        </td>
                        <td className="py-3 text-slate-500 font-medium">{order.paymentMethod}</td>
                        <td className="py-3 text-right font-bold text-slate-800">R$ {order.total.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </>
      ) : (
        <section className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
          {/* Advanced Filter Bar */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
              <div className="w-full lg:w-1/3">
                <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight mb-2 flex items-center gap-2">
                  <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" /></svg>
                  Filtros de Histórico
                </h3>
                <div className="relative">
                  <input 
                    type="text" 
                    placeholder="Buscar por ID, Cliente ou Mesa..."
                    value={historySearch}
                    onChange={(e) => setHistorySearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-xs focus:ring-2 focus:ring-indigo-600 outline-none transition-all shadow-inner"
                  />
                  <svg className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                </div>
              </div>

              <div className="flex flex-wrap gap-4 items-end flex-1 justify-end w-full">
                {/* Type Filter Buttons */}
                <div className="space-y-1.5 flex-1 min-w-[140px]">
                  <label className="text-[9px] font-black uppercase text-slate-400 tracking-widest ml-1">Tipo de Pedido</label>
                  <div className="flex bg-slate-100 p-1 rounded-xl w-full">
                    {[
                      { id: 'ALL', label: 'TUDO' },
                      { id: OrderType.TABLE, label: 'MESA' },
                      { id: OrderType.DELIVERY, label: 'DELIV' }
                    ].map(type => (
                      <button
                        key={type.id}
                        onClick={() => setFilterType(type.id as any)}
                        className={`flex-1 py-1.5 text-[9px] font-black rounded-lg transition-all ${
                          filterType === type.id ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'
                        }`}
                      >
                        {type.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Payment Filter Buttons */}
                <div className="space-y-1.5 flex-1 min-w-[200px]">
                  <label className="text-[9px] font-black uppercase text-slate-400 tracking-widest ml-1">Pagamento</label>
                  <div className="flex bg-slate-100 p-1 rounded-xl w-full">
                    {[
                      { id: 'ALL', label: 'TUDO' },
                      { id: PaymentMethod.CASH, label: 'DIN' },
                      { id: PaymentMethod.PIX, label: 'PIX' },
                      { id: PaymentMethod.CARD, label: 'CART' }
                    ].map(pm => (
                      <button
                        key={pm.id}
                        onClick={() => setFilterPayment(pm.id as any)}
                        className={`flex-1 py-1.5 text-[9px] font-black rounded-lg transition-all ${
                          filterPayment === pm.id ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'
                        }`}
                      >
                        {pm.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Date Picker */}
                <div className="space-y-1.5 flex-none w-full sm:w-auto">
                  <label className="text-[9px] font-black uppercase text-slate-400 tracking-widest ml-1">Selecionar Dia</label>
                  <div className="relative">
                    <input 
                      type="date"
                      value={filterDate}
                      onChange={(e) => setFilterDate(e.target.value)}
                      className="w-full sm:w-44 pl-10 pr-4 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-black focus:ring-4 focus:ring-indigo-100 outline-none transition-all cursor-pointer shadow-lg shadow-indigo-900/10"
                    />
                    <svg className="absolute left-3.5 top-3 w-4 h-4 text-indigo-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 00-2 2z" /></svg>
                  </div>
                </div>

                <button 
                  onClick={clearFilters}
                  className="p-2.5 bg-slate-50 text-slate-400 hover:text-indigo-600 rounded-xl border border-slate-100 transition-all active:scale-95"
                  title="Limpar Filtros"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                </button>
              </div>
            </div>
          </div>

          {/* Table Results */}
          <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden flex flex-col">
             <div className="overflow-x-auto scrollbar-hide">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b bg-slate-50/50">
                    <th className="py-5 px-6">Ref / Data / Hora</th>
                    <th className="py-5 px-6">Origem</th>
                    <th className="py-5 px-6">Cliente / Detalhes</th>
                    <th className="py-5 px-6">Itens</th>
                    <th className="py-5 px-6">Pagamento</th>
                    <th className="py-5 px-6 text-right">Valor Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredHistory.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-32 text-center text-slate-300 italic">
                        <div className="flex flex-col items-center justify-center gap-2 opacity-40">
                          <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                          <p className="font-bold">Nenhum pedido encontrado nos filtros selecionados.</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredHistory.map(order => (
                      <tr key={order.id} className="hover:bg-slate-50 transition-all group">
                        <td className="py-5 px-6">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center font-mono text-[10px] font-black text-indigo-600 shrink-0">
                              #{order.id.substr(0, 4)}
                            </div>
                            <div>
                              <p className="text-[10px] text-slate-700 font-bold mb-0.5">
                                {new Date(order.closedAt || order.createdAt).toLocaleDateString('pt-BR')}
                              </p>
                              <p className="text-[10px] text-slate-400 font-black">
                                {new Date(order.closedAt || order.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="py-5 px-6">
                           <span className={`px-2.5 py-1 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-colors ${
                            order.type === OrderType.TABLE ? 'bg-orange-50 text-orange-600 border-orange-100' : 'bg-blue-50 text-blue-600 border-blue-100'
                          }`}>
                            {order.type === OrderType.TABLE ? `Mesa ${order.tableId}` : 'Delivery'}
                          </span>
                        </td>
                        <td className="py-5 px-6">
                          {order.type === OrderType.DELIVERY ? (
                            <div className="max-w-[200px]">
                              <p className="text-xs font-black text-slate-800 truncate">{order.customer?.name || 'CONSUMIDOR'}</p>
                              <p className="text-[9px] text-slate-400 truncate leading-tight mt-0.5">{order.customer?.address || 'Retirada no Balcão'}</p>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1.5 opacity-50">
                               <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /></svg>
                               <span className="text-[9px] font-bold uppercase tracking-wide">Consumo Local</span>
                            </div>
                          )}
                        </td>
                        <td className="py-5 px-6">
                          <div className="flex flex-wrap gap-1.5 max-w-[220px]">
                            {order.items.map((item, idx) => (
                              <span key={idx} className="bg-white border border-slate-200 text-slate-600 text-[9px] px-2 py-0.5 rounded-lg font-bold group-hover:border-slate-300 transition-colors">
                                {item.quantity}x {item.productName.split(' - ')[0]}
                              </span>
                            ))}
                            {order.deliveryFee ? <span className="bg-indigo-50 text-indigo-600 text-[9px] px-2 py-0.5 rounded-lg font-black border border-indigo-100">TX R${order.deliveryFee.toFixed(2)}</span> : null}
                          </div>
                        </td>
                        <td className="py-5 px-6">
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${
                              order.paymentMethod === PaymentMethod.CASH ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]' : 
                              order.paymentMethod === PaymentMethod.PIX ? 'bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.5)]' : 'bg-indigo-400 shadow-[0_0_8px_rgba(129,140,248,0.5)]'
                            }`}></div>
                            <span className="text-[10px] font-black text-slate-700 uppercase tracking-tight">{order.paymentMethod}</span>
                          </div>
                        </td>
                        <td className="py-5 px-6 text-right">
                          <p className="text-sm font-black text-slate-900 tracking-tight">R$ {order.total.toFixed(2)}</p>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            
            {/* Footer Summary Bar */}
            {filteredHistory.length > 0 && (
              <div className="p-6 bg-slate-50 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-6">
                <div className="flex items-center gap-8">
                  <div>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Pedidos no Filtro</p>
                    <p className="text-xl font-black text-slate-800 leading-none">{filteredHistory.length}</p>
                  </div>
                  <div className="h-8 w-px bg-slate-200"></div>
                  <div>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Ticket Médio Filtro</p>
                    <p className="text-xl font-black text-emerald-600 leading-none">R$ {(filteredHistory.reduce((acc, o) => acc + o.total, 0) / filteredHistory.length).toFixed(2)}</p>
                  </div>
                </div>
                <div className="text-center md:text-right">
                  <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-1">Total Consolidado</p>
                  <p className="text-4xl font-black text-slate-900 tracking-tighter">R$ {filteredHistory.reduce((acc, o) => acc + o.total, 0).toFixed(2)}</p>
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {isProductModalOpen && (
        <ProductModal 
          product={editingProduct}
          products={products}
          onClose={() => {
            setIsProductModalOpen(false);
            setEditingProduct(null);
          }}
          onSave={handleSaveProduct}
        />
      )}
    </div>
  );
};
