// ui.js
import { fetchAffordabilityData } from './api.js';

// DOM Elements
const incomeInput = document.getElementById('incomeInput');
const downInput = document.getElementById('downInput');
const incomeVal = document.getElementById('incomeVal');
const downVal = document.getElementById('downVal');
const rentBuyToggle = document.getElementById('rentBuyToggle');

// Dynamic Text Label Elements
const toggleLabelBuy = document.getElementById('toggleLabelBuy');
const toggleLabelRent = document.getElementById('toggleLabelRent');
const downPaymentContainer = document.getElementById('down-payment-container');
const costLabel = document.getElementById('costLabel');
const chartTitle = document.getElementById('chartTitle');
const burdenDescription = document.getElementById('burdenDescription');
const breakdownLabel1 = document.getElementById('breakdownLabel1');
const breakdownLabel2 = document.getElementById('breakdownLabel2');
const breakdownVal1 = document.getElementById('breakdownVal1');
const breakdownVal2 = document.getElementById('breakdownVal2');

// Hero Metrics
const heroRate = document.getElementById('hero-rate');
const heroPrice = document.getElementById('hero-price');
const heroPriceLabel = document.getElementById('hero-price-label');
const heroScore = document.getElementById('hero-score');
const monthlyCostDisplay = document.getElementById('monthlyCostDisplay');

// State Cache to hold API responses and prevent redundant fetching
let localApiDataCache = null;

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

    // Cache the payload locally so toggling Buy/Rent doesn't trigger a re-fetch
    localApiDataCache = data;
    renderDashboardView();
}

function renderDashboardView() {
    if (!localApiDataCache) return;

    const data = localApiDataCache;
    const isRentMode = rentBuyToggle.checked;

    // 1. Update Static Global Header Elements (Always visible)
    heroRate.textContent = `${(data.inputs.mortgageRate * 100).toFixed(2)}%`;
    heroPrice.textContent = formatMoney.format(data.inputs.medianHomePrice);
    heroScore.textContent = data.marketStatus;

    // Classify risk color conditions
    if (data.marketStatus === 'Affordable') {
        heroScore.className = "text-3xl font-bold text-green-500";
    } else if (data.marketStatus === 'Stretch') {
        heroScore.className = "text-3xl font-bold text-yellow-500";
    } else {
        heroScore.className = "text-3xl font-bold text-red-500";
    }

    // 2. Fork UI Render Logic Based on Toggle Mode
    if (isRentMode) {
        // Rent UI State Configuration
        toggleLabelRent.className = "ml-3 text-sm font-semibold text-blue-600";
        toggleLabelBuy.className = "mr-3 text-sm font-semibold text-gray-400";
        downPaymentContainer.style.opacity = "0.3"; // Visually fade out down payment input
        downPaymentContainer.style.pointerEvents = "none";

        chartTitle.textContent = "Rental Overhead Ratio";
        burdenDescription.textContent = "Tracking gross monthly rental distribution against net simulated allocations across Census datasets.";
        costLabel.textContent = "Median Monthly Gross Rent";
        
        monthlyCostDisplay.textContent = formatMoney.format(data.breakdown.medianGrossRent);

        // Adjust localized structural cards for rent data
        breakdownLabel1.textContent = "Annual Income Equivalent";
        breakdownVal1.textContent = formatMoney.format(data.inputs.effectiveAnnualIncome);
        breakdownLabel2.getElementById ? null : breakdownLabel2.textContent = "Rent-To-Income Ratio";
        breakdownVal2.textContent = `${(data.inputs.rentToIncomeRatio * 100).toFixed(1)}%`;

    } else {
        // Buy UI State Configuration
        toggleLabelBuy.className = "mr-3 text-sm font-semibold text-blue-600";
        toggleLabelRent.className = "ml-3 text-sm font-semibold text-gray-400";
        downPaymentContainer.style.opacity = "1";
        downPaymentContainer.style.pointerEvents = "auto";

        chartTitle.textContent = "Housing Cost Burden";
        burdenDescription.textContent = "Comparing true carrying costs against simulated gross monthly earnings using standard underwriting limits.";
        costLabel.textContent = "True Monthly Carrying Cost";
        
        monthlyCostDisplay.textContent = formatMoney.format(data.trueMonthlyHousingCost);

        // Adjust localized structural cards for home buying data
        breakdownLabel1.textContent = "Mortgage Principal & Int.";
        breakdownVal1.textContent = formatMoney.format(data.breakdown.monthlyMortgagePayment);
        breakdownLabel2.textContent = "Calculated Property Tax";
        breakdownVal2.textContent = formatMoney.format(data.breakdown.monthlyPropertyTax);
    }
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
rentBuyToggle.addEventListener('change', renderDashboardView);

// Initialize Core Application
document.addEventListener('DOMContentLoaded', () => {
    handleSliderChange();
});
