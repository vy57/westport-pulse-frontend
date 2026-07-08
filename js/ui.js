// ui.js
import { fetchAffordabilityData } from './api.js';

// DOM Elements
const incomeInput = document.getElementById('incomeInput');
const downInput = document.getElementById('downInput');
const incomeVal = document.getElementById('incomeVal');
const downVal = document.getElementById('downVal');

const heroRate = document.getElementById('hero-rate');
const heroPrice = document.getElementById('hero-price');
const heroScore = document.getElementById('hero-score');
const monthlyCostDisplay = document.getElementById('monthlyCostDisplay');

// Currency Formatter
const formatMoney = new Intl.NumberFormat('en-US', { 
    style: 'currency', 
    currency: 'USD', 
    maximumFractionDigits: 0 
});

// Debounce Utility to prevent API spam while dragging sliders
let fetchTimeout;
function debounceFetch(income, downPayment) {
    clearTimeout(fetchTimeout);
    fetchTimeout = setTimeout(() => {
        executeApiUpdate(income, downPayment);
    }, 300); // Waits 300ms after the user stops sliding
}

// Core API Execution & DOM Injection
async function executeApiUpdate(income, downPayment) {
    monthlyCostDisplay.textContent = "Calculating...";
    
    const data = await fetchAffordabilityData(income, downPayment);
    if (!data) {
        monthlyCostDisplay.textContent = "Error loading data";
        return;
    }

    // Update Hero Section
    heroRate.textContent = `${(data.inputs.mortgageRate * 100).toFixed(2)}%`;
    heroPrice.textContent = formatMoney.format(data.inputs.medianHomePrice);
    heroScore.textContent = `${(data.affordabilityScore * 100).toFixed(1)}%`;

    // Dynamic color coding based on underwriting status
    if (data.marketStatus === 'Affordable') {
        heroScore.className = "text-3xl font-bold text-green-500";
    } else if (data.marketStatus === 'Stretch') {
        heroScore.className = "text-3xl font-bold text-yellow-500";
    } else {
        heroScore.className = "text-3xl font-bold text-red-500";
    }

    // Update Dashboard
    monthlyCostDisplay.textContent = formatMoney.format(data.trueMonthlyHousingCost);
}

// Event Handler for UI Updates
function handleSliderChange() {
    const currentIncome = incomeInput.value;
    const currentDownPayment = downInput.value;

    // 1. Instantly update the text labels so the UI feels responsive
    incomeVal.textContent = formatMoney.format(currentIncome);
    downVal.textContent = `${currentDownPayment}%`;

    // 2. Trigger the debounced API call
    debounceFetch(currentIncome, currentDownPayment);
}

// Event Listeners
incomeInput.addEventListener('input', handleSliderChange);
downInput.addEventListener('input', handleSliderChange);

// Initial Load
document.addEventListener('DOMContentLoaded', () => {
    handleSliderChange(); // Run once on page load to populate default data
});
