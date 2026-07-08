// ui.js
import { fetchAffordabilityData } from './api.js';

// DOM Elements
const incomeInput = document.getElementById('incomeInput');
const downInput = document.getElementById('downInput');
const incomeVal = document.getElementById('incomeVal');
const downVal = document.getElementById('downVal');

// Hero Metrics
const heroRate = document.getElementById('hero-rate');
const heroPrice = document.getElementById('hero-price');
const heroScore = document.getElementById('hero-score');
const monthlyCostDisplay = document.getElementById('monthlyCostDisplay');

// Breakdown Metrics
const breakdownVal1 = document.getElementById('breakdownVal1');
const breakdownVal2 = document.getElementById('breakdownVal2');

// Formatter
const formatMoney = new Intl.NumberFormat('en-US', { 
    style: 'currency', 
    currency: 'USD', 
    maximumFractionDigits: 0 
});

let fetchTimeout;
function debounceFetch(income, downPayment) {
    clearTimeout(fetchTimeout);
    fetchTimeout = setTimeout(() => {
        executeApiUpdate(income, downPayment);
    }, 300);
}

async function executeApiUpdate(income, downPayment) {
    monthlyCostDisplay.textContent = "Calculating...";
    
    const data = await fetchAffordabilityData(income, downPayment);
    if (!data) {
        monthlyCostDisplay.textContent = "Error";
        return;
    }

    // 1. Update Global Header Elements
    heroRate.textContent = `${(data.inputs.mortgageRate * 100).toFixed(2)}%`;
    heroPrice.textContent = formatMoney.format(data.inputs.medianHomePrice);
    heroScore.textContent = data.marketStatus;

    if (data.marketStatus === 'Affordable') {
        heroScore.className = "text-3xl font-bold text-green-500";
    } else if (data.marketStatus === 'Stretch') {
        heroScore.className = "text-3xl font-bold text-yellow-500";
    } else {
        heroScore.className = "text-3xl font-bold text-red-500";
    }

    // 2. Update Engine Core Elements
    monthlyCostDisplay.textContent = formatMoney.format(data.trueMonthlyHousingCost);
    breakdownVal1.textContent = formatMoney.format(data.breakdown.monthlyMortgagePayment);
    breakdownVal2.textContent = formatMoney.format(data.breakdown.monthlyPropertyTax);
}

function handleSliderChange() {
    const currentIncome = incomeInput.value;
    const currentDownPayment = downInput.value;

    incomeVal.textContent = formatMoney.format(currentIncome);
    downVal.textContent = `${currentDownPayment}%`;

    debounceFetch(currentIncome, currentDownPayment);
}

// Event Listeners
incomeInput.addEventListener('input', handleSliderChange);
downInput.addEventListener('input', handleSliderChange);

// Initialize Core Application
document.addEventListener('DOMContentLoaded', () => {
    handleSliderChange();
});
