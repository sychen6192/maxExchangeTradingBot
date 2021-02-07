const axios = require('axios');
const MAX = require('max-exchange-api-node')
require('dotenv').config();

const max = new MAX({
  accessKey: process.env.MAX_API_KEY,
  secretKey: process.env.MAX_API_SECRET,

});


const rest = max.rest() // default version is 2

async function main() {
  while (true) {
    await start();
  }
}

main();

async function start() {

  const market = 'btcusdt';
  const d = new Date(); 

  console.log(`Current time: ${d.toLocaleString()}`)
  // 1) Get current price of btcusdt from binance.
  console.log("1) Get current price of btcusdt from binance.");
  let binanceResponse = await axios.get('https://api.binance.com/api/v3/ticker/price?symbol=BTCUSDT');
  let btcPriceBinance = binanceResponse.data.price;
  const tick = {
    buy: (btcPriceBinance * 0.99).toString(),
    sell: (btcPriceBinance * 1.01).toString()
  }

  // 2) Check how much btc and usdt you have.
  console.log("2) Check how much btc and usdt you have.");
  let btcAmount = await rest.account('btc');
  let usdtAmount = await rest.account('usdt');
  console.log(`Current balance: btc=${btcAmount.balance} usdt=${usdtAmount.balance}`);

  // 3) Set minimum order limitation for both, spread for 1%
  console.log("3) Set minimum order limitation for both, spread for 1%")
  const orderAmount = {
    buy: '0.001',
    sell: '0.001'
  }

  // 4) Cancel all orders, get ready for newer order
  console.log("4) Cancel all orders, get ready for next order")
  await rest.cancelOrders({
    market: 'btcusdt'
  })

  if (usdtAmount.balance > orderAmount.buy) {
    console.log(`4.1) Set buy order, Amount: ${orderAmount.buy} BTC`)
    const buyResponse = await rest.placeOrder({
      market,
      price: tick.buy,
      volume: orderAmount.buy,
      side: 'buy',
      ord_type: 'limit',
    });
  }

  if (btcAmount.balance > orderAmount.sell) {
    console.log(`4.2) Set sell order, Amount: ${orderAmount.sell} BTC`)
    const sellResponse = await rest.placeOrder({
      market,
      price: `${tick.sell}`,
      volume: `${orderAmount.sell}`,
      side: sell,
      ord_type: 'limit',
    });
  }
  console.log("=============================================================================")

  await sleep(2000);

  // Step4: Get order history
  // console.log("Step4: Get order history")
  // const history = await rest.orders({ market, state: ['wait', 'convert', 'done'] });
  // console.log('Order history:', history)
}

function sleep(ms) {
  return new Promise( (resolve, reject) => {
     setTimeout( _ => resolve(), ms)
  })
}