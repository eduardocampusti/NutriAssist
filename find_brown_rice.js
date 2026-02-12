
import fetch from 'node-fetch';

const search = async () => {
    const term = "Brown rice cooked plate";
    const url = `https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrnamespace=6&gsrsearch=filetype:bitmap|${encodeURIComponent(term)}&gsrlimit=5&prop=imageinfo&iiprop=url&format=json&origin=*`;

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
