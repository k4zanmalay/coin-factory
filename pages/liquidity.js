import React, {useState, useEffect} from 'react';
import getRouter from '../ethereum/router';
import getFactory from '../ethereum/factory';
import getUniFactory from '../ethereum/uniFactory';
import getTokenContract from '../ethereum/token';
import getWeb3 from '../ethereum/web3';
import MyModal from '../components/modal';

function liquidity () {
  const [amount, setAmount] = useState({weth: '0', token: '0', address: ''});
  const [pair, setPair] = useState('');
  const [tokenLabel, setTokenLabel] = useState('Select a token');
  const [formState, setFormState] = useState('');
  const [buttonState, setButtonState] = useState('disabled');
  const [inputState, setInputState] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState('');
  
  const ROUTER = '0xD99D1c33F9fC3444f8101754aBC46c52416550D1';

  const isWallet = async () => {
    setMessage('');
    setFormState('');
    if(!window.ethereum) {
      setMessage('Metamask wallet not detected');
      setFormState('error');
      return false;
    }
    const provider = window.ethereum;
    const web3 = getWeb3(provider);
    const accounts = await web3.eth.getAccounts();
    if(!accounts[0]) {
      setMessage('Metamask wallet not detected');
      setFormState('error');
      return false
    }
    return true;
  }

  const addLiquidity = async (event) => {
    try{
      event.preventDefault();
      setLoading('loading');
      setFormState('');
      setMessage('');
      const provider = window.ethereum;
      const web3 = getWeb3(provider);
      const router = getRouter(provider);
      const token = getTokenContract(provider, amount.address);
      const tokenWei = web3.utils.toWei((amount.token).toString());
      const wethWei = web3.utils.toWei((amount.weth).toString());
      const accounts = await web3.eth.getAccounts();
      await token.methods.approve(ROUTER, tokenWei).send({from: accounts[0]});
      const tx = await router.methods.addLiquidityETH(amount.address, tokenWei, 1, 1, accounts[0], Date.now() + 1000)
        .send({from: accounts[0], value: wethWei});
      setMessage('Liquidity pair created');
      setLoading('');
      setFormState('success');
      let newBalance = await token.methods.balanceOf(accounts[0]).call();
      newBalance = web3.utils.fromWei(newBalance.toString());
      setAmount({...amount, token: newBalance});
    } catch(err) {
      setLoading('');
      setMessage(err.message);
      setFormState('error');
    }
  }

  const getLP = async (event) => {
    event.preventDefault();
    if(tokenLabel === 'Cake LP')
      return
    if(!(await isWallet()))
      return
    const provider = window.ethereum;
    const web3 = getWeb3(provider);
    const router = getRouter(provider);
    const uniFactory = getUniFactory(provider);
    const weth = await router.methods.WETH().call();
    const accounts = await web3.eth.getAccounts();
    const addressLP = await uniFactory.methods.getPair(amount.address, weth).call();
    const token = getTokenContract(provider, addressLP);
    let amountLP = await token.methods.balanceOf(accounts[0]).call();
    amountLP = web3.utils.fromWei(amountLP.toString());
    setPair(addressLP);
    setAmount({...amount, token: amountLP});
    setTokenLabel('Cake LP');
    setButtonState('active');
    setInputState('disabled');
  }

  const removeLiquidity = async (event) => {
    event.preventDefault();
    if(!(tokenLabel === 'Cake LP'))
      return; 
    setLoading('loading');
    setFormState('');
    setMessage('');
    try{
      const provider = window.ethereum;
      const web3 = getWeb3(provider);
      const router = getRouter(provider);
      const token = getTokenContract(provider, pair);
      const tokenWei = web3.utils.toWei((amount.token).toString());
      const accounts = await web3.eth.getAccounts();
      await token.methods.approve(ROUTER, tokenWei).send({from: accounts[0]});
      const tx = await router.methods.removeLiquidityETH(amount.address, tokenWei, 1, 1, accounts[0], Date.now() + 1000)
        .send({from: accounts[0]});
      let newBalance = await token.methods.balanceOf(accounts[0]).call();
      newBalance = web3.utils.fromWei(newBalance.toString());
      setAmount({...amount, token: newBalance});
      setMessage('Liquidity removed');
      setLoading('');
      setFormState('success');
      setLoading('');
    } catch(err) {
      setLoading('');
      setMessage(err.message);
      setFormState('error');
    }
  }

  const getWeth = async (event) => {
    if(event)
      event.preventDefault();
    if(!(await isWallet()))
      return
    const provider = window.ethereum;
    const web3 = getWeb3(provider);
    const accounts = await web3.eth.getAccounts();
    let balance = await web3.eth.getBalance(accounts[0]);
    balance = web3.utils.fromWei(balance);
    setAmount({...amount, weth: balance});
  }

  const getTokenBalance = async (event) => {
    if(event)
      event.preventDefault();
    if(!amount.address)
      return;//throw error no token selected
    if(!(await isWallet()))
      return
    const provider = window.ethereum;
    const web3 = getWeb3(provider);
    const accounts = await web3.eth.getAccounts();
    let token = getTokenContract(provider, amount.address);
    if(tokenLabel === 'Cake LP') 
      token = getTokenContract(provider, pair);
    let balance = await token.methods.balanceOf(accounts[0]).call();
    if(!balance){
      setAmount({...amount, token: 0});
      return;
    }
    setAmount({...amount, token: balance / 1e18});
  }

  const getToken = async (token) => {
    if(!(await isWallet()))
      return
    const provider = window.ethereum;
    const web3 = getWeb3(provider);
    const factory = getFactory(provider);
    const accounts = await web3.eth.getAccounts();
    const res = await factory.methods
        .getToken(token.address)
        .call({from: accounts[0]}); //We need to specify the account because function in 
                                    //contract uses msg.sender value
    
    setAmount({...amount, token: res[2] / 1e18, address: token.address});
    setTokenLabel(res[1]);
    setButtonState('disabled');
    setInputState('');
  }

  return (
    <div className="ui segment">
      <h2>Add liquidity</h2>
      <form className={`ui form ${formState}`}>
        <div className="field">
          <label>BNB</label>
          <div className="ui action input">
            <input
              type="text"
              name="bnb-amount"
              placeholder="0"
              value={amount.weth}
              onChange={event => setAmount({...amount, weth: event.target.value})}
              className={`ui input ${inputState}`}
            />
            <button onClick={getWeth} className="ui button">max</button>
          </div>
        </div>
        <div className="field">
          <label>
            {tokenLabel}
            <MyModal callback={getToken}/>
          </label>
          <div className="ui action input">
            <input
              type="text"
              name="token-amount"
              placeholder="0"
              value={amount.token}
              onChange={event => setAmount({...amount, token: event.target.value})}
            />
            <button onClick={getTokenBalance} className="ui button">max</button>
          </div>
        </div>
        <div className="ui success message">
          <div className="header">Success!</div>
          <p>{message}</p>
        </div>
        <div className="ui error message">
          <div className="header">Yikes!</div>
          <p>{message}</p>
        </div>
        <button onClick={addLiquidity} className={`ui button ${loading}`}>Add liquidity</button>
        <button onClick={getLP} className="ui button">Get My LP</button>
        <button onClick={removeLiquidity} className={`ui button ${loading} ${buttonState}`}>Remove liquidity</button>
      </form>
    </div>
  )
}

export default liquidity;

