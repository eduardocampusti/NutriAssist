
const searchWiki = async (term) => {
    const url = `https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrnamespace=6&gsrsearch=filetype:bitmap|${encodeURIComponent(term)}&gsrlimit=5&prop=imageinfo&iiprop=url&format=json&origin=*`;
    try {
        const res = await fetch(url);
        const data = await res.json();
        const pages = Object.values(data.query.pages);
        // Filter for jpg/png and meaningful size
        const valid = pages.find(p => p.imageinfo[0].url.match(/\.(jpg|jpeg|png)$/i));
        if (valid) return valid.imageinfo[0].url;
    } catch (e) { return null; }
};

const foods = [
    "White rice cooked dish",
    "Brazilian feijoada stew",
    "Grilled chicken fillet food",
    "Scrambled eggs food",
    "Pasta with tomato sauce",
    "Fresh green salad food",
    "Fruit salad bowl",
    "Carrot soup bowl",
    "Fried fish fillet food",
    "Mashed potatoes food",
    "Cooked black beans brazil"
];

(async () => {
    for (const food of foods) {
        const url = await searchWiki(food);
        console.log(`"${food}": "${url}",`);
    }
})();
