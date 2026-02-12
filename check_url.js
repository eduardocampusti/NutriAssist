
import https from 'https';

const urls = [
    "https://upload.wikimedia.org/wikipedia/commons/e/e1/Falling_white_rice_on_a_plate.jpg", // Arroz
    "https://upload.wikimedia.org/wikipedia/commons/3/31/Carioca_Bowl_2012_-_Final.jpg", // Feijão
    "https://upload.wikimedia.org/wikipedia/commons/3/3c/Chicken_makhani.jpg" // Frango
];

urls.forEach(url => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
        console.log(`URL: ${url}`);
        console.log('Status:', res.statusCode);

        if (res.statusCode !== 200) {
            console.error('Failed to fetch image.');
        } else {
            console.log('Image is valid.');
        }
        res.resume();
    }).on('error', (e) => {
        console.error('Error:', e);
    });
});
