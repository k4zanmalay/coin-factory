import React from 'react'
import getRouter from '../ethereum/router';
import getFactory from '../ethereum/factory';
import getWeb3 from '../ethereum/web3';
import { Button, Header, List, Modal, Icon, Input } from 'semantic-ui-react'

function MyModal(props) {
  const [open, setOpen] = React.useState(false);
  const [tokens, setTokens] = React.useState([]);
  const [address, setAddress] = React.useState('');
  
  const getToken = async () => {
    const token = {};
    const provider = window.ethereum;
    const web3 = getWeb3(provider);
    const factory = getFactory(provider);
    const accounts = await web3.eth.getAccounts();
    const res = await factory.methods.getToken(address).call();
    token.name = res[0];
    token.symbol = res[1];
    token.address = address;
    props.callback(token);
    setOpen(false);
  }

  const getTokens = async () => {
    const provider = window.ethereum;
    const web3 = getWeb3(provider);
    const factory = getFactory(provider);
    const accounts = await web3.eth.getAccounts();
    const res = await factory.methods.getCreatedTokens().call();
    setTokens(res);
  }

  const renderTokens = () => {
    return tokens.map((el, index) => {
      const token = {};
      token.name = el[0];
      token.symbol = el[1];
      token.address = el[2];
      return (
        <List.Item
          key={index}
          onClick={ () => {
            setOpen(false);
            props.callback(token);   
          }}
        >
          <List.Header>{token.symbol}</List.Header>
          {token.name}
        </List.Item>
      );
    });
  }
  
  return (
    <Modal
      onClose={() => setOpen(false)}
      onOpen={() => {
        setOpen(true);
        getTokens();
      }}
      open={open}
      trigger={<i className="caret down link icon"></i>}
      size = 'small'
    >
      <Modal.Header>Select a Token</Modal.Header>
      <Modal.Content>
        <List selection divided verticalAlign="middle" size="huge">
          {renderTokens()}
        </List>
        <Modal.Description>
          <Input
            icon={{name: "search", link: true, onClick: getToken}} 
            placeholder="Paste token address..."
            size="big"
            fluid
            value={address}
            onChange={event => setAddress(event.target.value)}
          />
        </Modal.Description>
      </Modal.Content>
    </Modal>
  )
}

export default MyModal
