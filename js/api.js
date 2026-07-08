// api.js
export async function fetchAffordabilityData(income, downPaymentPercent) {
    // Convert whole number percentage (e.g., 20) to a decimal (0.20) for your API
    const decimalDownPayment = downPaymentPercent / 100;
    
    const baseUrl = 'https://my-free-api.maximusman691.workers.dev/api/affordability';
    const params = new URLSearchParams({
        zipCode: '06880', // Hardcoded for Westport Pulse
        income: income,
        downPayment: decimalDownPayment
    });

    try {
        const response = await fetch(`${baseUrl}?${params.toString()}`);
        if (!response.ok) throw new Error('Network response was not ok');
        return await response.json();
    } catch (error) {
        console.error("API Fetch Error:", error);
        return null;
    }
}
