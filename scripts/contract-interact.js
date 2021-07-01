require("dotenv").config();
const ALCHEMY_API_KEY = process.env.ALCHEMY_API_KEY;
const ROPSTEN_PUBLIC_ADDRESS = process.env.ROPSTEN_PUBLIC_ADDRESS;
const ROPSTEN_PRIVATE_KEY = process.env.ROPSTEN_PRIVATE_KEY;

const { createAlchemyWeb3 } = require("@alch/alchemy-web3");
const web3 = createAlchemyWeb3(
  `https://eth-ropsten.alchemyapi.io/v2/${ALCHEMY_API_KEY}`
);

const contract = require("../src/artifacts/contracts/HelloWorld.sol/HelloWorld.json");
const contractAddress = process.env.DEPLOYED_SMART_CONTRACT_ADDRESS_ROPSTEN;

const helloWorldContract = new web3.eth.Contract(contract.abi, contractAddress);

//+-If you want to see the ABI you can print it to your console:_
//console.log(JSON.stringify(contract.abi));

async function updateMessage(newMessage) {
  const nonce = await web3.eth.getTransactionCount(
    ROPSTEN_PUBLIC_ADDRESS,
    "latest"
  ); // get latest nonce
  const gasEstimate = await helloWorldContract.methods
    .update(newMessage)
    .estimateGas(); // estimate gas

  // Create the transaction
  const tx = {
    from: ROPSTEN_PUBLIC_ADDRESS,
    to: contractAddress,
    nonce: nonce,
    gas: gasEstimate,
    data: helloWorldContract.methods.update(newMessage).encodeABI(),
  };

  // Sign the transaction
  const signPromise = web3.eth.accounts.signTransaction(
    tx,
    ROPSTEN_PRIVATE_KEY
  );
  signPromise
    .then((signedTx) => {
      web3.eth.sendSignedTransaction(
        signedTx.rawTransaction,
        function (err, hash) {
          if (!err) {
            console.log(
              "The hash of your transaction is: ",
              hash,
              "\n Check Alchemy's Mempool to view the status of your transaction!"
            );
          } else {
            console.log(
              "Something went wrong when submitting your transaction:",
              err
            );
          }
        }
      );
    })
    .catch((err) => {
      console.log("Promise failed:", err);
    });
}

async function main() {
  const message = await helloWorldContract.methods.message().call();
  console.log("The message is: " + message);
  //await updateMessage("Hello Drupe!");
}

main();
