
import fetch from 'node-fetch';

const search = async () => {
    // Busca específica por "cooked rice" para evitar "raw/falling"
    const term = "Cooked white rice plate";
    const url = `https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrnamespace=6&gsrsearch=filetype:bitmap|${encodeURIComponent(term)}&gsrlimit=10&prop=imageinfo&iiprop=url&format=json&origin=*`;

    try {
        const res = await fetch(url);
        const data = await res.json();
        const pages = Object.values(data.query.pages);

        pages.forEach(p => {
            if (p.imageinfo && p.imageinfo[0]) {
                console.log(p.imageinfo[0].url);
            }
        });
    } catch (e) { console.error(e); }
};

search();
