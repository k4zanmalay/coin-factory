import React, {useState, useEffect} from 'react';
import getRouter from '../ethereum/router';
import getFactory from '../ethereum/factory';
import getWeb3 from '../ethereum/web3';

function HomePage () {
  const getName = () => {
    const names = [
      'Shiba', 'Elon', 'Doge', 'Safe', 'Moon', 'Fair', 'Mars',
      'Floki', 'Bonk', 'Token', 'FOMO', 'Meta', 'Rug', 'Rocket'];
    const name = Array(3).fill().map(el => names[Math.floor(Math.random()*names.length)]);
    const symbol = name.map(el => el.charAt(0));
    setTokenName({name: name.join(''), symbol: symbol.join('')});  
  }
  
  const [tokenName, setTokenName] = useState({name: '', symbol: ''})
  const [formState, setFormState] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState('');
  
  const createToken = async (event) => {
    try {
      event.preventDefault();
      setFormState('');
      setLoading('loading');
      const provider = window.ethereum;
      const web3 = getWeb3(provider);
      const factory = getFactory(provider);
      const accounts = await web3.eth.getAccounts();
      const tx = await factory.methods
        .createToken('1000000', tokenName.name, tokenName.symbol)
        .send({from: accounts[0]});
      setMessage(`at address: ${tx.events[1].address}`);
      setLoading('');
      setFormState('success');
    } catch(err) {
      setLoading('');
      setMessage(err.message);
      setFormState('error');
    }
  }
  
  return (
    <div className="ui segment">
      <div className="ui grid">
        <div className="eight wide column">
          <h2>Create your own token</h2>
        </div>
        <div className="eight wide column">
          <button onClick={getName} className="ui fluid top attached button">Generate Token Name</button>
        </div>
      </div>  
      <form onSubmit={createToken} className={`ui form ${formState}`}>
        <div className="field">
          <label>Token name</label>
          <input
            type="text"
            value={tokenName.name}
            name="token-name"
            placeholder="Token"
            onChange={event => setTokenName({...tokenName, name: event.target.value})}
          />
        </div>
        <div className="field">
          <label>Symbol</label>
          <input
            type="text"
            value={tokenName.symbol}
            name="token-symbol"
            placeholder="TKN"
            onChange={event => setTokenName({...tokenName, symbol: event.target.value})}
          />
        </div>
        <div className="ui success message">
          <div className="header">Your token is ready</div>
          <p>{message}</p>
        </div>
        <div className="ui error message">
          <div className="header">Yikes!</div>
          <p>{message}</p>
        </div>
        <button className={`ui button ${loading}`}>Create</button>
      </form>
    </div>
  )
}

export default HomePage;
