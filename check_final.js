
const checkPexels = async () => {
    // Public search URL that often redirects to results
    const term = "cooked rice";
    const url = `https://www.pexels.com/search/${encodeURIComponent(term)}/`;

    try {
        const response = await fetch(url);
        console.log(`URL: ${url}`);
        console.log(`Status: ${response.status}`);
        // Pexels returns HTML, so we'd need to scrape it. Too unreliable.
        // Let's try a different free source: Unsplash Source (community mirror?)
        // No.
    } catch (error) {
        console.log(`Error checking Pexels: ${error.message}`);
    }
};

const checkFinalSolution = async () => {
    // The "Pollinations Turbo" model works IF we use the right endpoint?
    // Let's try the 'feed' endpoint to see wide images
    const url = "https://image.pollinations.ai/prompt/cooked%20white%20rice?width=800&height=800&model=turbo&seed=42&nologo=true";
    try {
        const response = await fetch(url, { method: 'HEAD' });
        console.log(`POLLINATIONS TURBO CHECK:`);
        console.log(`URL: ${url}`);
        console.log(`Status: ${response.status}`);
        console.log(`Content-Length: ${response.headers.get('content-length')}`);
        // If length is small (~15kb), it's the maintenance image.
        // If large (>100kb), it's a real image.
    } catch (e) { console.log(e.message); }
};

checkFinalSolution();
