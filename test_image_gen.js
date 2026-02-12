
import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from 'fs';
import path from 'path';

const envPath = path.resolve(process.cwd(), '.env.local');
const envContent = fs.readFileSync(envPath, 'utf-8');

const getEnv = (key) => {
    const lines = envContent.split('\n');
    for (const line of lines) {
        if (line.includes('=') && line.split('=')[0].trim() === key) {
            return line.split('=')[1].trim();
        }
    }
    return null;
};

const GEMINI_API_KEY = getEnv('GEMINI_API_KEY');

async function testImageGen() {
    console.log('--- Testing Gemini Image Generation ---');
    if (!GEMINI_API_KEY) {
        console.error('API KEY NOT FOUND');
        return;
    }

    try {
        const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
        // Common models for image generation in Gemini 2.0
        const modelNames = ["gemini-2.0-flash", "gemini-2.0-flash-exp-image-generation"];

        for (const modelName of modelNames) {
            console.log(`Trying model: ${modelName}`);
            const model = genAI.getGenerativeModel({ model: modelName });

            const prompt = "A high-quality professional photography of a Brazilian school meal: Rice, beans, and grilled chicken.";

            const result = await model.generateContent(prompt);
            const response = await result.response;

            console.log(`Response received from ${modelName}`);
            const candidates = response.candidates;
            if (candidates && candidates[0]?.content?.parts[0]?.inlineData) {
                console.log(`✅ SUCCESS! Image generated with ${modelName}`);
                const imageData = candidates[0].content.parts[0].inlineData;
                console.log(`MimeType: ${imageData.mimeType}`);
                console.log(`Data length: ${imageData.data.length}`);
                break; // Stop if success
            } else {
                console.log(`❌ No image data in response from ${modelName}`);
                console.log('Response content:', JSON.stringify(response, null, 2));
            }
        }
    } catch (error) {
        console.error('❌ Error during test:', error.message);
        if (error.response) {
            console.error('Response details:', error.response);
        }
    }
}

testImageGen();
