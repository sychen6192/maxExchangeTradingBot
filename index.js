const axios = require('axios');
const MAX = require('max-exchange-api-node')
require('dotenv').config();

const max = new MAX({
  accessKey: process.env.MAX_API_KEY,
  secretKey: process.env.MAX_API_SECRET,

});


const rest = max.rest() // default version is 2


start();

async function start() {
  // const supported = await rest.markets();
  // console.log('Supported markets:', supported);

  const market = 'btcusdt';

  // Step1 : Get current price of btcusdt
  // console.log("Step1: Get current price of btcusdt")
  // const tick = await rest.ticker({
  //   market,
  // });
  // console.log(`The current best bid price of ${market} is ${tick.buy}`);
  // console.log(`The current best ask price of ${market} is ${tick.sell}\n`);

  // Step1 : Get current price of btcusdt from binance.
  let binanceResponse = await axios.get('https://api.binance.com/api/v3/ticker/price?symbol=BTCUSDT');
  let btcPriceBinance = binanceResponse.data.price;
  const tick = {
    buy: (btcPriceBinance * 0.9).toString(),
    sell: (btcPriceBinance * 1.1).toString()
  }

  // Step2: Check how much btc and usdt you have.
  console.log("Step2: Check how much btc and usdt you have");
  let btcAmount = await rest.account('btc');
  let usdtAmount = await rest.account('usdt');
  console.log(`Current time: ${Date.now()}`)
  console.log(`Current balance: btc=${btcAmount.balance} usdt=${usdtAmount.balance}\n`);

  // Step3: Set minimum order limitation for both, spread for 10%
  console.log("Step3: Set minimum order limitation for both, spread for 10%")
  const orderAmount = {
    buy: '0.0005',
    sell: '0.0005'
  }

  if (usdtAmount.balance > 0) {
    console.log(`Step3.1: Set buy order, Amount: ${orderAmount.buy} USDT`)
    const buyResponse = await rest.placeOrder({
      market,
      price: tick.buy,
      volume: orderAmount.buy,
      side: 'buy',
      ord_type: 'limit',
    });
    // console.log(`The response of placing order:`, buyResponse);
    // console.log("")
  }

  if (btcAmount.balance > 0) {
    console.log(`Step3.2: Set sell order, Amount: ${orderAmount.sell} BTC`)
    const sellResponse = await rest.placeOrder({
      market,
      price: `${tick.sell}`,
      volume: `${orderAmount.sell}`,
      side: sell,
      ord_type: 'limit',
    });
    // console.log(`The response of placing order:`, sellResponse);
    // console.log("")
  }

  await sleep(1000);

  // Step4: Get order history
  console.log("Step4: Get order history")
  const history = await rest.orders({ market, state: ['wait', 'convert', 'done'] });
  // console.log('Order history:', history)

  // Step5: Cancel all orders, get ready for next order
  console.log("Step5: Cancel all orders, get ready for next order")
  await rest.cancelOrders({
    market: 'btcusdt'
  })


  // Step6: If the order is executed successfully, you should see balance change.
  console.log("Step6: If the order is executed successfully, you should see balance change.")
  btcAmount = await rest.account('btc');
  usdtAmount = await rest.account('usdt');
  console.log(`Current time: ${Date.now()}`)
  console.log(`Current balance: btc=${btcAmount.balance} usdt=${usdtAmount.balance}\n`);
}

function sleep(ms) {
  return new Promise( (resolve, reject) => {
     setTimeout( _ => resolve(), ms)
  })
}