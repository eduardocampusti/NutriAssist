
import fs from 'fs';

const searchWiki = async (term) => {
    const url = `https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrnamespace=6&gsrsearch=filetype:bitmap|${encodeURIComponent(term)}&gsrlimit=5&prop=imageinfo&iiprop=url&format=json&origin=*`;
    try {
        const res = await fetch(url);
        const data = await res.json();
        // Robust checks
        if (!data || !data.query || !data.query.pages) return null;

        const pages = Object.values(data.query.pages);
        const valid = pages.find(p => {
            if (!p.imageinfo || !p.imageinfo[0]) return false;
            const u = p.imageinfo[0].url;
            return u.match(/\.(jpg|jpeg)$/i) && !u.toLowerCase().includes("icon") && !u.toLowerCase().includes("flag");
        });
        if (valid) return valid.imageinfo[0].url;
        return null;
    } catch (e) { return null; }
};

const foods = {
    "arroz": "White rice plate",
    "arroz branco": "White rice plate",
    "feijão": "Feijão carioca cooked",
    "feijao": "Feijão carioca cooked",
    "frango": "Roast chicken",
    "carne": "Beef stew",
    "salada": "Vegetable salad",
    "macarrão": "Pasta with tomato sauce",
    "peixe": "Grilled fish fillet",
    "ovo": "Scrambled eggs",
    "leite": "Glass of milk",
    "pão": "Pão francês",
    "suco": "Orange juice glass",
    "vitamina": "Strawberry smoothie glass",
    "sopa": "Vegetable soup",
    "cebola": "Red onion",
    "alho": "Garlic bulbs"
};

(async () => {
    const results = {};
    for (const [key, term] of Object.entries(foods)) {
        console.log(`Fetching ${key}...`);
        const url = await searchWiki(term);
        if (url) results[key] = url;
    }
    fs.writeFileSync('static_urls.json', JSON.stringify(results, null, 2));
    console.log("Done.");
})();
