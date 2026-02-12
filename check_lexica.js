
const checkLexica = async () => {
    const term = "cooked white rice";
    const url = `https://lexica.art/api/v1/search?q=${encodeURIComponent(term)}`;

    try {
        const response = await fetch(url);
        console.log(`URL: ${url}`);
        console.log(`Status: ${response.status}`);

        if (response.ok) {
            const data = await response.json();
            if (data.images && data.images.length > 0) {
                console.log(`Success! Found ${data.images.length} images.`);
                console.log(`First image: ${data.images[0].src}`);
                console.log(`Small image: ${data.images[0].srcSmall}`);
            } else {
                console.log("Response OK but no images found.");
            }
        }
    } catch (error) {
        console.log(`Error checking Lexica: ${error.message}`);
    }
};

checkLexica();
