
import React, { useState, useEffect, useMemo } from 'react';
import { Product, ProductOption } from '../types';

interface ProductModalProps {
  product?: Product | null;
  products: Product[]; // Necessário para derivar categorias existentes
  onClose: () => void;
  onSave: (product: Product) => void;
}

export const ProductModal: React.FC<ProductModalProps> = ({ product, products, onClose, onSave }) => {
  const [formData, setFormData] = useState<Partial<Product>>({
    name: '',
    price: 0,
    category: 'Pizzas',
    image: '',
    availableSizes: [],
    availableAddons: [],
    availableCrusts: []
  });

  const [isAddingNewCategory, setIsAddingNewCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  
  // States para novos opcionais
  const [newOptionName, setNewOptionName] = useState('');
  const [newOptionPrice, setNewOptionPrice] = useState('');
  const [optionType, setOptionType] = useState<'addon' | 'crust'>('addon');

  // Deriva categorias únicas dos produtos existentes para o select
  const existingCategories = useMemo(() => {
    const defaultCats = ['Pizzas', 'Hambúrgueres', 'Combos', 'Bebidas', 'Sobremesas'];
    const fromProducts = products.map(p => p.category);
    return Array.from(new Set([...defaultCats, ...fromProducts]));
  }, [products]);

  useEffect(() => {
    if (product) {
      setFormData({
        ...product,
        availableAddons: product.availableAddons || [],
        availableCrusts: product.availableCrusts || []
      });
    }
  }, [product]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalCategory = isAddingNewCategory ? newCategoryName : formData.category;
    
    if (formData.name && formData.price !== undefined && finalCategory) {
      onSave({
        ...formData,
        category: finalCategory,
        id: product?.id || Math.random().toString(36).substr(2, 9),
      } as Product);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, image: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddOption = () => {
    if (!newOptionName || !newOptionPrice) return;
    const option = { name: newOptionName, price: parseFloat(newOptionPrice) };
    
    if (optionType === 'addon') {
      setFormData(prev => ({ ...prev, availableAddons: [...(prev.availableAddons || []), option] }));
    } else {
      setFormData(prev => ({ ...prev, availableCrusts: [...(prev.availableCrusts || []), option] }));
    }
    
    setNewOptionName('');
    setNewOptionPrice('');
  };

  const removeOption = (type: 'addon' | 'crust', name: string) => {
    if (type === 'addon') {
      setFormData(prev => ({ ...prev, availableAddons: prev.availableAddons?.filter(o => o.name !== name) }));
    } else {
      setFormData(prev => ({ ...prev, availableCrusts: prev.availableCrusts?.filter(o => o.name !== name) }));
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 max-h-[90vh] flex flex-col">
        <div className="p-6 border-b flex justify-between items-center bg-slate-50">
          <h3 className="text-xl font-black text-slate-800">
            {product ? 'Editar Produto' : 'Novo Produto'}
          </h3>
          <button onClick={onClose} type="button" className="p-2 hover:bg-slate-200 rounded-full transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto">
          {/* Foto do Produto */}
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Foto do Produto</label>
            <div className="flex items-center gap-4">
              <div className="relative w-24 h-24 bg-slate-100 rounded-2xl overflow-hidden border-2 border-slate-200 border-dashed flex items-center justify-center shrink-0">
                {formData.image ? (
                  <img src={formData.image} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <svg className="w-8 h-8 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                )}
              </div>
              <div className="flex-1">
                <p className="text-[10px] text-slate-400 mb-2">Upload de imagem (JPEG, PNG ou GIF)</p>
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={handleImageChange}
                  className="block w-full text-xs text-slate-500
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-full file:border-0
                    file:text-xs file:font-bold
                    file:bg-indigo-50 file:text-indigo-700
                    hover:file:bg-indigo-100 cursor-pointer"
                />
                {formData.image && (
                  <button 
                    type="button" 
                    onClick={() => setFormData({...formData, image: ''})} 
                    className="text-[10px] font-bold text-red-500 mt-2 uppercase tracking-widest hover:text-red-700"
                  >
                    Remover Foto
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Nome do Produto</label>
              <input 
                type="text" 
                required
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
                className="w-full px-4 py-3 bg-slate-100 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                placeholder="Ex: Pizza de Calabresa"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Preço Base (R$)</label>
                <input 
                  type="number" 
                  step="0.01"
                  required
                  value={formData.price}
                  onChange={e => setFormData({...formData, price: parseFloat(e.target.value)})}
                  className="w-full px-4 py-3 bg-slate-100 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold"
                />
              </div>
              
              <div className="space-y-1">
                <div className="flex justify-between items-center mb-1">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Categoria</label>
                  <button 
                    type="button"
                    onClick={() => setIsAddingNewCategory(!isAddingNewCategory)}
                    className="text-[10px] font-bold text-indigo-600 hover:text-indigo-800 uppercase"
                  >
                    {isAddingNewCategory ? 'Selecionar' : '+ Nova'}
                  </button>
                </div>
                
                {isAddingNewCategory ? (
                  <input 
                    type="text"
                    required
                    autoFocus
                    placeholder="Nome da categoria..."
                    className="w-full px-4 py-3 bg-indigo-50 border-2 border-indigo-100 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-indigo-700 animate-in slide-in-from-top-1"
                    value={newCategoryName}
                    onChange={e => setNewCategoryName(e.target.value)}
                  />
                ) : (
                  <select 
                    value={formData.category}
                    onChange={e => setFormData({...formData, category: e.target.value})}
                    className="w-full px-4 py-3 bg-slate-100 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold"
                  >
                    {existingCategories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Tamanhos Disponíveis</label>
            <div className="flex gap-2">
              {['P', 'M', 'G', 'GG'].map(size => (
                <button
                  key={size}
                  type="button"
                  onClick={() => {
                    const current = formData.availableSizes || [];
                    const next = current.includes(size) ? current.filter(s => s !== size) : [...current, size];
                    setFormData({...formData, availableSizes: next});
                  }}
                  className={`px-4 py-2 rounded-lg text-xs font-black transition-all ${
                    formData.availableSizes?.includes(size) ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-100 text-slate-400'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          <div className="border-t pt-4 space-y-4">
            <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Adicionais e Bordas</h4>
            
            <div className="grid grid-cols-2 gap-2 mb-2">
              <button 
                type="button" 
                onClick={() => setOptionType('addon')}
                className={`py-2 rounded-lg text-[10px] font-black transition-all ${optionType === 'addon' ? 'bg-orange-100 text-orange-700 border-orange-200' : 'bg-slate-50 text-slate-400 border-transparent'} border`}
              >ADICIONAL</button>
              <button 
                type="button" 
                onClick={() => setOptionType('crust')}
                className={`py-2 rounded-lg text-[10px] font-black transition-all ${optionType === 'crust' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-slate-50 text-slate-400 border-transparent'} border`}
              >BORDA (PIZZA)</button>
            </div>

            <div className="flex gap-2">
              <input type="text" placeholder="Nome" value={newOptionName} onChange={e => setNewOptionName(e.target.value)} className="flex-1 px-3 py-2 text-xs bg-slate-50 rounded-lg outline-none focus:ring-1 focus:ring-indigo-500"/>
              <input type="number" placeholder="R$" value={newOptionPrice} onChange={e => setNewOptionPrice(e.target.value)} className="w-20 px-3 py-2 text-xs bg-slate-50 rounded-lg outline-none focus:ring-1 focus:ring-indigo-500 font-bold"/>
              <button type="button" onClick={handleAddOption} className="px-3 py-2 bg-indigo-600 text-white rounded-lg text-xs font-bold">+</button>
            </div>

            <div className="space-y-1">
              {(formData.availableAddons || []).map(o => (
                <div key={o.name} className="flex justify-between items-center p-2 bg-orange-50 rounded-lg border border-orange-100">
                  <span className="text-[10px] font-bold text-orange-700">Adicional: {o.name} - R${o.price.toFixed(2)}</span>
                  <button type="button" onClick={() => removeOption('addon', o.name)} className="text-orange-300 hover:text-orange-600"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg></button>
                </div>
              ))}
              {(formData.availableCrusts || []).map(o => (
                <div key={o.name} className="flex justify-between items-center p-2 bg-emerald-50 rounded-lg border border-emerald-100">
                  <span className="text-[10px] font-bold text-emerald-700">Borda: {o.name} - R${o.price.toFixed(2)}</span>
                  <button type="button" onClick={() => removeOption('crust', o.name)} className="text-emerald-300 hover:text-emerald-600"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg></button>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 sticky bottom-0 bg-white">
            <button 
              type="submit"
              className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 uppercase tracking-widest active:scale-[0.98]"
            >
              {product ? 'Salvar Alterações' : 'Cadastrar Produto'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
