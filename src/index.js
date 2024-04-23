import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import 'react-tooltip/dist/react-tooltip.css'
import App from './App';
import reportWebVitals from './reportWebVitals';
import '@mysten/dapp-kit/dist/index.css';

import { SuiClientProvider, lightTheme, WalletProvider } from '@mysten/dapp-kit';
import { getFullnodeUrl } from '@mysten/sui.js/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();
const networks = {
	localnet: { url: getFullnodeUrl('localnet') },
	devnet: { url: getFullnodeUrl('devnet') },
	testnet: { url: getFullnodeUrl('testnet') },
	mainnet: { url: getFullnodeUrl('mainnet') },
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <QueryClientProvider client={queryClient}>
		<SuiClientProvider networks={networks} defaultNetwork="testnet">
			<WalletProvider
				theme={lightTheme}
			>
        <App />
      </WalletProvider>
		</SuiClientProvider>
	</QueryClientProvider>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
