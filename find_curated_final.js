
import fs from 'fs';

// Best specific search terms for PNAE items
// Using "Cooked white rice" exactly to avoid parboiled with chicken
const items = {
    "arroz": "Cooked white rice on plate",
    "feijão": "Feijão carioca in bowl",
    "feijao": "Feijão carioca in bowl",
    "arroz integral": "Brown rice cooked",
    "macarrão": "Spaghetti with tomato sauce",
    "frango": "Roast chicken food",
    "frango assado": "Roast chicken food",
    "frango cozido": "Chicken stew pot",
    "carne": "Roast beef slice",
    "carne moida": "Ground beef cooked",
    "peixe": "Grilled fish fillet",
    "ovo": "Scrambled eggs on plate",
    "ovos": "Scrambled eggs on plate",
    "salada": "Fresh vegetable salad bowl",
    "legumes": "Steamed vegetables",
    "sopa": "Vegetable soup bowl",
    "pão": "French bread roll",
    "leite": "Glass of milk",
    "suco": "Orange juice glass",
    "fruta": "Fruit salad bowl",
    "banana": "Bananas fruit",
    "maçã": "Red apple fruit"
};

const searchWiki = async (term) => {
    // Search for 5 items, sort by relevance? No, Wikipedia search is text based.
    const url = `https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrnamespace=6&gsrsearch=filetype:bitmap|${encodeURIComponent(term)}&gsrlimit=5&prop=imageinfo&iiprop=url&format=json&origin=*`;
    try {
        const res = await fetch(url);
        const data = await res.json();
        if (!data || !data.query || !data.query.pages) return null;

        const pages = Object.values(data.query.pages);
        // Find best candidate - avoid "Parboiled rice with chicken" if searching for "White rice"
        const valid = pages.find(p => {
            if (!p.imageinfo || !p.imageinfo[0]) return false;
            const u = p.imageinfo[0].url;
            // Basic filter
            return u.match(/\.(jpg|jpeg)$/i) && !u.toLowerCase().includes("icon") && !u.toLowerCase().includes("flag") && !u.toLowerCase().includes("map");
        });

        return valid ? valid.imageinfo[0].url : null;
    } catch (e) { return null; }
};

(async () => {
    const results = {};
    for (const [key, term] of Object.entries(items)) {
        console.log(`Searching for ${key}...`);
        const url = await searchWiki(term);
        if (url) results[key] = url;
    }
    fs.writeFileSync('curated_images_final.json', JSON.stringify(results, null, 2));
    console.log("Done.");
})();
