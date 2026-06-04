const request = require('postman-request');
const base_url = 'https://sumcoinindex.com/rates/price2.json';

function get_price(cb) {
  request({ uri: base_url, json: true }, function (error, response, body) {
    if (error)
      return cb(error, 0, 0);
    else if (!body || typeof body !== 'object')
      return cb('No data returned', 0, 0);
    else if (body.error != null && body.error != 0)
      return cb(body.error_msg || 'Error from API', 0, 0);
    else {
      try {
        const price = parseFloat(body.price);
        const usd = parseFloat(body.price);
        return cb(null, price, usd);
      } catch (err) {
        return cb('Invalid data format', 0, 0);
      }
    }
  });
}

module.exports = {
  get_coin_data: function (api_key, cb) {
    // Not used in your case
    return cb(null, [{
      id: 'sumcoin',
      name: 'Sumcoin',
      symbol: 'SUM'
    }]);
  },

  get_market_prices: function (id, currency, api_key, cb) {
    get_price(cb);
  },

  get_avg_market_prices: function (id, currency, market_array, api_key, cb) {
    get_price(cb);
  }
};
