const fetchWalletData = async (currentWallet) => {
  if (!currentWallet) return []; // Return an empty array if wallet is not available
  
  let queryBalance =
    `query {
      owner (address: "${currentWallet}") {
        balance {
          totalBalance
        }
      }
    }`;
  
  try {
    const response1 = await fetch("https://sui-testnet.mystenlabs.com/graphql", {
      method: "POST",
      body: JSON.stringify({ query: queryBalance }),
    });
    
    const jsonData1 = await response1.json();
    const suiBalance = jsonData1.data.owner.balance.totalBalance;
    
    const walletDataArray = {
      Address: currentWallet,
      Balance: suiBalance,
    };

    return walletDataArray;
  } catch (error) {
    console.log(error);
  }
};

export default fetchWalletData;
