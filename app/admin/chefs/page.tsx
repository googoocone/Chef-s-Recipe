'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Edit2, Save, X, ChefHat, Plus, Check } from 'lucide-react';

interface Chef {
    id: string;
    name: string;
    image_url: string;
}

export default function ChefManagementPage() {
    const [chefs, setChefs] = useState<Chef[]>([]);
    const [loading, setLoading] = useState(true);

    // Editing State
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editName, setEditName] = useState('');
    const [editImage, setEditImage] = useState('');

    // Adding State
    const [isAdding, setIsAdding] = useState(false);
    const [newName, setNewName] = useState('');
    const [newImage, setNewImage] = useState('');

    useEffect(() => {
        fetchChefs();
    }, []);

    const fetchChefs = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('chefs')
            .select('*')
            .order('name');

        if (error) {
            alert('Failed to fetch chefs');
            console.error(error);
        } else {
            setChefs(data || []);
        }
        setLoading(false);
    };

    // --- Add Handlers ---
    const startAdding = () => {
        setIsAdding(true);
        setNewName('');
        setNewImage('');
        // Cancel any active edit
        setEditingId(null);
    };

    const cancelAdding = () => {
        setIsAdding(false);
        setNewName('');
        setNewImage('');
    };

    const saveNewChef = async () => {
        if (!newName.trim() || !newImage.trim()) {
            alert('Name and Image URL are required');
            return;
        }

        const { data, error } = await supabase
            .from('chefs')
            .insert([{ name: newName, image_url: newImage }])
            .select()
            .single();

        if (error) {
            alert('Failed to add chef: ' + error.message);
        } else if (data) {
            setChefs([data, ...chefs]);
            cancelAdding();
        }
    };

    // --- Edit Handlers ---
    const startEditing = (chef: Chef) => {
        setEditingId(chef.id);
        setEditName(chef.name);
        setEditImage(chef.image_url);
        // Cancel active add
        setIsAdding(false);
    };

    const cancelEditing = () => {
        setEditingId(null);
        setEditName('');
        setEditImage('');
    };

    const saveChef = async (id: string) => {
        const { error } = await supabase
            .from('chefs')
            .update({ name: editName, image_url: editImage })
            .eq('id', id);

        if (error) {
            alert('Failed to update chef');
            console.error(error);
        } else {
            setChefs(chefs.map(c => c.id === id ? { ...c, name: editName, image_url: editImage } : c));
            setEditingId(null);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-5xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-12">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-white border border-gray-200 rounded-2xl text-orange-600 shadow-sm">
                            <ChefHat size={28} />
                        </div>
                        <div>
                            <h1 className="text-3xl font-black text-gray-900">Chef Management</h1>
                            <p className="text-gray-500 font-medium">등록된 셰프 정보를 수정합니다.</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Link
                            href="/admin"
                            className="flex items-center gap-2 px-6 py-3 bg-white border border-gray-200 rounded-xl text-gray-600 font-bold hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm"
                        >
                            <ArrowLeft size={18} />
                            뒤로가기
                        </Link>
                        <button
                            onClick={startAdding}
                            className="flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-xl font-bold hover:bg-black transition-all shadow-xl hover:scale-105 active:scale-95"
                        >
                            <Plus size={18} />
                            Add Chef
                        </button>
                    </div>
                </div>

                {/* Add Form (Visible only when adding) */}
                {isAdding && (
                    <div className="mb-8 p-6 bg-white rounded-3xl border-2 border-orange-100 shadow-lg animate-in slide-in-from-top-4 fade-in duration-300">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                <span className="w-8 h-8 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center"><Plus size={16} /></span>
                                Add New Chef
                            </h3>
                            <button onClick={cancelAdding} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <div>
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1 block">Name</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Gordon Ramsay"
                                        value={newName}
                                        onChange={(e) => setNewName(e.target.value)}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 font-bold text-gray-900"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1 block">Image URL</label>
                                    <input
                                        type="text"
                                        placeholder="https://..."
                                        value={newImage}
                                        onChange={(e) => setNewImage(e.target.value)}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm font-mono text-gray-600"
                                    />
                                </div>
                                <div className="flex gap-3 pt-2">
                                    <button
                                        onClick={saveNewChef}
                                        className="flex-1 bg-orange-600 text-white py-3 rounded-xl font-bold hover:bg-orange-700 transition-colors flex items-center justify-center gap-2"
                                    >
                                        <Check size={18} /> Save Chef
                                    </button>
                                </div>
                            </div>
                            {/* Live Preview */}
                            <div className="flex flex-col items-center justify-center p-6 bg-gray-50 rounded-2xl border border-gray-100 border-dashed">
                                <div className="relative w-32 h-32 rounded-full overflow-hidden bg-white shadow-md border-4 border-white mb-3">
                                    {newImage ? (
                                        <Image src={newImage} alt="Preview" fill className="object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-300">
                                            <ChefHat size={32} />
                                        </div>
                                    )}
                                </div>
                                <span className="text-sm font-bold text-gray-400">Preview</span>
                            </div>
                        </div>
                    </div>
                )}

                {/* List */}
                {loading ? (
                    <div className="text-center py-20 text-gray-500">Loading chefs...</div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {chefs.map((chef) => (
                            <div key={chef.id} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-start gap-6 group hover:shadow-md transition-shadow">
                                {/* Image Preview */}
                                <div className="relative w-24 h-24 rounded-2xl overflow-hidden bg-gray-100 shrink-0 border border-gray-100">
                                    <Image
                                        src={editingId === chef.id ? editImage : chef.image_url}
                                        alt={chef.name}
                                        fill
                                        className="object-cover"
                                        onError={(e) => {
                                            // Fallback if image breaks during edit preview
                                            (e.target as HTMLImageElement).src = 'https://via.placeholder.com/150?text=No+Image';
                                        }}
                                    />
                                </div>

                                <div className="flex-1 min-w-0">
                                    {editingId === chef.id ? (
                                        <div className="space-y-3">
                                            <div>
                                                <label className="text-xs font-bold text-gray-400 mb-1 block">이름</label>
                                                <input
                                                    type="text"
                                                    value={editName}
                                                    onChange={(e) => setEditName(e.target.value)}
                                                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 font-bold text-gray-900"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-xs font-bold text-gray-400 mb-1 block">이미지 URL</label>
                                                <div className="flex gap-2">
                                                    <input
                                                        type="text"
                                                        value={editImage}
                                                        onChange={(e) => setEditImage(e.target.value)}
                                                        className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 text-xs text-gray-600 font-mono"
                                                    />
                                                </div>
                                            </div>
                                            <div className="flex gap-2 pt-2">
                                                <button
                                                    onClick={() => saveChef(chef.id)}
                                                    className="flex-1 bg-orange-600 text-white py-2 rounded-xl font-bold hover:bg-orange-700 transition-colors flex items-center justify-center gap-2"
                                                >
                                                    <Save size={16} /> 저장
                                                </button>
                                                <button
                                                    onClick={cancelEditing}
                                                    className="px-4 bg-gray-100 text-gray-500 py-2 rounded-xl font-bold hover:bg-gray-200 transition-colors"
                                                >
                                                    <X size={18} />
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex justify-between items-start h-full">
                                            <div>
                                                <h3 className="text-xl font-bold text-gray-900 mb-1">{chef.name}</h3>
                                                <p className="text-xs text-gray-400 font-mono line-clamp-1 break-all bg-gray-50 p-1 rounded inline-block max-w-[200px]">{chef.image_url}</p>
                                            </div>
                                            <button
                                                onClick={() => startEditing(chef)}
                                                className="p-2 bg-gray-50 text-gray-400 rounded-xl hover:bg-orange-50 hover:text-orange-600 transition-colors"
                                            >
                                                <Edit2 size={18} />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
