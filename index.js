const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');
var lodash = require('lodash');
const { has, identity } = require('lodash');

// replace the value below with the Telegram token you receive from @BotFather
// const token = "1624397507:AAFdlyiFSbaWqGNsLLM3Wo3M60p-IFFpuLQ";
// const token = "1501556810:AAFnBz0lJYBHCXArecgd3iGjzzVl2mcqcZU";
const token = "1704071215:AAFaNUguK4fXdQT5GMB3zq-VOAoZi8RdFzQ";
const apikey = "N32IIV7CPUPHJH4ATA83D7IJZ7Y37VJ6II";
const address = "0x3b3213e8f78ed08bfc0c5640f730e9f0861967f1";
const contract = "0xe3ba88c38d2789fe58465020cc0fb60b70c10d32";

const listAddress = [
  {
    'address' : '0x233242524229b8cea887645746c8849577f88aa2',
    'tokenSymbol' : 'WBST',
    'tokenPair' : 'BUSD',
    'chatId' : '@RocketPriceWBST'
  },
  {
    'address' : '0x3b3213e8f78ed08bfc0c5640f730e9f0861967f1',
    'tokenSymbol' : 'KIND',
    'tokenPair' : 'BUSD',
    'chatId' : '@RocketPriceKIND'
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
   console.log('ceeeeee : '+baseArray[0].chatId);
  //  return;
   sendMessage( baseArray[0],baseArray[0].chatId);
   console.log(baseArray);
   baseArray.shift();
   //return;
   // console.log('jml array : '+baseArray.length);
  }
 }


async function getTransaction(dataAddress){
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
  if(data.to === address){
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
  }
  // console.log(data[0].time +' dan '+tt);

  if((data[0].time)*1 > tt){
    tt=data[0].time;
    baseArray.push(dataSend);
    // console.log('tambah data');
  }
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
        var a = msg.amountKind / (10**msg.decimalKind);
        var b = msg.amount / (10**msg.decimal);

     var rate = b / a;
    //  console.log((msg.amountKind*1).toFixed(2));

        // bot.sendMessage(chatId,'*hiiiii*',opts);
     if(msg.type=="BUY")   bot.sendMessage(chatId, ' *'+msg.type+'* 🚀🚀🚀 @ $'+rate.toFixed(5)+'\n\n'+ (a*1).toFixed(2) +' *$'+msg.tokensim+'* from '+(b*1).toFixed(2)+' *$'+msg.pair+'*\n\n👉 PancakeSwap [HASH](https://bscscan.com/tx/'+msg.hash+')',opts)
     if(msg.type=="SELL")   bot.sendMessage(chatId, ' *'+msg.type+'* 🚗🚗🚗 @ $'+rate.toFixed(5)+'\n\n'+ (a*1).toFixed(2) +' *$'+msg.tokensim+'* for '+(b*1).toFixed(2)+' *$'+msg.pair+'*\n\n👉 PancakeSwap [HASH](https://bscscan.com/tx/'+msg.hash+')',opts)
      // console.log('jml hash : '+hashArray.length);
}      
        async function main(){
        //    await getUpdates();
        listAddress.forEach((data,index) => {
          // console.log(data);
          // return;
          getTransaction(data);
        });
        }
        
        setInterval(() => {
            main();
        }, 30000);
        main();