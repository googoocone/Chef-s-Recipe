import { notFound } from 'next/navigation';
import StickyVideo from '@/components/recipe/StickyVideo';
import LikeButton from '@/components/recipe/LikeButton';
import SaveButton from '@/components/recipe/SaveButton';
import { Clock, Flame, ShoppingCart, Activity, ChefHat } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { supabase } from '@/lib/supabase/client';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const revalidate = 0;

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function RecipeDetailPage(props: PageProps) {
    const params = await props.params;

    // Create server client for auth check
    const cookieStore = await cookies();
    const supabaseServer = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() { return cookieStore.getAll() },
                setAll(cookiesToSet) {
                    try {
                        cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
                    } catch { }
                },
            },
        }
    );

    // Fetch User
    const { data: { user } } = await supabaseServer.auth.getUser();

    // Fetch recipe with all related data
    const { data: recipe, error } = await supabase
        .from('recipes')
        .select(`
            *,
            chefs (name, image_url),
            ingredients (name, amount, purchase_link),
            steps (step_order, description)
        `)
        .eq('id', params.id)
        .single();

    // Fetch Like Count
    const { count: likeCount } = await supabase
        .from('recipe_likes')
        .select('*', { count: 'exact', head: true })
        .eq('recipe_id', params.id);

    // Check if liked/saved by user
    let isLiked = false;
    let isSaved = false;
    if (user) {
        const { data: likeData } = await supabase
            .from('recipe_likes')
            .select('id')
            .eq('recipe_id', params.id)
            .eq('user_id', user.id)
            .single();
        if (likeData) isLiked = true;

        const { data: saveData } = await supabase
            .from('recipe_saves')
            .select('id')
            .eq('recipe_id', params.id)
            .eq('user_id', user.id)
            .single();
        if (saveData) isSaved = true;
    }

    if (error || !recipe) {
        // console.error(error); // Optional logging
        notFound();
    }

    // Sort steps (DB might return them unordered)
    // Casting for strict typing if needed, assuming DB returns valid data
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const steps = (recipe.steps as any[]).sort((a, b) => a.step_order - b.step_order);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const ingredients = recipe.ingredients as any[];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const chef = recipe.chefs as any;

    // Helper to convert YouTube URL to Embed URL
    const getEmbedUrl = (url: string) => {
        if (!url) return '';
        const videoIdMatch = url.match(/(?:v=|youtu\.be\/|shorts\/|embed\/)([^&?/]+)/);
        const videoId = videoIdMatch ? videoIdMatch[1] : null;
        return videoId ? `https://www.youtube.com/embed/${videoId}` : url;
    };

    // Helper to detect if video is Shorts (Vertical)
    const isShorts =
        (recipe.video_url && recipe.video_url.includes('/shorts/')) ||
        (recipe.title && recipe.title.toLowerCase().includes('#shorts')) ||
        (recipe.time && (recipe.time.includes('초') || recipe.time.toLowerCase().includes('sec')));

    // Construct a handy object similar to the old mapped one
    const r = {
        title: recipe.title,
        videoUrl: getEmbedUrl(recipe.video_url),
        time: recipe.time,
        calories: recipe.calories,
        chefName: chef?.name || 'Unknown',
        chefImage: chef?.image_url || '',
        isShorts,
        nutrition: {
            calories: recipe.calories,
            protein: recipe.protein,
            fat: recipe.fat,
            carbs: recipe.carbs
        }
    };

    return (
        <div className="bg-white min-h-screen pb-20">
            {/* Header / Hero Section (Title only) */}
            <div className="bg-white border-b border-gray-100/50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
                    <Link href="/" className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-orange-600 mb-4 transition-colors">
                        &larr; 다른 레시피 찾아보기
                    </Link>
                    <div className="flex items-center gap-3 mb-2 text-orange-600 font-bold uppercase tracking-wider text-xs md:text-sm">
                        <ChefHat size={16} />
                        <span>{r.chefName}'s Kitchen</span>
                    </div>
                    <h1 className="text-3xl md:text-5xl font-black text-gray-900 leading-tight">
                        {r.title}
                    </h1>
                </div>
            </div>

            {/* Split Layout Container */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20">

                    {/* [LEFT COLUMN] Sticky Video Player (5 cols) */}
                    <div className="lg:col-span-5">
                        <div className="sticky top-24">
                            {/* Video Component */}
                            <StickyVideo
                                src={r.videoUrl}
                                aspectRatio={r.isShorts ? '9/16' : '16/9'}
                            />

                            {/* Quick Stats (Mobile: Hidden, Desktop: Shown below video) */}
                            <div className="hidden lg:flex justify-around items-center mt-6 p-6 bg-gray-50 rounded-2xl border border-gray-100">
                                <div className="text-center">
                                    <div className="flex items-center justify-center gap-1 text-gray-400 mb-1">
                                        <Clock size={16} />
                                        <span className="text-xs">Time</span>
                                    </div>
                                    <span className="font-bold text-gray-900">{r.time}</span>
                                </div>
                                <div className="w-px h-8 bg-gray-200" />
                                <div className="text-center">
                                    <div className="flex items-center justify-center gap-1 text-orange-500 mb-1">
                                        <Flame size={16} />
                                        <span className="text-xs">Kcal</span>
                                    </div>
                                    <span className="font-bold text-gray-900">{r.calories}</span>
                                </div>
                                <div className="w-px h-8 bg-gray-200" />
                                <div className="flex gap-2">
                                    <LikeButton recipeId={recipe.id} initialCount={likeCount || 0} initialIsLiked={isLiked} />
                                    <SaveButton recipeId={recipe.id} initialIsSaved={isSaved} />
                                </div>
                            </div>

                            {/* Chef Profile (Compact) */}
                            <div className="mt-6 flex items-center gap-4 p-4 rounded-2xl border border-gray-100 bg-white shadow-sm hover:shadow-md transition-shadow cursor-pointer group">
                                <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-orange-100 group-hover:border-orange-500 transition-colors">
                                    <Image
                                        src={r.chefImage || 'https://images.unsplash.com/photo-1583394293214-28ded15ee548?q=80&w=2680&auto=format&fit=crop'}
                                        alt={r.chefName}
                                        fill
                                        className="object-cover"
                                    />
                                </div>
                                <div>
                                    <span className="block text-sm font-bold text-gray-900 group-hover:text-orange-600 transition-colors">{r.chefName} 셰프</span>
                                    <span className="block text-xs text-gray-500">팔로워 120만명</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* [RIGHT COLUMN] Scrollable Content (7 cols) */}
                    <div className="lg:col-span-7 space-y-12">
                        {/* Mobile Stats (Visible only on mobile) */}
                        <div className="flex lg:hidden justify-center items-center gap-6 text-gray-500 font-medium mb-8">
                            <div className="flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-full">
                                <Clock size={20} className="text-gray-400" />
                                <span>{r.time}</span>
                            </div>
                            <div className="flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-full">
                                <Flame size={20} className="text-orange-500" />
                                <span>{r.calories} kcal</span>
                            </div>
                            <div className="flex gap-2 bg-gray-50 rounded-2xl p-1">
                                <LikeButton recipeId={recipe.id} initialCount={likeCount || 0} initialIsLiked={isLiked} />
                                <SaveButton recipeId={recipe.id} initialIsSaved={isSaved} />
                            </div>
                        </div>

                        {/* Ingredients Section */}
                        <section>
                            <h2 className="text-2xl font-bold text-gray-900 mb-6 pb-2 border-b border-gray-100">
                                필요한 재료 <span className="text-orange-600 text-lg ml-1">{ingredients.length}</span>
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {ingredients.map((ing, idx) => (
                                    <Link
                                        key={idx}
                                        href={ing.purchase_link}
                                        target="_blank"
                                        className="group flex items-center justify-between p-4 rounded-2xl bg-white border border-gray-100 shadow-[0_4px_20px_-5px_rgba(0,0,0,0.03)] hover:shadow-lg hover:border-orange-100 hover:-translate-y-1 transition-all"
                                    >
                                        <div className="flex flex-col">
                                            <span className="text-gray-900 font-bold group-hover:text-orange-600 transition-colors">{ing.name}</span>
                                            <span className="text-gray-400 text-sm">{ing.amount}</span>
                                        </div>
                                        <div className="w-8 h-8 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center opacity-100 lg:opacity-0 group-hover:opacity-100 transition-opacity">
                                            <ShoppingCart size={14} />
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </section>

                        {/* Steps Section */}
                        <section>
                            <h2 className="text-2xl font-bold text-gray-900 mb-6 pb-2 border-b border-gray-100">
                                조리 순서
                            </h2>
                            <div className="space-y-6">
                                {steps.map((step) => (
                                    <div key={step.step_order} className="flex gap-6">
                                        <div className="flex-col items-center hidden md:flex">
                                            <div className="w-10 h-10 rounded-full bg-orange-600 text-white flex items-center justify-center font-bold text-lg shadow-lg shadow-orange-200">
                                                {step.step_order}
                                            </div>
                                            {/* Connector Line (Logic simplified: if not last, show line. Count steps or index) */}
                                            {/* For demo simplicity, just showing line always or checking index if map provided index */}
                                            <div className="w-0.5 flex-1 bg-gray-100 my-2" />
                                        </div>
                                        {/* Step Card */}
                                        <div className="flex-1 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm md:hover:shadow-md transition-shadow">
                                            <div className="flex items-center gap-3 md:hidden mb-3">
                                                <span className="text-orange-600 font-bold text-lg">Step {step.step_order}</span>
                                            </div>
                                            <p className="text-lg text-gray-800 leading-relaxed">
                                                {step.description}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* Nutrition Section */}
                        <section>
                            <h2 className="text-2xl font-bold text-gray-900 mb-6 pb-2 border-b border-gray-100 flex items-center gap-2">
                                <Activity className="text-green-500" /> 영양 정보
                            </h2>
                            <div className="bg-gray-50 rounded-3xl p-8">
                                <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
                                    <div className="text-center">
                                        <span className="block text-gray-400 text-xs uppercase font-bold tracking-wider mb-2">Calories</span>
                                        <span className="block text-3xl font-black text-gray-900">{r.nutrition.calories}</span>
                                    </div>
                                    <div className="text-center relative">
                                        <span className="block text-gray-400 text-xs uppercase font-bold tracking-wider mb-2">Protein</span>
                                        <span className="block text-2xl font-bold text-gray-900">{r.nutrition.protein}</span>
                                    </div>
                                    <div className="text-center relative">
                                        <span className="block text-gray-400 text-xs uppercase font-bold tracking-wider mb-2">Fat</span>
                                        <span className="block text-2xl font-bold text-gray-900">{r.nutrition.fat}</span>
                                    </div>
                                    <div className="text-center relative">
                                        <span className="block text-gray-400 text-xs uppercase font-bold tracking-wider mb-2">Carbs</span>
                                        <span className="block text-2xl font-bold text-gray-900">{r.nutrition.carbs}</span>
                                    </div>
                                </div>
                            </div>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    );
}
