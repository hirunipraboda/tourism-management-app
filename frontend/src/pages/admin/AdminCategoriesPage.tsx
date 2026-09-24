import React, { useEffect, useState } from 'react';
import { Layers, Plus, Compass } from 'lucide-react';
import { adminService } from '../../services/adminService';

export const AdminCategoriesPage: React.FC = () => {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadCategories = async () => {
    setLoading(true);
    try {
      const data = await adminService.fetchCategories();
      setCategories(data);
    } catch (err) {
      console.error('Failed to load categories', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#0B3A53] font-heading tracking-tight">
            Destination Categories
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            Standardized tourism taxonomy used by the Destination Research and Recommendation AI agents.
          </p>
        </div>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((cat) => (
          <div
            key={cat.id}
            className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-3 hover:shadow-md transition-shadow"
          >
            <div className="w-10 h-10 rounded-2xl bg-teal-50 text-[#16A6A1] flex items-center justify-center font-black">
              <Layers className="w-5 h-5" />
            </div>

            <div>
              <h3 className="text-base font-black text-[#0B3A53] font-heading">{cat.name}</h3>
              <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">{cat.slug}</span>
            </div>

            <p className="text-xs text-slate-500 font-medium leading-relaxed">
              {cat.description}
            </p>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="font-bold text-[#146C86]">AI Taxonomy Tag</span>
              <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                Active
              </span>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};
