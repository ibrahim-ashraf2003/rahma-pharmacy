import React, { useEffect, useState } from 'react';
import { Copy, Check, Edit2, Trash2, Plus, X, Ticket } from 'lucide-react';
import { getCoupons, createCoupon, updateCoupon, deleteCoupon } from '../../lib/api';
import { toast } from '../../lib/toast';

export default function AdminCoupons() {
  const [coupons, setCoupons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<any | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    code: '',
    discountType: 'fixed',
    discountValue: '',
    minOrderAmount: '',
    usageLimit: '',
    expiresAt: '',
    active: true
  });

  const fetchCoupons = async () => {
    try {
      const res = await getCoupons();
      setCoupons(res.coupons || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load coupons');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleOpenModal = (coupon: any | null = null) => {
    if (coupon) {
      setEditingCoupon(coupon);
      setFormData({
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue.toString(),
        minOrderAmount: coupon.minOrderAmount?.toString() || '',
        usageLimit: coupon.usageLimit?.toString() || '',
        expiresAt: coupon.expiresAt ? new Date(coupon.expiresAt).toISOString().split('T')[0] : '',
        active: coupon.active,
      });
    } else {
      setEditingCoupon(null);
      setFormData({
        code: '',
        discountType: 'fixed',
        discountValue: '',
        minOrderAmount: '',
        usageLimit: '',
        expiresAt: '',
        active: true,
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      code: formData.code.toUpperCase(),
      discountType: formData.discountType,
      discountValue: Number(formData.discountValue),
      minOrderAmount: formData.minOrderAmount ? Number(formData.minOrderAmount) : undefined,
      usageLimit: formData.usageLimit ? Number(formData.usageLimit) : undefined,
      expiresAt: formData.expiresAt ? new Date(formData.expiresAt).toISOString() : undefined,
      active: formData.active,
    };

    try {
      if (editingCoupon) {
        await updateCoupon(editingCoupon._id, data);
      } else {
        await createCoupon(data);
      }
      setIsModalOpen(false);
      fetchCoupons();
    } catch (err: any) {
      alert(err.message || 'Failed to save coupon');
    }
  };

  const handleCopyCode = async (code: string, id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(code);
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = code;
        textArea.style.position = 'fixed';
        textArea.style.opacity = '0';
        textArea.style.left = '-9999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }
      setCopiedId(id);
      toast.success(`تم نسخ الكود: ${code} / Copied!`);
      setTimeout(() => {
        setCopiedId((current) => (current === id ? null : current));
      }, 2000);
    } catch (err) {
      console.error('Failed to copy code', err);
      toast.error('فشل نسخ الكود');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this coupon?')) return;
    try {
      await deleteCoupon(id);
      fetchCoupons();
    } catch (err: any) {
      alert('Failed to delete coupon');
    }
  };

  if (loading) return <div className="p-10 text-center">Loading...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-10">
        <h1 className="text-4xl font-black uppercase tracking-tighter">Coupons</h1>
        <button 
          onClick={() => handleOpenModal()}
          className="bg-black text-white px-8 py-3 rounded-full font-bold text-sm uppercase tracking-widest hover:bg-gray-900 transition-all"
        >
          Add Coupon
        </button>
      </div>

      {error && <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 text-sm font-bold">{error}</div>}

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-gray-400">Code / الكود</th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-gray-400">Discount</th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-gray-400">Usage</th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-gray-400">Status</th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-gray-400 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {coupons.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-20 text-center text-gray-400">No coupons yet.</td>
              </tr>
            )}
            {coupons.map((coupon) => {
              const isCopied = copiedId === coupon._id;
              return (
                <tr key={coupon._id} className="hover:bg-gray-50/80 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <span className="font-mono font-extrabold text-sm tracking-wider uppercase bg-gray-100 text-gray-900 px-3 py-1.5 rounded-lg border border-gray-200 shadow-xs">
                        {coupon.code}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => handleCopyCode(coupon.code, coupon._id, e)}
                        title="Copy coupon code / نسخ الكود"
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-xs active:scale-95 ${
                          isCopied
                            ? 'bg-emerald-600 text-white shadow-emerald-200'
                            : 'bg-white hover:bg-black hover:text-white text-gray-700 border border-gray-200 hover:border-black'
                        }`}
                      >
                        {isCopied ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-white animate-in zoom-in-50" />
                            <span>Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copy Code</span>
                          </>
                        )}
                      </button>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                    {coupon.discountType === 'percentage' ? `${coupon.discountValue}%` : `LE ${coupon.discountValue}`}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {coupon.usedCount || 0} {coupon.usageLimit > 0 ? `/ ${coupon.usageLimit}` : ' used'}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${coupon.active ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-gray-100 text-gray-500'}`}>
                      {coupon.active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={(e) => handleCopyCode(coupon.code, coupon._id, e)}
                        title="Copy code / نسخ الكود"
                        className={`p-2 rounded-lg transition-all ${
                          isCopied ? 'bg-emerald-100 text-emerald-700' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
                        }`}
                      >
                        {isCopied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => handleOpenModal(coupon)}
                        title="Edit coupon"
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(coupon._id)}
                        title="Delete coupon"
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden flex flex-col">
            <div className="p-8 border-b border-gray-100 flex justify-between items-center">
              <h2 className="text-2xl font-black uppercase tracking-tighter">{editingCoupon ? 'Edit Coupon' : 'Create Coupon'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><X className="w-5 h-5" /></button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-xs font-bold uppercase tracking-widest text-gray-400">Coupon Code</label>
                    {formData.code && (
                      <button
                        type="button"
                        onClick={() => handleCopyCode(formData.code, 'modal-code')}
                        className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 font-bold"
                      >
                        {copiedId === 'modal-code' ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-600" />
                            <span className="text-emerald-600">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Copy Code</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                  <input type="text" required uppercase="true" className="w-full uppercase bg-gray-50 border border-gray-100 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-black font-mono font-bold tracking-wider" value={formData.code} onChange={e => setFormData({...formData, code: e.target.value.toUpperCase()})} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold uppercase tracking-widest text-gray-400">Type</label>
                    <select className="w-full bg-gray-50 border border-gray-100 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-black" value={formData.discountType} onChange={e => setFormData({...formData, discountType: e.target.value})}>
                      <option value="fixed">Fixed (LE)</option>
                      <option value="percentage">Percentage (%)</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold uppercase tracking-widest text-gray-400">Value</label>
                    <input type="number" required min="1" className="w-full bg-gray-50 border border-gray-100 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-black" value={formData.discountValue} onChange={e => setFormData({...formData, discountValue: e.target.value})} />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-bold uppercase tracking-widest text-gray-400">Min Order Amount (LE) - Optional</label>
                  <input type="number" min="0" className="w-full bg-gray-50 border border-gray-100 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-black" value={formData.minOrderAmount} onChange={e => setFormData({...formData, minOrderAmount: e.target.value})} />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase tracking-widest text-gray-400">Usage Limit - Optional</label>
                  <input type="number" min="0" className="w-full bg-gray-50 border border-gray-100 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-black" value={formData.usageLimit} onChange={e => setFormData({...formData, usageLimit: e.target.value})} />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase tracking-widest text-gray-400">Expires At - Optional</label>
                  <input type="date" className="w-full bg-gray-50 border border-gray-100 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-black" value={formData.expiresAt} onChange={e => setFormData({...formData, expiresAt: e.target.value})} />
                </div>
                <label className="flex items-center gap-2 cursor-pointer mt-4">
                  <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-black focus:ring-black" checked={formData.active} onChange={e => setFormData({...formData, active: e.target.checked})} />
                  <span className="text-xs font-bold uppercase tracking-widest text-gray-400">Active</span>
                </label>
              </div>
              <button type="submit" className="w-full bg-black text-white py-4 rounded-xl font-bold uppercase tracking-widest hover:bg-gray-900 transition-all shadow-xl shadow-black/10">
                {editingCoupon ? 'Update Coupon' : 'Create Coupon'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
