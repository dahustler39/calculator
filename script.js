const cryptoSelect = document.getElementById('crypto');
const priceDisplay = document.getElementById('price');
const resultDisplay = document.getElementById('result');
const quantityInput = document.getElementById('quantity');
const yearsInput = document.getElementById('years');
const sellPriceInput = document.getElementById('sellPrice');
const refreshBtn = document.getElementById('refresh');
const calculateBtn = document.getElementById('calculate');
const chartCanvas = document.getElementById('priceChart');
let currentPrice = 0;
let chart;

async function fetchTopCoins() {
  try {
    const res = await fetch('https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=1');
    const coins = await res.json();
    cryptoSelect.innerHTML = '';
    coins.forEach(coin => {
      const option = document.createElement('option');
      option.value = coin.id;
      option.text = `${coin.name} (${coin.symbol.toUpperCase()})`;
      cryptoSelect.appendChild(option);
    });
    fetchPrice(); // Load initial price
    drawChart();  // Load initial chart
  } catch (err) {
    console.error('Failed to load coins:', err);
  }
}

async function fetchPrice() {
  const selectedCoin = cryptoSelect.value;
  try {
    const res = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${selectedCoin}&vs_currencies=usd`);
    const data = await res.json();
    currentPrice = data[selectedCoin].usd;
    priceDisplay.textContent = `Live Price: $${currentPrice.toLocaleString()}`;
  } catch (err) {
    console.error('Price fetch error:', err);
  }
}

async function drawChart() {
  const selectedCoin = cryptoSelect.value;
  try {
    const res = await fetch(`https://api.coingecko.com/api/v3/coins/${selectedCoin}/market_chart?vs_currency=usd&days=30`);
    const data = await res.json();
    const labels = data.prices.map(p => new Date(p[0]).toLocaleDateString());
    const prices = data.prices.map(p => p[1]);

    if (chart) chart.destroy();
    chart = new Chart(chartCanvas, {
      type: 'line',
      data: {
        labels,
        datasets: [{
          label: '30-Day Price',
          data: prices,
          borderColor: '#00ffc8',
          backgroundColor: 'rgba(0,255,200,0.1)',
          fill: true,
          tension: 0.3
        }]
      },
      options: {
        plugins: {
          legend: { labels: { color: '#fff' } }
        },
        scales: {
          x: { ticks: { color: '#ccc' } },
          y: { ticks: { color: '#ccc' } }
        }
      }
    });
  } catch (err) {
    console.error('Chart error:', err);
  }
}

function calculateReturns() {
  const qty = parseFloat(quantityInput.value);
  const sellPrice = parseFloat(sellPriceInput.value);

  if (!qty || !sellPrice || currentPrice === 0) {
    resultDisplay.textContent = "Please enter valid numbers and ensure price is loaded.";
    return;
  }

  const total = qty * sellPrice;
  resultDisplay.textContent = `Estimated Future Value: $${total.toLocaleString(undefined, { minimumFractionDigits: 2 })}`;
}

refreshBtn.addEventListener('click', () => {
  fetchPrice();
  drawChart();
});

cryptoSelect.addEventListener('change', () => {
  fetchPrice();
  drawChart();
});

calculateBtn.addEventListener('click', calculateReturns);

fetchTopCoins();
