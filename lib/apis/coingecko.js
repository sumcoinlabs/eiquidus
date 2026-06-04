console.log(">>> coingecko.js loaded <<<");

// lib/api/coingecko.js
// CommonJS-compatible version for Node 20+

const fs = require('fs');
const endpoint = 'https://sumcoinindex.com/rates/price2.json';
const logFile = '/var/log/sumexplorer-price.log'; // change to './sumexplorer-price.log' if needed
const CHECK_INTERVAL_MINUTES = 5;

function writeLog(message) {
  const timestamp = new Date().toISOString();
  try {
    fs.appendFileSync(logFile, `[${timestamp}] ${message}\n`);
  } catch (err) {
    console.error('Error writing log file:', err.message);
  }
}

async function fetchSumcoinPrice() {
  const url = `${endpoint}?t=${Date.now()}`;
  const response = await fetch(url, { timeout: 10000 });
  if (!response.ok) throw new Error(`HTTP ${response.status} ${response.statusText}`);
  const data = await response.json();
  const price = parseFloat(data.price);
  if (isNaN(price)) throw new Error('Invalid price value');
  return price;
}

async function get_price(cb) {
  try {
    const price = await fetchSumcoinPrice();
    const msg = `Fetched Sumcoin USD price: $${price}`;
    console.log(msg);
    writeLog(msg);
    cb(null, price, price);
  } catch (err) {
    const msg = `Error fetching price: ${err.message}`;
    console.error(msg);
    writeLog(msg);
    cb(err.message, 0, 0);
  }
}

module.exports = {
  get_coin_data: function (api_key, cb) {
    return cb(null, [{ id: 'sumcoin', name: 'Sumcoin', symbol: 'SUM' }]);
  },

  get_market_prices: function (id, currency, api_key, cb) {
    get_price(cb);
  },

  get_avg_market_prices: function (id, currency, market_array, api_key, cb) {
    get_price(cb);
  }
};

// periodic auto-check
setInterval(() => {
  get_price((err, price) => {
    if (err) {
      console.error(`[AutoCheck] Error: ${err}`);
      writeLog(`[AutoCheck] Error: ${err}`);
    } else {
      const msg = `[AutoCheck] Latest price: $${price}`;
      console.log(msg);
      writeLog(msg);
    }
  });
}, CHECK_INTERVAL_MINUTES * 60 * 1000);

// run once on startup
get_price((err, price) => {
  if (err) {
    console.error(`[Startup] Error: ${err}`);
    writeLog(`[Startup] Error: ${err}`);
  } else {
    const msg = `[Startup] Initial price: $${price}`;
    console.log(msg);
    writeLog(msg);
  }
});
