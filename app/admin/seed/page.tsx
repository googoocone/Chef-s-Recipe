'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { CHEFS, RECIPES } from '@/lib/placeholder-data';
import { ChefHat, Database, Check, AlertCircle } from 'lucide-react';

export default function SeedPage() {
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [logs, setLogs] = useState<string[]>([]);

    const addLog = (message: string) => setLogs(prev => [...prev, message]);

    const handleSeed = async () => {
        setStatus('loading');
        setLogs([]);
        addLog('Starting migration...');

        try {
            // 1. Migrate Chefs
            addLog('Migrating Chefs...');
            const chefMap = new Map<string, string>(); // oldId -> newUuid

            for (const chef of CHEFS) {
                const { data, error } = await supabase
                    .from('chefs')
                    .insert({ name: chef.name, image_url: chef.image })
                    .select()
                    .single();

                if (error) throw new Error(`Chef Error: ${error.message}`);
                chefMap.set(chef.id, data.id);
                addLog(`✅ Chef migrated: ${chef.name}`);
            }

            // 2. Migrate Recipes
            addLog('Migrating Recipes...');
            for (const recipe of RECIPES) {
                const newChefId = chefMap.get(recipe.chefId);
                if (!newChefId) {
                    addLog(`❌ Skipping recipe ${recipe.title}: Chef ID not found`);
                    continue;
                }

                // Insert Recipe
                const { data: recipeData, error: recipeError } = await supabase
                    .from('recipes')
                    .insert({
                        title: recipe.title,
                        chef_id: newChefId,
                        image_url: recipe.image,
                        time: recipe.time,
                        calories: recipe.calories,
                        protein: recipe.nutrition.protein,
                        fat: recipe.nutrition.fat,
                        carbs: recipe.nutrition.carbs,
                        is_recommended: recipe.isRecommended,
                        video_url: recipe.videoUrl
                    })
                    .select()
                    .single();

                if (recipeError) throw new Error(`Recipe Error: ${recipeError.message}`);
                addLog(`✅ Recipe migrated: ${recipe.title}`);

                // Insert Ingredients
                if (recipe.ingredients.length > 0) {
                    const ingredientsPayload = recipe.ingredients.map(ing => ({
                        recipe_id: recipeData.id,
                        name: ing.name,
                        amount: ing.amount,
                        purchase_link: ing.purchaseLink
                    }));
                    const { error: ingError } = await supabase.from('ingredients').insert(ingredientsPayload);
                    if (ingError) throw new Error(`Ingredient Error: ${ingError.message}`);
                }

                // Insert Steps
                if (recipe.steps.length > 0) {
                    const stepsPayload = recipe.steps.map(step => ({
                        recipe_id: recipeData.id,
                        step_order: step.order,
                        description: step.description
                    }));
                    const { error: stepError } = await supabase.from('steps').insert(stepsPayload);
                    if (stepError) throw new Error(`Step Error: ${stepError.message}`);
                }
            }

            setStatus('success');
            addLog('🎉 All data migrated successfully!');

        } catch (error: any) {
            console.error(error);
            setStatus('error');
            addLog(`🚨 Error: ${error.message}`);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8">
                <div className="flex items-center justify-center w-16 h-16 bg-orange-100 rounded-full mx-auto mb-6 text-orange-600">
                    <Database size={32} />
                </div>
                <h1 className="text-2xl font-bold text-center text-gray-900 mb-2">Data Seeder</h1>
                <p className="text-center text-gray-500 mb-8">
                    Push placeholder data to Supabase.
                </p>

                <div className="space-y-4">
                    <button
                        onClick={handleSeed}
                        disabled={status === 'loading'}
                        className={`w-full py-4 rounded-xl font-bold text-white transition-all transform active:scale-95 ${status === 'loading'
                                ? 'bg-gray-400 cursor-not-allowed'
                                : 'bg-gray-900 hover:bg-gray-800 shadow-lg'
                            }`}
                    >
                        {status === 'loading' ? 'Moving Gravity...' : 'Start Migration'}
                    </button>

                    {/* Logs console */}
                    <div className="bg-gray-900 rounded-xl p-4 h-64 overflow-y-auto font-mono text-xs text-green-400 space-y-1">
                        {logs.length === 0 && <span className="text-gray-600">... Waiting for command</span>}
                        {logs.map((log, i) => (
                            <div key={i}>{log}</div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
