
import React, { useState, useMemo, useRef } from 'react';
import { Product, User } from '../types';
import { ProductModal } from './ProductModal';

interface MenuViewProps {
  products: Product[];
  userRole?: User['role'];
  onUpdateProducts?: (products: Product[]) => void;
}

export const MenuView: React.FC<MenuViewProps> = ({ products, userRole, onUpdateProducts }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  
  const categoriesRef = useRef<HTMLDivElement>(null);

  const isAdmin = userRole === 'admin';

  const categories = useMemo(() => {
    return Array.from(new Set(products.map(p => p.category)));
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory ? p.category === selectedCategory : true;
      return matchesSearch && matchesCategory;
    });
  }, [products, searchTerm, selectedCategory]);

  const handleCategoryClick = (category: string | null, e: React.MouseEvent) => {
    setSelectedCategory(category);
    
    // Rolagem automática para centralizar o item clicado
    const target = e.currentTarget as HTMLElement;
    const container = categoriesRef.current;
    if (container && target) {
      const scrollLeft = target.offsetLeft - (container.offsetWidth / 2) + (target.offsetWidth / 2);
      container.scrollTo({ left: scrollLeft, behavior: 'smooth' });
    }
  };

  const getFallbackImage = (category: string) => {
    const images: Record<string, string> = {
      'Pizzas': 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=600&q=80',
      'Hambúrgueres': 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=600&q=80',
      'Combos': 'https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?auto=format&fit=crop&w=600&q=80',
      'Bebidas': 'https://images.unsplash.com/photo-1544145945-f904253d0c7b?auto=format&fit=crop&w=600&q=80',
      'Sobremesas': 'https://images.unsplash.com/photo-1495147466023-ac5c588e2e94?auto=format&fit=crop&w=600&q=80',
    };
    return images[category] || 'https://images.unsplash.com/photo-1495147466023-ac5c588e2e94?auto=format&fit=crop&w=600&q=80';
  };

  const handleDelete = (productId: string) => {
    if (onUpdateProducts && confirm('Deseja realmente excluir este item do cardápio?')) {
      onUpdateProducts(products.filter(p => p.id !== productId));
    }
  };

  const handleSave = (product: Product) => {
    if (!onUpdateProducts) return;
    
    const exists = products.find(p => p.id === product.id);
    if (exists) {
      onUpdateProducts(products.map(p => p.id === product.id ? product : p));
    } else {
      onUpdateProducts([...products, product]);
    }
    setIsModalOpen(false);
    setEditingProduct(null);
  };

  return (
    <div className="space-y-10 pb-20">
      <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div className="space-y-2">
          <h2 className="text-4xl font-black text-slate-900 tracking-tight">
            Descubra nosso <span className="text-indigo-600">Cardápio</span>
          </h2>
          <p className="text-slate-500 text-lg">Produtos frescos e preparados na hora com os melhores ingredientes.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
          <div className="relative flex-1 lg:w-96">
            <input 
              type="text" 
              placeholder="O que você deseja saborear hoje?"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-white border-2 border-slate-100 rounded-2xl focus:border-indigo-500 focus:ring-0 outline-none transition-all shadow-sm text-slate-700"
            />
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          {isAdmin && (
            <button 
              onClick={() => {
                setEditingProduct(null);
                setIsModalOpen(true);
              }}
              className="px-8 py-4 bg-indigo-600 text-white font-black rounded-2xl shadow-xl shadow-indigo-100 hover:bg-indigo-700 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 uppercase tracking-widest text-xs"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4" /></svg>
              Adicionar Novo
            </button>
          )}
        </div>
      </header>

      {/* Categories Filter */}
      <div 
        ref={categoriesRef}
        className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0"
      >
        <button 
          onClick={(e) => handleCategoryClick(null, e)}
          className={`px-8 py-4 rounded-2xl text-xs font-black whitespace-nowrap transition-all uppercase tracking-widest ${
            !selectedCategory 
              ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-200 translate-y-[-4px]' 
              : 'bg-white text-slate-400 border border-slate-100 hover:border-indigo-200 hover:text-indigo-500'
          }`}
        >
          Todos os Itens
        </button>
        {categories.map(cat => (
          <button 
            key={cat}
            onClick={(e) => handleCategoryClick(cat, e)}
            className={`px-8 py-4 rounded-2xl text-xs font-black whitespace-nowrap transition-all uppercase tracking-widest ${
              selectedCategory === cat 
                ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-200 translate-y-[-4px]' 
                : 'bg-white text-slate-400 border border-slate-100 hover:border-indigo-200 hover:text-indigo-500'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {filteredProducts.length === 0 ? (
          <div className="col-span-full py-32 text-center text-slate-400 bg-white rounded-3xl border border-dashed border-slate-200">
            <svg className="w-16 h-16 mx-auto mb-4 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            <p className="text-xl font-medium italic">Nenhum prato encontrado com esses filtros.</p>
          </div>
        ) : (
          filteredProducts.map(product => (
            <div key={product.id} className="group bg-white rounded-[2.5rem] overflow-hidden border border-slate-100 shadow-sm hover:shadow-2xl transition-all duration-500 flex flex-col h-full hover:-translate-y-2">
              
              {/* Product Image Wrapper */}
              <div className="relative aspect-[4/3] overflow-hidden">
                <img 
                  src={product.image || getFallbackImage(product.category)} 
                  alt={product.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                
                {/* Floating Category Badge */}
                <div className="absolute top-4 left-4">
                  <span className="px-3 py-1 bg-white/90 backdrop-blur-md text-[10px] font-black text-indigo-600 rounded-full uppercase tracking-widest shadow-lg">
                    {product.category}
                  </span>
                </div>

                {/* Admin Quick Actions */}
                {isAdmin && (
                  <div className="absolute top-4 right-4 flex gap-2 translate-y-[-10px] opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                    <button 
                      onClick={() => {
                        setEditingProduct(product);
                        setIsModalOpen(true);
                      }}
                      className="p-2.5 bg-white/90 backdrop-blur-md text-indigo-600 rounded-xl hover:bg-indigo-600 hover:text-white shadow-xl transition-all"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-5M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z" /></svg>
                    </button>
                    <button 
                      onClick={() => handleDelete(product.id)}
                      className="p-2.5 bg-white/90 backdrop-blur-md text-red-600 rounded-xl hover:bg-red-600 hover:text-white shadow-xl transition-all"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                  </div>
                )}
              </div>

              {/* Product Content */}
              <div className="p-8 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex justify-between items-start gap-2">
                    <h3 className="text-xl font-bold text-slate-800 leading-tight group-hover:text-indigo-600 transition-colors">
                      {product.name}
                    </h3>
                  </div>
                  {product.description && (
                    <p className="text-sm text-slate-500 mt-2 line-clamp-2 leading-relaxed">
                      {product.description}
                    </p>
                  )}

                  <div className="flex flex-wrap gap-2 mt-4">
                    {product.availableSizes && product.availableSizes.map(s => (
                      <span key={s} className="px-2 py-0.5 bg-slate-50 border border-slate-100 text-slate-400 text-[9px] font-black rounded-lg uppercase">{s}</span>
                    ))}
                    {(product.availableAddons?.length || product.availableCrusts?.length) ? (
                      <span className="px-2 py-0.5 bg-indigo-50 border border-indigo-100 text-indigo-500 text-[9px] font-black rounded-lg uppercase">Customizável</span>
                    ) : null}
                  </div>
                </div>

                <div className="pt-4 flex items-center justify-between border-t border-slate-50">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">A partir de</span>
                    <span className="text-2xl font-black text-slate-900 tracking-tight">
                      R$ {product.price.toFixed(2)}
                    </span>
                  </div>
                  
                  <div className="w-10 h-10 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-inner">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4" /></svg>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {isModalOpen && (
        <ProductModal 
          product={editingProduct}
          products={products}
          onClose={() => {
            setIsModalOpen(false);
            setEditingProduct(null);
          }}
          onSave={handleSave}
        />
      )}
    </div>
  );
};
