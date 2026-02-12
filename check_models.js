
const urls = [
    "https://image.pollinations.ai/prompt/test?model=turbo&nologo=true",
    "https://image.pollinations.ai/prompt/test?model=flux-realism&nologo=true",
    "https://pollinations.ai/p/test?nologo=true"
];

const checkUrl = async (url) => {
    try {
        const response = await fetch(url, { method: 'HEAD' });
        console.log(`URL: ${url}`);
        console.log(`Status: ${response.status}`);
        console.log(`Content-Type: ${response.headers.get('content-type')}`);
        // Check content-length to bypass "We Moved" small images
        console.log(`Content-Length: ${response.headers.get('content-length')}`);
        console.log('---');
    } catch (error) {
        console.log(`Error checking ${url}: ${error.message}`);
    }
};

(async () => {
    for (const url of urls) {
        await checkUrl(url);
    }
})();
