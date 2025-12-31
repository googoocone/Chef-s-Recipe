'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { ChefHat, Search, Save, RefreshCw, Wand2, Link as LinkIcon, AlertCircle, CheckCircle } from 'lucide-react';
import Image from 'next/image';

interface ExtractedRecipe {
    title: string;
    description: string;
    ingredients: { name: string; amount: string }[];
    steps: { order: number; description: string }[];
    time: string;
    calories: number;
    nutrition: { calories: number; protein: string; fat: string; carbs: string };
    videoId: string;
    videoUrl: string;
    thumbnailUrl: string;
}

export default function CrawlerPage() {
    const [url, setUrl] = useState('');
    const [status, setStatus] = useState<'idle' | 'extracting' | 'review' | 'saving' | 'success' | 'error'>('idle');
    const [errorMsg, setErrorMsg] = useState('');
    const [data, setData] = useState<ExtractedRecipe | null>(null);

    // Form states for manual review
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [editData, setEditData] = useState<ExtractedRecipe | null>(null);

    const handleExtract = async () => {
        if (!url) return;
        setStatus('extracting');
        setErrorMsg('');
        setData(null);

        try {
            const res = await fetch('/api/extract', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url })
            });

            const result = await res.json();

            if (!res.ok) {
                throw new Error(result.error || 'Failed to extract');
            }

            setData(result);
            setEditData(result);
            setStatus('review');
        } catch (err: any) {
            setErrorMsg(err.message);
            setStatus('error');
        }
    };

    const handleSave = async () => {
        if (!data) return;
        setStatus('saving');

        try {
            // Check for a default chef (for testing, we'll pick the first one or created specific 'AI Chef')
            // Real app: Select Chef dropdown
            const { data: chefs } = await supabase.from('chefs').select('id').limit(1);
            const defaultChefId = chefs?.[0]?.id;

            if (!defaultChefId) throw new Error('No chefs found to assign this recipe to.');

            // 1. Insert Recipe
            const { data: recipeData, error: recipeError } = await supabase
                .from('recipes')
                .insert({
                    title: data.title, // User edited title could be used here
                    chef_id: defaultChefId,
                    image_url: data.thumbnailUrl, // Use YouTube thumbnail as recipe image
                    time: data.time,
                    calories: data.calories,
                    protein: data.nutrition.protein,
                    fat: data.nutrition.fat,
                    carbs: data.nutrition.carbs,
                    is_recommended: false,
                    video_url: data.videoUrl
                })
                .select()
                .single();

            if (recipeError) throw new Error(recipeError.message);

            // 2. Insert Ingredients
            const ingPayload = data.ingredients.map(ing => ({
                recipe_id: recipeData.id,
                name: ing.name,
                amount: ing.amount,
                purchase_link: 'https://coupang.com' // Placeholder
            }));
            await supabase.from('ingredients').insert(ingPayload);

            // 3. Insert Steps
            const stepPayload = data.steps.map(step => ({
                recipe_id: recipeData.id,
                step_order: step.order,
                description: step.description
            }));
            await supabase.from('steps').insert(stepPayload);

            setStatus('success');
            setUrl('');
        } catch (err: any) {
            setErrorMsg(err.message);
            setStatus('error'); // Go back to review state effectively or show error
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto space-y-8">

                {/* Header */}
                <div className="text-center">
                    <div className="inline-flex items-center justify-center p-3 bg-white rounded-2xl shadow-sm mb-4">
                        <Wand2 className="text-purple-600" size={32} />
                    </div>
                    <h1 className="text-3xl font-black text-gray-900 mb-2">AI Recipe Crawler</h1>
                    <p className="text-gray-500">YouTube 링크만 넣으면 레시피가 뚝딱! (Powered by Gemini)</p>
                </div>

                {/* Input Section */}
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                    <div className="flex gap-4">
                        <div className="relative flex-1">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                                <LinkIcon size={20} />
                            </div>
                            <input
                                type="text"
                                value={url}
                                onChange={(e) => setUrl(e.target.value)}
                                className="w-full pl-12 pr-4 py-4 bg-gray-50 rounded-xl border border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all"
                                placeholder="https://www.youtube.com/watch?v=..."
                                disabled={status === 'extracting'}
                            />
                        </div>
                        <button
                            onClick={handleExtract}
                            disabled={!url || status === 'extracting'}
                            className="bg-purple-600 text-white font-bold px-8 py-4 rounded-xl hover:bg-purple-700 transition-all shadow-lg hover:shadow-purple-200 disabled:bg-gray-300 disabled:shadow-none min-w-[140px] flex items-center justify-center gap-2"
                        >
                            {status === 'extracting' ? <RefreshCw className="animate-spin" /> : <Wand2 />}
                            <span>추출하기</span>
                        </button>
                    </div>

                    {errorMsg && (
                        <div className="mt-4 p-4 bg-red-50 text-red-600 rounded-xl flex items-center gap-2 text-sm font-medium animate-shake">
                            <AlertCircle size={16} />
                            {errorMsg}
                        </div>
                    )}
                </div>

                {/* Processing State */}
                {status === 'extracting' && (
                    <div className="text-center py-20">
                        <div className="inline-block animate-bounce mb-4 text-4xl">🍳</div>
                        <h3 className="text-xl font-bold text-gray-900 mb-1">영상을 분석하고 있어요...</h3>
                        <p className="text-gray-400">자막을 읽고 재료와 순서를 정리하는 중입니다.</p>
                    </div>
                )}

                {/* Result Preview & Save */}
                {(status === 'review' || status === 'success' || status === 'saving' || (status === 'error' && data)) && data && (
                    <div className="space-y-6 animate-fade-in-up">
                        <div className="bg-white p-8 rounded-3xl shadow-lg border border-gray-100 overflow-hidden">
                            {/* Top: Video Info */}
                            <div className="flex flex-col md:flex-row gap-8 mb-8 pb-8 border-b border-gray-100">
                                <div className="relative w-full md:w-1/3 aspect-video rounded-2xl overflow-hidden bg-black shadow-md">
                                    <Image src={data.thumbnailUrl} alt="Thumbnail" fill className="object-cover" />
                                </div>
                                <div className="flex-1 space-y-4">
                                    <div>
                                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Recipe Title</label>
                                        <h2 className="text-2xl font-black text-gray-900 mt-1">{data.title}</h2>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-gray-50 p-3 rounded-xl">
                                            <span className="text-xs text-gray-400 block">Time</span>
                                            <span className="font-bold text-gray-900">{data.time}</span>
                                        </div>
                                        <div className="bg-gray-50 p-3 rounded-xl">
                                            <span className="text-xs text-gray-400 block">Calories</span>
                                            <span className="font-bold text-gray-900">{data.calories} kcal</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Middle: Ingredients */}
                            <div className="mb-8">
                                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                    <ChefHat className="text-orange-500" size={20} /> 재료 목록
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {data.ingredients.map((ing, i) => (
                                        <div key={i} className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                                            <span className="font-medium text-gray-700">{ing.name}</span>
                                            <span className="text-gray-400 text-sm">{ing.amount}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Bottom: Steps */}
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 mb-4">조리 순서</h3>
                                <div className="space-y-3">
                                    {data.steps.map((step) => (
                                        <div key={step.order} className="flex gap-4">
                                            <div className="w-6 h-6 rounded-full bg-gray-900 text-white flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                                                {step.order}
                                            </div>
                                            <p className="text-gray-600 leading-relaxed">{step.description}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex justify-end gap-4">
                            {status === 'success' ? (
                                <div className="px-8 py-4 bg-green-100 text-green-700 font-bold rounded-xl flex items-center gap-2">
                                    <CheckCircle /> 저장 완료!
                                </div>
                            ) : (
                                <button
                                    onClick={handleSave}
                                    disabled={status === 'saving'}
                                    className="w-full md:w-auto px-10 py-4 bg-gray-900 text-white font-bold rounded-xl hover:bg-gray-800 shadow-xl hover:-translate-y-1 transition-all flex items-center justify-center gap-2"
                                >
                                    {status === 'saving' ? <RefreshCw className="animate-spin" /> : <Save />}
                                    <span>데이터베이스에 저장하기</span>
                                </button>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
