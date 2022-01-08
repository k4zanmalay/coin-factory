import getWeb3 from './web3';
import {abi} from '../artifacts/contracts/tokenFactory.sol/Token.json';


export default (provider, address) => {
  const web3 = getWeb3(provider);
  return new web3.eth.Contract(abi, address);
}
