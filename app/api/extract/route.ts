
import { NextResponse } from 'next/server';
import { YoutubeTranscript } from 'youtube-transcript';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini
// Note: In real app, consider moving this to a lib file
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(request: Request) {
    try {
        const { url } = await request.json();

        if (!url) {
            return NextResponse.json({ error: 'URL is required' }, { status: 400 });
        }

        // 1. Extract Video ID
        // Simple regex for standard and shorts URLs
        const videoIdMatch = url.match(/(?:v=|youtu\.be\/|shorts\/)([^&?/]+)/);
        const videoId = videoIdMatch ? videoIdMatch[1] : null;

        if (!videoId) {
            return NextResponse.json({ error: 'Invalid YouTube URL' }, { status: 400 });
        }

        // 2. Fetch Transcript
        let transcriptText = '';
        try {
            const transcriptItems = await YoutubeTranscript.fetchTranscript(videoId);
            transcriptText = transcriptItems.map(item => item.text).join(' ');
        } catch (error) {
            console.error('Transcript Error:', error);
            return NextResponse.json({ error: 'Failed to fetch transcript. Video might not have captions.' }, { status: 500 });
        }

        // 3. Process with Gemini
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-002" }); // Use flash for speed
        const prompt = `
            You are a professional chef data assistant. 
            Analyze the following YouTube video transcript and extract the recipe information into a structured JSON format.
            
            Transcript:
            "${transcriptText.substring(0, 10000)}" // Limit length just in case

            Please output ONLY valid JSON (no markdown code blocks) with the following structure:
            {
                "title": "Recipe Title (Korean)",
                "description": "Short description of the dish",
                "ingredients": [
                    { "name": "Ingredient Name", "amount": "Amount string" }
                ],
                "steps": [
                    { "order": 1, "description": "Step 1 description" }
                ],
                "time": "Est. cooking time (e.g. 15분)",
                "calories": 0 (Estimate numeric value, if unsure put 500),
                "nutrition": {
                    "calories": 0,
                    "protein": "0g",
                    "fat": "0g",
                    "carbs": "0g"
                }
            }
            If the transcript is not a recipe, return { "error": "Not a recipe" }.
            Translate everything to Korean.
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        // Cleanup markdown if present (Gemini sometimes adds ```json ... ```)
        const jsonString = text.replace(/```json/g, '').replace(/```/g, '').trim();

        const recipeData = JSON.parse(jsonString);

        if (recipeData.error) {
            return NextResponse.json({ error: recipeData.error }, { status: 400 });
        }

        return NextResponse.json({
            ...recipeData,
            videoId,
            videoUrl: `https://www.youtube.com/watch?v=${videoId}`,
            thumbnailUrl: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
        });

    } catch (error: any) {
        console.error('Extraction Error:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
