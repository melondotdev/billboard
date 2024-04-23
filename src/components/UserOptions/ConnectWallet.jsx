import React from 'react'
import { ConnectButton, useCurrentWallet, useDisconnectWallet } from '@mysten/dapp-kit';
// import { SignInButton, ethos, EthosConnectStatus } from 'ethos-connect';

const ConnectWallet = ({ disconnectionRequest, setDisconnectionRequest }) => {
  // const { wallet, status } = ethos.useWallet();
  const { connectionStatus } = useCurrentWallet();
  const { mutate: disconnect } = useDisconnectWallet();
  
  return (
    <div className='relative inline-block text-left mt-2'>
      {connectionStatus === 'disconnected' ? (
        <ConnectButton>
          Connect
        </ConnectButton>
      ) : (
        <React.Fragment>
          {disconnectionRequest && (
            <div 
              className="absolute right-0 z-10 mt-8 w-40 origin-top-right border-2 border-ssblue font-sans 
              text-center rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50 
              ease-in-out duration-300 hover:bg-ssblue cursor-pointer"
            >
              <div className="py-0.5" role="none">
                <p onClick={() => { disconnect(); setDisconnectionRequest(false); }}>Disconnect Wallet</p>
              </div>
            </div>
          )}
        </React.Fragment>
      )}
    </div>
  )
}

export default ConnectWallet
