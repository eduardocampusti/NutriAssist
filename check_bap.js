
import https from 'https';

const url = "https://upload.wikimedia.org/wikipedia/commons/7/7f/Bap_%28cooked_rice%29.jpg";

https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
    console.log('Status:', res.statusCode);
    console.log('Content-Type:', res.headers['content-type']);

    if (res.statusCode !== 200) {
        console.error('Failed to fetch image.');
    } else {
        console.log('Image is valid.');
    }
}).on('error', (e) => {
    console.error('Error:', e);
});
