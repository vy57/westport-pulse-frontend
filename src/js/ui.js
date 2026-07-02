import { loadDashboardData } from './engine.js';

const incomeInput = document.getElementById('incomeInput');
const incomeVal = document.getElementById('incomeVal');
const downInput = document.getElementById('downInput');
const downVal = document.getElementById('downVal');
const rentBuyToggle = document.getElementById('rentBuyToggle');
const formatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
});

function drawGauge(score) {
  const canvas = document.getElementById('affordabilityChart');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const cw = canvas.width;
  const ch = canvas.height;

  ctx.clearRect(0, 0, cw, ch);

  const radius = 100;
  const startAngle = Math.PI;
  const endAngle = 2 * Math.PI;
  const centerX = cw / 2;
  const centerY = ch - 10;

  ctx.beginPath();
  ctx.arc(centerX, centerY, radius, startAngle, endAngle);
  ctx.lineWidth = 20;
  ctx.strokeStyle = '#e5e7eb';
  ctx.stroke();

  let color = '#22c55e';
  if (score > 30 && score <= 50) color = '#eab308';
  if (score > 50) color = '#ef4444';

  const fillScore = Math.min(score, 100);
  const valueAngle = startAngle + (fillScore / 100) * Math.PI;

  ctx.beginPath();
  ctx.arc(centerX, centerY, radius, startAngle, valueAngle);
  ctx.lineWidth = 20;
  ctx.strokeStyle = color;
  ctx.stroke();

  ctx.font = 'bold 24px sans-serif';
  ctx.fillStyle = '#1f2937';
  ctx.textAlign = 'center';
  ctx.fillText(`${score.toFixed(1)}%`, centerX, centerY - 20);
}

async function updateDashboard() {
  const zipCode = '06880';
  const data = await loadDashboardData(zipCode);

  const mortgageRate = data?.inputs?.mortgageRate ?? 0.0649;
  const medianHomePrice = data?.inputs?.medianHomePrice ?? 2200000;
  const millRate = data?.inputs?.millRate ?? 13.2;
  const medianGrossRent = data?.inputs?.medianGrossRent ?? 3500;

  document.getElementById('hero-rate').textContent = `${(mortgageRate * 100).toFixed(2)}%`;
  document.getElementById('hero-price').textContent = formatter.format(medianHomePrice);

  const income = Number.parseInt(incomeInput.value, 10);
  const downPct = Number.parseInt(downInput.value, 10) / 100;
  const isRent = rentBuyToggle.checked;

  let monthlyCost;

  if (isRent) {
    monthlyCost = medianGrossRent;
  } else {
    const principal = medianHomePrice * (1 - downPct);
    const r = mortgageRate / 12;
    const n = 360;

    let monthlyMortgage = 0;
    if (r > 0) {
      monthlyMortgage = (principal * (r * Math.pow(1 + r, n))) / (Math.pow(1 + r, n) - 1);
    } else {
      monthlyMortgage = principal / n;
    }

    const annualTax = medianHomePrice * 0.7 * (millRate / 1000);
    const monthlyTax = annualTax / 12;

    let monthlyPMI = 0;
    if (downPct < 0.2) {
      monthlyPMI = (principal * 0.0075) / 12;
    }

    monthlyCost = monthlyMortgage + monthlyTax + monthlyPMI;
  }

  const monthlyGrossIncome = income / 12;
  const affordabilityScore = (monthlyCost / monthlyGrossIncome) * 100;

  document.getElementById('hero-score').textContent = `${affordabilityScore.toFixed(0)}%`;
  document.getElementById('monthlyCostDisplay').textContent = formatter.format(monthlyCost);

  drawGauge(affordabilityScore);
}

incomeInput.addEventListener('input', (event) => {
  incomeVal.textContent = formatter.format(event.target.value);
  updateDashboard();
});

downInput.addEventListener('input', (event) => {
  downVal.textContent = `${event.target.value}%`;
  updateDashboard();
});

rentBuyToggle.addEventListener('change', updateDashboard);
window.addEventListener('DOMContentLoaded', updateDashboard);
