
const searchWiki = async (term) => {
    // Search for "high quality" images if possible, or just the term
    const url = `https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrnamespace=6&gsrsearch=filetype:bitmap|${encodeURIComponent(term)}&gsrlimit=5&prop=imageinfo&iiprop=url&format=json&origin=*`;
    try {
        const res = await fetch(url);
        const data = await res.json();
        const pages = Object.values(data.query.pages);
        // Prioritize JPG over PNG, exclude "icon" or "flag"
        const valid = pages.find(p => {
            const u = p.imageinfo[0].url;
            return u.match(/\.(jpg|jpeg)$/i) && !u.toLowerCase().includes("icon") && !u.toLowerCase().includes("flag");
        });
        if (valid) return valid.imageinfo[0].url;
    } catch (e) { return null; }
};

// Map of our translation keys to search terms
const foods = {
    "cooked white rice": "White rice plate",
    "brazilian brown beans stew": "Feijão carioca cozido",
    "roasted chicken": "Roast chicken",
    "cooked beef stew": "Beef stew",
    "fresh vegetable salad": "Vegetable salad",
    "pasta with tomato sauce": "Pasta with tomato sauce",
    "grilled fish fillet": "Grilled fish fillet",
    "scrambled eggs": "Scrambled eggs",
    "glass of milk": "Glass of milk",
    "fresh baked bread bun": "Pão francês",
    "vegetable soup": "Vegetable soup",
    "fresh fruit juice": "Orange juice glass"
};

(async () => {
    console.log("const staticImages: Record<string, string> = {");
    for (const [key, term] of Object.entries(foods)) {
        const url = await searchWiki(term);
        if (url) console.log(`    "${key}": "${url}",`);
    }
    console.log("};");
})();
