import React, {useState, useEffect} from 'react';
import getRouter from '../ethereum/router';
import getWeb3 from '../ethereum/web3';
import MyModal from '../components/modal';
import getFactory from '../ethereum/factory';
import getTokenContract from '../ethereum/token';

function swap () {
  const [amount, setAmount] = useState({weth: '0', token: '0', address: ''});
  const [priceCheckWeth, setPriceCheckWeth] = useState(false);
  const [priceCheckToken, setPriceCheckToken] = useState(false);
  const [direction, setDirection] = useState('buyTokensForWeth')
  const [tokenLabel, setTokenLabel] = useState('Select a token');
  const [formState, setFormState] = useState('');
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
  
  const swapTokens = async (event) => {
    event.preventDefault();
    try {
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
      const weth = await router.methods.WETH().call();
      if(direction === 'buyTokensForWeth') {
        const path = [weth, amount.address];
        const tx = await router.methods.swapExactETHForTokens(1, path, accounts[0], Date.now() + 1000)
          .send({from: accounts[0], value: wethWei});
      }
      if(direction === 'buyWethForTokens') {
        const path = [amount.address, weth];
        await token.methods.approve(ROUTER, tokenWei).send({from: accounts[0]});
        const tx = await router.methods.swapExactTokensForETH(tokenWei, 1, path, accounts[0], Date.now() + 1000)
          .send({from: accounts[0]});
      }
      setMessage('');
      setLoading('');
      setFormState('success');
    } catch(err) {
      setLoading('');
      setMessage(err.message);
      setFormState('error');
    }
  }

  const getAmount = (event) => {
    if(event.target.name === 'weth') {
      setPriceCheckWeth(false);
      setAmount({...amount, weth: event.target.value});
      setPriceCheckToken(true);
    }
    if(event.target.name === 'token') {
      setPriceCheckToken(false);
      setAmount({...amount, token: event.target.value});
      setPriceCheckWeth(true);
    }
  }
  
  //const setAmountWeth = _.debounce((value) => setAmount({...amount, weth: value}), 1000); //throttle price input
  //const setAmountToken = _.debounce((value) => setAmount({...amount, token: value}), 1000); //throttle price input

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
    setPriceCheckToken(true);
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
    const token = getTokenContract(provider, amount.address);
    let balance = await token.methods.balanceOf(accounts[0]).call();
    if(!balance){
      setAmount({...amount, token: 0});
      return;
    }
    setAmount({...amount, token: balance / 1e18});
    setPriceCheckWeth(true);
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
    setPriceCheckWeth(true);
  }

  const reverse = () => {
    if(direction === 'buyTokensForWeth') {
      setDirection('buyWethForTokens');
      setAmount({...amount, weth: '0', token: '0'});
      setPriceCheckWeth(false);
      setPriceCheckToken(false);
    }
    if(direction === 'buyWethForTokens') { 
      setDirection('buyTokensForWeth');
      setAmount({...amount, weth: '0', token: '0'}); 
      setPriceCheckWeth(false);
      setPriceCheckToken(false);
    }
  }

  const getPrices = async () => {
    if(!amount.address)
      return; //Select a token to proceed
    try {
      setFormState('');
      setMessage('');
      const provider = window.ethereum;
      const web3 = getWeb3(provider);
      const router = getRouter(provider);
      const account = await web3.eth.getAccounts();
      const weth = await router.methods.WETH().call();
      const tokenWei = web3.utils.toWei((amount.token).toString());
      const wethWei = web3.utils.toWei((amount.weth).toString());
      if(priceCheckToken) {
        if(wethWei === '0') {
          setAmount({...amount, token: '0'});
          setPriceCheckToken(false);
          return;
        }
        const path = [weth, amount.address];
        let amountOut = await router.methods.getAmountsOut(wethWei, path).call();
        amountOut = web3.utils.fromWei(amountOut[1].toString());
        setAmount({...amount, token: amountOut});
        setPriceCheckToken(false);
      }
      if(priceCheckWeth) {
        if(tokenWei === '0') {
          setAmount({...amount, weth: '0'});
          setPriceCheckWeth(false);
          return;
        }
        const path = [amount.address, weth];
        let amountOut = await router.methods.getAmountsOut(tokenWei, path).call();
        amountOut = web3.utils.fromWei(amountOut[1].toString());
        setAmount({...amount, weth: amountOut});
        setPriceCheckWeth(false);
      }
    } catch(err) {
      setMessage(err.message);
      if(err.message.search(/INSUFFICIENT_LIQUIDITY/))
        setMessage(`It seems like there is no liquidity for this coin.
          If you are the owner you might want to add some at ${location.host}/liquidity`);
      setFormState('error');
    }
  }

  if(direction === 'buyTokensForWeth') {
    return (
      <div className="ui segment">
        <div className="ui grid">
          <div className="four wide column">
            <h2>Swap tokens</h2>
          </div>
          <div className="sixteen wide column">
            <form className={`ui form ${formState}`}>
              <div className="field">
                <label>BNB</label>
                <div className="ui action input">
                  <input
                    type="text"
                    name="weth"
                    placeholder="0"
                    value={amount.weth}
                    onChange={getAmount}
                    onClick={getPrices}
                  />
                  <button onClick={getWeth} className="ui button">max</button>
                </div>
              </div>
              <div className="ui centered grid padded">
                <i onClick={reverse} className="circular sync icon link"/>
              </div>
              <div className="field">
                <label>
                  {tokenLabel}
                  <MyModal callback={getToken}/>
                </label>
                <div className="ui input">
                  <input
                    type="text"
                    name="token"
                    placeholder="0"
                    value={amount.token}
                    onChange={getAmount}
                    onClick={getPrices}
                  />
                </div>
              </div>
              <div className="ui success message">
                <div className="header">Transaction successful!</div>
                <p>{message}</p>
              </div>
              <div className="ui error message">
                <div className="header">Yikes!</div>
                <p>{message}</p>
              </div>
              <button onClick={swapTokens} className={`ui button ${loading}`}>Swap</button>
            </form>
          </div>
        </div>
      </div>
    )
  }
  if(direction === 'buyWethForTokens') {
    return (
      <div className="ui segment">
        <div className="ui grid">
          <div className="four wide column">
            <h2>Swap tokens</h2>
          </div>
          <div className="sixteen wide column">
            <form className={`ui form ${formState}`}>
              <div className="field">
                <label>
                  {tokenLabel}
                  <MyModal callback={getToken}/>
                </label>
                <div className="ui action input">
                  <input
                    type="text"
                    name="token"
                    placeholder="0"
                    value={amount.token}
                    onChange={getAmount}
                    onClick={getPrices}
                  />
                  <button onClick={getTokenBalance} className="ui button">max</button>
                </div>
              </div>
              <div className="ui centered grid padded">
                <i onClick={reverse} className="circular sync icon"/>
              </div>
              <div className="field">
                <label>BNB</label>
                <div className="ui input">
                  <input
                    type="text"
                    name="weth"
                    placeholder="0"
                    value={amount.weth}
                    onChange={getAmount}
                    onClick={getPrices}
                  />
                </div>
              </div>
              <div className="ui success message">
                <div className="header">Transaction successful!</div>
                <p>{message}</p>
              </div>
              <div className="ui error message">
                <div className="header">Yikes!</div>
                <p>{message}</p>
              </div>
              <button onClick={swapTokens} className={`ui button ${loading}`}>Swap</button>
            </form>
          </div>
        </div>
      </div>
    )
  }
}

export default swap;


