const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');
var lodash = require('lodash');
const dotenv = require('dotenv');
dotenv.config();
const { has, identity } = require('lodash');

// replace the value below with the Telegram token you receive from @BotFather
const token = process.env.TELEGRAM_BOT_TOKEN;
const apikey = process.env.BSC_API_KEY;

const listAddress = [
  {
    'address' : '0x0511e110c536558db3dde405cd334621ca881221',
    'tokenSymbol' : 'WBST',
    'tokenPair' : 'BUSD',
    // 'chatId' : '@RocketPriceWBST',
    'chatId' : process.env.WBST_CHAT_ID,
      'rate' : 1
  },
  {
    'address' : '0xebb77b3414af083e523df915f78df19b7ddd3969',
    'tokenSymbol' : 'KIND',
    'tokenPair' : 'BUSD',
    // 'chatId' : '@RocketPriceKIND',
    'chatId' : process.env.KIND_CHAT_ID,
      'rate' : 1
  },
    {
        'address' : '0xc8a7436610400a271a8969ab17ec41229a5ae188',
        'tokenSymbol' : 'OGC',
        'tokenPair' : 'BUSD',
        // 'chatId' : '@RocketPriceOGC',
        'chatId' : process.env.OGC_CHAT_ID,
        'rate' : 1
    }

];

// Create a bot that uses 'polling' to fetch new updates
const bot = new TelegramBot(token,{polling: false});
var newArray = [];
var arrayGroup = [];
var hashArray = [];
var baseArray = [];

setInterval(updatedata,10000);

function updatedata(){
  // return;
 var data1 = Array();
 baseArray.forEach((data,index) => {
   data1 = data;
 });
 
 if(baseArray.length>0){
  //  console.log('ceeeeee : '+baseArray[0].chatId);
  //  return;
   sendMessage( baseArray[0],baseArray[0].chatId);
  //  console.log(baseArray);
   baseArray.shift();
   //return;
   console.log('jml array : '+baseArray.length);
  }
 }


let getTransaction = (dataAddress) => {
  // console.log(dataAddress.address);
  // return;
axios.get('https://api.bscscan.com/api', {
    params: {
      apikey:apikey,
      sort:'desc',
      offset:20,
      page:1,
    //   contractaddress:contract,
      address:dataAddress.address,
      module:'account',
      action:'tokentx'
    }
  })
  .then( function (response) {
          response.data.result.reverse().forEach((data,index) => {
            var d = {};
            d.hash = data.hash;
            d.sim  = data.tokenSymbol;

            d.amount = data.value;
            d.decimal = data.tokenDecimal;
            d.to = data.to;
            d.time = data.timeStamp;
            d.chatId = dataAddress.chatId;
              d.rate = dataAddress.rate;
            d.address = dataAddress.address;

            hashArray.push(d.hash);
            newArray.push(d);
          });
          arrayGroup = lodash.groupBy(newArray, 'hash');

          manageArray(Array.from(new Set(hashArray)),arrayGroup);
        })
  }

  function manageArray(arr,arrayGroup){
    let datas = JSON.parse(JSON.stringify(arrayGroup));
    // console.log(datas);
    // return;
    arr.forEach((data,index) => {
      setData(datas[data]);
    });
}

function setType(data){
  if(data.to === data.address){
      return 'BUY';
  }else{
    return 'SELL';
  }
}

var tt=0;
function setData(data){
  let dataSend = {};
  // console.log(data[0]);
  // return;
    if (data[0].sim  === 'WBNB'){
        data[0].sim = 'BUSD';
    }
    if (data[1].sim  === 'WBNB'){
        data[0].sim = 'BUSD';
    }

  if(data[0].sim  === 'BUSD' || data[1].sim  === 'BUSD'){
    if(data[0].sim === 'BUSD'){
      dataSend.hash = data[0].hash;
      dataSend.tokensim = data[1].sim;
      dataSend.pair = data[0].sim;
      dataSend.hash = data[0].hash;
      dataSend.amount = data[0].amount;
      dataSend.decimal = data[0].decimal;
      dataSend.amountKind = data[1].amount;
      dataSend.decimalKind = data[1].decimal;
      dataSend.type = setType(data[0]);
      dataSend.chatId = data[0].chatId;
        dataSend.rate = data[0].rate;
    }else{
      // console.log(data);
      dataSend.hash = data[1].hash;
      dataSend.tokensim = data[0].sim;
      dataSend.pair = data[1].sim;
      dataSend.hash = data[1].hash;
      dataSend.type = setType(data[1]);
      dataSend.amount = data[1].amount;
      dataSend.decimal = data[1].decimal;
      dataSend.amountKind = data[0].amount;
      dataSend.decimalKind = data[0].decimal;
      dataSend.chatId = data[0].chatId;
      dataSend.rate = data[0].rate;

    }
  }else{
    console.log(data[0].sim);
  }
  // console.log(data[0].time +' dan '+tt);

  if((data[0].time)*1 > tt){
    tt=data[0].time;
    baseArray.push(dataSend);
  }
}

let getPrice = async () => {
    await axios.get('https://app.kindcow.finance/price')
        .then((response) => {
            let rateNow = response.data.price.BNB;
            let token = listAddress.find(x => x.tokenSymbol === 'OGC');
            token.rate = rateNow * 1;
            console.log('BNB : '+token.rate);
        });
}
  
  async function sendMessage(msg,chatId){

    const opts = {
        parse_mode: 'Markdown',
        disable_web_page_preview : true,
//         reply_markup:{
// inline_keyboard:[
// [{text:'Amount : '+(msg.value*0.00000001)+' KIND',url:'https://bscscan.com/tx/'+msg.hash} ]
// ]
// }
      };

        console.log('send to :'+chatId);
        let a = msg.amountKind / (10**msg.decimalKind);
        let b = msg.amount / (10**msg.decimal);

      let priceRate = msg.rate;
     let rate = b / a * priceRate;
    //  console.log((msg.amountKind*1).toFixed(2));

        // bot.sendMessage(chatId,'*hiiiii*',opts);
     if(msg.type=="BUY")   bot.sendMessage(chatId, ' *'+msg.type+'* 🚀🚀🚀 @ $'+rate.toFixed(5)+'\n\n'+ (a*1).toFixed(2) +' *$'+msg.tokensim+'* from '+(b * priceRate * 1).toFixed(2)+' *$'+msg.pair+'*\n\n👉 PancakeSwap [HASH](https://bscscan.com/tx/'+msg.hash+')',opts)
     if(msg.type=="SELL")   bot.sendMessage(chatId, ' *'+msg.type+'* 🚗🚗🚗 @ $'+rate.toFixed(5)+'\n\n'+ (a*1).toFixed(2) +' *$'+msg.tokensim+'* for '+(b * priceRate * 1).toFixed(2)+' *$'+msg.pair+'*\n\n👉 PancakeSwap [HASH](https://bscscan.com/tx/'+msg.hash+')',opts)
      // console.log('jml hash : '+hashArray.length);
}

         let main = () => {
        //    await getUpdates();
        listAddress.forEach((data,index) => {
          // console.log(data);
          // return;
          getTransaction(data);
        });
        }

        setInterval(() => {
            getPrice().then(r => console.log('updated'));
        },60000);

        setInterval(() => {
            main();
        }, 30000);
        getPrice().then(x =>
            main()
        );