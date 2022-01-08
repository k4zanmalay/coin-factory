import React, {useState, useEffect} from 'react';
import 'semantic-ui-css/semantic.min.css';
import { Container } from 'semantic-ui-react';
import Link from 'next/link';
import getFactory from '../ethereum/factory';
import Web3 from 'web3';

export default function MyApp({ Component, pageProps }) {
  const [active, setActive] = useState({create: 'active', liquidity: '', swap: ''})
  const [count, setCount] = useState('0');

  const activeItem = (event) => {
    if(event.target.name === 'create')
      setActive({create: 'active', liquidity: '', swap: ''})
    if(event.target.name === 'liquidity')
      setActive({create: '', liquidity: 'active', swap: ''})
    if(event.target.name === 'swap')
      setActive({create: '', liquidity: '', swap: 'active'})
  }

  const getTokensCount = async () => {
    const provider = new Web3.providers.WebsocketProvider(
    'wss://speedy-nodes-nyc.moralis.io/93813387eb21013f8a586a4a/bsc/testnet/ws'
    );
    const web3 = new Web3(provider);
    const factory = getFactory(provider);
    const count = await factory.methods.createdTokensCount().call();
    setCount(count);
  }

  useEffect(() => {
    getTokensCount();
  }, [])
  
  return (
    <div className="ui container" style={{marginTop: '10px'}}>
      <div className="ui inverted padded right aligned segment">
        Tokens created: {count}
      </div>
      <div className="ui three item menu">
        <Link href='/'>
          <a className={`item ${active.create}`} name='create' onClick={activeItem}>Create</a>
        </Link>
        <Link href='/liquidity'>
          <a className={`item ${active.liquidity}`} name='liquidity' onClick={activeItem}>Add Liquidity</a>
        </Link>
        <Link href='/swap'>
          <a className={`item ${active.swap}`} name='swap' onClick={activeItem}>Swap</a>
        </Link>
      </div>
      <Component {...pageProps} />
      <div className="ui segment basic">
        <img className="img ui large centered" src="/rocket.jpg"/>
      </div>
      <div className="ui inverted padded right aligned small segment">
        <p>NO INVESTMENT ADVICE</p>
        <p>
          The Content is for informational purposes only, you should not construe
          any such information or other material as legal, tax, investment,
          financial, or other advice. Nothing contained on our Site constitutes 
          a solicitation, recommendation, endorsement, or offer by ACME or any third
          party service provider to buy or sell any securities or other financial
          instruments in this or in in any other jurisdiction in which such solicitation
          or offer would be unlawful under the securities laws of such jurisdiction.
          All Content on this site is information of a general nature and does not
          address the circumstances of any particular individual or entity. Nothing
          in the Site constitutes professional and/or financial advice, nor does any
          information on the Site constitute a comprehensive or complete statement of
          the matters discussed or the law relating thereto. ACME is not a fiduciary by
          virtue of any person’s use of or access to the Site or Content. You alone assume
          the sole responsibility of evaluating the merits and risks associated with the use
          of any information or other Content on the Site before making any decisions based
          on such information or other Content. In exchange for using the Site, you agree not
          to hold ACME, its affiliates or any third party service provider liable for any
          possible claim for damages arising from any decision you make based on information
          or other Content made available to you through the Site.
        </p>
      </div>
    </div>
  )
}
