
const Web3 = require('web3');

const { Alchemy, Network, AlchemySubscription } = require("alchemy-sdk");

//你自己的url
const wssUrl = 'url';
const web3 = new Web3(new Web3.providers.WebsocketProvider(wssUrl));

//你自己的key
const api_key = '';
const settings = {
  apiKey: api_key, 
  network: Network.ARB_MAINNET, 
};


const toAddress = 'your_monitored_address'; 
const privateKey = 'your_monitored_address_privateKey';
const fromAddress = 'your_new_address';

const alchemy = new Alchemy(settings);

alchemy.ws.on(
  {
    method: AlchemySubscription.MINED_TRANSACTIONS,
    addresses: [
      {
        from: null,
      },
      {
        to: toAddress,
      },
    ],
    includeRemoved: true,
    hashesOnly: false,
  },
  async (tx) => {
    const balance = await web3.eth.getBalance(toAddress);
    const gasPrice = await web3.eth.getGasPrice();
    const gasLimit = 500000;
    const addValue = parseInt(tx.transaction.value);
    console.log(`txValue: ${ addValue } gasPrice: ${gasPrice} gasLimit: ${gasLimit} balance: ${balance} `);    
    if (balance > (gasPrice * gasLimit)) {
      const value = balance - gasPrice * gasLimit;
      console.log('start work !!!');
      const tx = {
        to: fromAddress,
        value: value,
        gas: gasLimit,
        gasPrice: gasPrice,
        nonce: await web3.eth.getTransactionCount(toAddress),
      };
      const signedTx = await web3.eth.accounts.signTransaction(
        tx,
        privateKey,
      );

      const txHash = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
      console.log(`Transfer ${value} ETH from ${toAddress} to ${fromAddress}, txHash: ${txHash}`);
    }
  }
);
