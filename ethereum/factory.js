import getWeb3 from './web3';
import {abi} from '../artifacts/contracts/tokenFactory.sol/TokenFactory.json';

const address = '0xbC71BF36FA0d351a671ADf01Df9b9058F4c665dD';

export default (provider) => {
  const web3 = getWeb3(provider);
  return new web3.eth.Contract(abi, address);
}
