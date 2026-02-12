
const checkWikimedia = async () => {
    const term = "Arroz branco";
    // Search for files in Wikimedia Commons
    const url = `https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrnamespace=6&gsrsearch=filetype:bitmap|${encodeURIComponent(term)}&gsrlimit=1&prop=imageinfo&iiprop=url&format=json&origin=*`;

    try {
        const response = await fetch(url);
        console.log(`URL: ${url}`);

        if (response.ok) {
            const data = await response.json();
            if (data.query && data.query.pages) {
                const pages = Object.values(data.query.pages);
                if (pages.length > 0 && pages[0].imageinfo) {
                    console.log(`Success! Found image.`);
                    console.log(`URL: ${pages[0].imageinfo[0].url}`);
                }
            } else {
                console.log("Response OK but no images found.");
            }
        } else {
            console.log(`Status: ${response.status}`);
        }
    } catch (error) {
        console.log(`Error checking Wikimedia: ${error.message}`);
    }
};

checkWikimedia();
