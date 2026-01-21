
import React, { useState, useEffect } from 'react';
import { 
  OrderStatus, 
  OrderType, 
  PaymentMethod, 
  TableStatus, 
  Order, 
  Table, 
  User, 
  Product
} from './types';
import { INITIAL_TABLES, MOCK_PRODUCTS } from './constants';
import { WaiterView } from './components/WaiterView';
import { DeliveryView } from './components/DeliveryView';
import { CashierView } from './components/CashierView';
import { ReportsView } from './components/ReportsView';
import { KitchenView } from './components/KitchenView';
import { MenuView } from './components/MenuView';
import { Navigation } from './components/Navigation';
import { supabase, isSupabaseReady } from './lib/supabase';

const Logo: React.FC<{ className?: string }> = ({ className }) => (
  <div className={`relative flex items-center justify-center ${className}`}>
    <svg viewBox="0 0 200 200" className="w-full h-full drop-shadow-xl">
      <circle cx="100" cy="100" r="88" fill="white" stroke="#4A1010" strokeWidth="4" />
      <g stroke="#4A1010" strokeWidth="2" fill="none" strokeLinecap="round">
        <path d="M175 60 A85 85 0 0 1 185 100 A85 85 0 0 1 175 140" stroke="#8B1D1D" strokeWidth="2" />
        <path d="M175 60 L182 52 M175 60 L168 56" stroke="#8B1D1D" />
        <path d="M25 60 A85 85 0 0 0 15 100 A85 85 0 0 0 25 140" stroke="#8B1D1D" strokeWidth="2" />
        <path d="M25 140 L18 148 M25 140 L32 144" stroke="#8B1D1D" />
      </g>
      <g transform="translate(45, 25)">
        <circle cx="55" cy="55" r="50" fill="#D2691E" />
        <circle cx="55" cy="55" r="44" fill="#FF6347" />
        <circle cx="55" cy="55" r="40" fill="#FFD700" opacity="0.8" />
        <circle cx="40" cy="40" r="8" fill="#B22222" />
        <circle cx="70" cy="45" r="8" fill="#B22222" />
        <circle cx="55" cy="70" r="8" fill="#B22222" />
        <path d="M45 40 Q48 35 52 40 Q48 45 45 40" fill="#228B22" />
        <path d="M65 65 Q68 60 72 65 Q68 70 65 65" fill="#228B22" />
      </g>
      <g transform="translate(50, 110)">
        <path d="M10 20 Q50 0 90 20 L90 35 Q50 45 10 35 Z" fill="#DAA520" />
        <path d="M12 30 Q50 40 88 30 L88 40 Q50 50 12 40 Z" fill="#32CD32" />
        <path d="M12 38 L88 38 L88 48 Q50 55 12 48 Z" fill="#8B4513" />
        <rect x="12" y="35" width="76" height="4" fill="#FFD700" />
        <path d="M10 45 Q50 60 90 45 L90 55 Q50 70 10 55 Z" fill="#DAA520" />
      </g>
      <rect x="5" y="88" width="190" height="28" fill="#8B1D1D" rx="2" />
      <text x="100" y="108" fontFamily="Inter, sans-serif" fontWeight="900" fontSize="20" fill="white" textAnchor="middle" letterSpacing="0.5">COZINHA360</text>
    </svg>
  </div>
);

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<'menu' | 'tables' | 'delivery' | 'cashier' | 'kitchen' | 'reports'>('menu');
  const [tables, setTables] = useState<Table[]>(INITIAL_TABLES);
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>(MOCK_PRODUCTS);
  const [loading, setLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    // Escuta evento de instalação do PWA
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    const savedUser = localStorage.getItem('cozinha360_user');
    if (savedUser) setCurrentUser(JSON.parse(savedUser));

    if (isSupabaseReady) {
      fetchInitialData();

      const channel = supabase
        .channel('schema-changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => fetchOrders())
        .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, () => fetchProducts())
        .subscribe((status) => {
          setIsConnected(status === 'SUBSCRIBED');
        });

      return () => {
        supabase.removeChannel(channel);
        window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      };
    } else {
      setLoading(false);
      return () => {
        window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      }
    }
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
    }
  };

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      await Promise.all([fetchProducts(), fetchOrders()]);
    } catch (err: any) {
      console.error("Erro na carga inicial:", err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    if (!isSupabaseReady) return;
    const { data, error } = await supabase.from('products').select('*').order('name');
    if (!error && data && data.length > 0) {
      setProducts(data as Product[]);
    }
  };

  const fetchOrders = async () => {
    if (!isSupabaseReady) return;
    const { data, error } = await supabase.from('orders').select('*');
    if (!error && data) {
      setOrders(data as Order[]);
    }
  };

  const login = (name: string, role: User['role']) => {
    const user: User = { id: Math.random().toString(36).substr(2, 9), name, role };
    setCurrentUser(user);
    localStorage.setItem('cozinha360_user', JSON.stringify(user));
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('cozinha360_user');
  };

  const updateProducts = async (newProducts: Product[]) => {
    setProducts(newProducts);
    if (!isSupabaseReady) return;
    for (const p of newProducts) {
      await supabase.from('products').upsert(p);
    }
  };

  const saveOrder = async (order: Order) => {
    if (!isSupabaseReady) {
      alert("Sistema em modo demonstração. Configure o Supabase para salvar pedidos reais.");
      return;
    }
    const { error } = await supabase.from('orders').upsert(order);
    if (error) {
      console.error('Erro ao salvar no Supabase:', error.message);
      alert('Erro ao salvar pedido: ' + error.message);
    } else {
      fetchOrders();
    }
  };

  const cancelOrder = async (orderId: string) => {
    if (!isSupabaseReady) return;
    if (confirm('Deseja excluir este pedido permanentemente?')) {
      const { error } = await supabase.from('orders').delete().eq('id', orderId);
      if (!error) fetchOrders();
    }
  };

  const updateOrderStatus = async (orderId: string, status: OrderStatus) => {
    if (!isSupabaseReady) return;
    const { error } = await supabase.from('orders').update({ status }).eq('id', orderId);
    if (!error) fetchOrders();
  };

  const payOrder = async (orderId: string, method: PaymentMethod) => {
    if (!isSupabaseReady) return;
    const closedAt = Date.now();
    const { error } = await supabase
      .from('orders')
      .update({ isPaid: true, status: OrderStatus.FINISHED, paymentMethod: method, closedAt })
      .eq('id', orderId);

    if (!error) fetchOrders();
  };

  const tablesWithStatus = tables.map(t => {
    const activeOrder = orders.find(o => o.tableId === t.id && !o.isPaid);
    return {
      ...t,
      status: activeOrder ? TableStatus.OCCUPIED : TableStatus.FREE
    };
  });

  if (!isSupabaseReady && !loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-white p-8 text-center">
        <Logo className="w-40 h-40 mb-8" />
        <div className="max-w-md space-y-4">
          <h2 className="text-2xl font-black text-[#8B1D1D] uppercase">Banco de Dados não Detectado</h2>
          <p className="text-slate-500 text-sm">O erro <b>'Failed to fetch'</b> acontece porque as variáveis de ambiente (SUPABASE_URL e SUPABASE_ANON_KEY) não foram configuradas ou são inválidas.</p>
          <div className="bg-slate-50 p-4 rounded-2xl text-left text-xs font-mono space-y-2 border border-slate-200">
            <p className="font-bold text-slate-700">O que fazer agora:</p>
            <ol className="list-decimal list-inside space-y-1 text-slate-500">
              <li>Vá ao painel da <b>Vercel</b>.</li>
              <li>Acesse <b>Settings &rarr; Environment Variables</b>.</li>
              <li>Adicione <b>SUPABASE_URL</b> e <b>SUPABASE_ANON_KEY</b>.</li>
              <li>Faça um novo <b>Redeploy</b>.</li>
            </ol>
          </div>
          <button onClick={() => window.location.reload()} className="w-full py-4 bg-[#8B1D1D] text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-red-900/10">Tentar Novamente</button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50">
        <Logo className="w-32 h-32 animate-pulse mb-4" />
        <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] animate-bounce">Sincronizando Banco de Dados...</p>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-900 px-4">
        <div className="bg-white p-8 rounded-[2.5rem] shadow-2xl w-full max-w-md border-4 border-[#8B1D1D]">
          <div className="flex justify-center mb-6">
            <Logo className="w-48 h-48" />
          </div>
          <div className="space-y-4">
            <button onClick={() => login('Garçom', 'waiter')} className="w-full py-4 px-6 bg-slate-50 border border-slate-100 text-slate-700 rounded-2xl font-bold flex items-center justify-between hover:bg-slate-100 transition-all group">
              <div className="flex items-center gap-3">
                <span className="w-2 h-2 rounded-full bg-orange-400"></span>
                <span>Módulo Garçom</span>
              </div>
            </button>
            <button onClick={() => login('Caixa', 'cashier')} className="w-full py-4 px-6 bg-slate-50 border border-slate-100 text-slate-700 rounded-2xl font-bold flex items-center justify-between hover:bg-slate-100 transition-all group">
              <div className="flex items-center gap-3">
                <span className="w-2 h-2 rounded-full bg-blue-400"></span>
                <span>Frente de Caixa</span>
              </div>
            </button>
            <button onClick={() => login('Cozinha', 'kitchen')} className="w-full py-4 px-6 bg-slate-50 border border-slate-100 text-slate-700 rounded-2xl font-bold flex items-center justify-between hover:bg-slate-100 transition-all group">
              <div className="flex items-center gap-3">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                <span>Monitor da Cozinha</span>
              </div>
            </button>
            <button onClick={() => login('Admin', 'admin')} className="w-full py-4 px-6 bg-indigo-600 text-white rounded-2xl font-black flex items-center justify-between hover:bg-indigo-700 transition-all shadow-xl active:scale-95">
              <div className="flex items-center gap-3">
                <span className="w-2 h-2 rounded-full bg-white animate-pulse"></span>
                <span className="uppercase tracking-widest text-xs">Administração</span>
              </div>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 px-6 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-4">
          <Logo className="w-14 h-14" />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-black text-2xl leading-tight tracking-tighter text-[#8B1D1D]">COZINHA360</h1>
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-red-400'}`} title={isConnected ? 'Banco Online' : 'Tentando reconectar...'}></div>
            </div>
            <span className="text-[10px] text-slate-400 uppercase font-black tracking-widest">{currentUser.role === 'admin' ? 'Painel Gestor' : currentUser.name}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {deferredPrompt && (
            <button 
              onClick={handleInstallClick}
              className="hidden sm:flex items-center gap-2 px-3 py-2 bg-[#8B1D1D] text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-[#721818] transition-all animate-pulse"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
              Instalar App
            </button>
          )}
          <button onClick={logout} className="p-2.5 text-slate-300 hover:text-red-600 transition-all bg-slate-50 hover:bg-red-50 rounded-xl">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
          </button>
        </div>
      </header>

      {/* Floating Install Prompt for Mobile */}
      {deferredPrompt && (
        <div className="fixed bottom-24 left-4 right-4 z-50 md:hidden animate-in slide-in-from-bottom-10 duration-500">
          <div className="bg-[#8B1D1D] text-white p-4 rounded-2xl shadow-2xl flex items-center justify-between border border-white/20">
            <div className="flex items-center gap-3">
              <div className="bg-white p-2 rounded-lg">
                <Logo className="w-6 h-6" />
              </div>
              <div>
                <p className="text-[11px] font-black uppercase tracking-tight">Experiência Completa</p>
                <p className="text-[10px] text-white/70">Instale o Cozinha360 no seu celular</p>
              </div>
            </div>
            <button 
              onClick={handleInstallClick}
              className="px-4 py-2 bg-white text-[#8B1D1D] rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg"
            >
              Instalar
            </button>
          </div>
        </div>
      )}

      <main className="flex-1 overflow-y-auto pb-24 md:pb-0">
        <div className="max-w-7xl mx-auto p-4 md:p-8">
          {activeTab === 'menu' && (
            <MenuView 
              products={products} 
              userRole={currentUser.role}
              onUpdateProducts={updateProducts}
            />
          )}
          {activeTab === 'tables' && (
            <WaiterView 
              tables={tablesWithStatus} 
              products={products} 
              activeOrders={orders.filter(o => !o.isPaid)}
              onAddOrder={saveOrder}
              onCancelOrder={cancelOrder}
            />
          )}
          {activeTab === 'delivery' && (
            <DeliveryView 
              products={products}
              activeOrders={orders.filter(o => o.type === OrderType.DELIVERY && !o.isPaid)}
              onAddOrder={saveOrder}
              onCancelOrder={cancelOrder}
            />
          )}
          {activeTab === 'cashier' && (
            <CashierView 
              orders={orders.filter(o => !o.isPaid)}
              onPayOrder={payOrder}
            />
          )}
          {activeTab === 'kitchen' && (
            <KitchenView 
              orders={orders.filter(o => o.status !== OrderStatus.FINISHED && o.status !== OrderStatus.READY)}
              onUpdateStatus={updateOrderStatus}
            />
          )}
          {activeTab === 'reports' && (
            <ReportsView 
              orders={orders} 
              products={products}
              onUpdateProducts={updateProducts}
            />
          )}
        </div>
      </main>

      <Navigation activeTab={activeTab} setActiveTab={setActiveTab} role={currentUser.role} />
    </div>
  );
};

export default App;
