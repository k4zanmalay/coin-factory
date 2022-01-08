const hre = require("hardhat");
const {abi, bytecode} = require("../artifacts/contracts/tokenFactory.sol/TokenFactory.json");

async function main() {
  const accounts = await web3.eth.requestAccounts();
  const result = await new web3.eth.Contract(abi)
    .deploy({data: bytecode})
    .send({from: accounts[0], gas: '10000000'});
  
  console.log('Contract deployed to', result.options.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
