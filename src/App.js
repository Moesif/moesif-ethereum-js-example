import React, { Component } from 'react'
import SimpleStorageContract from '../build/contracts/SimpleStorage.json'
import getWeb3 from './utils/getWeb3'

import './css/oswald.css'
import './css/open-sans.css'
import './css/pure-min.css'
import './App.css'

class App extends Component {
  constructor(props) {
    super(props)

    this.state = {
      storageValue: 0,
      web3: null
    }
    this.addToSimpleStorage = this.addToSimpleStorage.bind(this);
  }

  componentWillMount() {
    // Get network provider and web3 instance.
    // See utils/getWeb3 for more info.

    getWeb3
    .then(results => {
      this.setState({
        web3: results.web3
      })

      // Instantiate contract once web3 provided.
      this.instantiateContract()
    })
    .catch(() => {
      console.log('Error finding web3.')
    })
  }

  instantiateContract() {
    /*
     * SMART CONTRACT EXAMPLE
     *
     * Normally these functions would be called in the context of a
     * state management library, but for convenience I've placed them here.
     */

    const contract = require('truffle-contract')
    const simpleStorage = contract(SimpleStorageContract)
    simpleStorage.setProvider(this.state.web3.currentProvider)

    // Declaring this for later so we can chain functions on SimpleStorage.
    var simpleStorageInstance

    // Get accounts.
    this.state.web3.eth.getAccounts((error, accounts) => {
      simpleStorage.deployed().then((instance) => {
        simpleStorageInstance = instance

        this.setState(prevState => ({
          ...prevState,
          accounts,
          simpleStorageInstance
        }));

        // Stores a given value, 5 by default.
        return simpleStorageInstance.set(5, {from: accounts[0]})
      }).then((result) => {
        // Get the value from the contract to prove it worked.
        return simpleStorageInstance.get.call(accounts[0])
      }).then((result) => {
        // Update state with the result.
        return this.setState(prevState => ({
          ...prevState,
          storageValue: result.c[0]
        }))
      })
    })
  }

  addToSimpleStorage() {
    if (this.state.simpleStorageInstance && this.state.accounts) {
      const value = this.storageAmountInput.value;
      console.log('value to be stored is');
      console.log(value);
      this.state.simpleStorageInstance.set(value, {from: this.state.accounts[0]})
        .then((result) => {
          return this.state.simpleStorageInstance.get.call(this.state.accounts[0])
        }).then((result) => {
          this.setState(prevState => ({
            ...prevState,
            storageValue: result.c[0]
          }));
        }).catch((err) => {
          console.log('error');
          console.log(err);
        });
    } else {
      this.setState(prevState => ({
        ...prevState,
        error: new Error('simple storage instance not loaded')
      }))
    }
  }

  render() {
    return (
      <div className="App">
        <nav className="navbar pure-menu pure-menu-horizontal">
            <a href="#" className="pure-menu-heading pure-menu-link">Truffle Box</a>
        </nav>

        <main className="container">
          <div className="pure-g">
            <div className="pure-u-1-1">
              <h1>Good to Go!</h1>
              <p>Your Truffle Box is installed and ready.</p>
              <hr />
              <h2>Smart Contract Example</h2>
              <p>If your contracts compiled and migrated successfully, below will show a stored value of 5 (by default).</p>
              <p>Try changing the value stored on <strong>line 59</strong> of App.js.</p>
              <p>The stored value is: {this.state.storageValue}</p>
              <hr />
              {/* <h2>Accounts in this web3</h2>
              <pre>
                {this.state.accounts && JSON.stringify(this.state.accounts)}
              </pre> */}
              <h2>Interactive Dapp Example</h2>
              <p>
                You should be able to use this form to interact with the storage smart contract.
              </p>
              <form className="pure-form pure-form-stacked">
                <fieldset>
                  <label htmlFor="storage">Storage Amount</label>
                  <input id="storage" type="number" ref={c => { this.storageAmountInput = c }} />
                  <button
                    className="pure-button"
                    onClick={(e) => {
                      e.preventDefault();
                      this.addToSimpleStorage()
                    }}
                  >
                    Set Storage
                  </button>
                </fieldset>
              </form>
              <p>If you followed the direction in README.md and added your Moesif Application ID, you should see all JSON-RPC calls captured in your Moesif Account for analysis.</p>
            </div>
          </div>
        </main>
      </div>
    );
  }
}

export default App
