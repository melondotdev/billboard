import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useCurrentWallet, useSignAndExecuteTransactionBlock } from '@mysten/dapp-kit';
import { TransactionBlock } from '@mysten/sui.js/transactions';
import { useMediaQuery } from 'react-responsive';
import { Tooltip } from 'react-tooltip'
import SuccessMessage from '../components/Utils/SuccessMessage';
import Navbar from '../components/Navbar';
import fetchWalletData from '../components/Utils/FetchWalletData';
import Billboard from '../components/Billboard/Billboard';
import InfoBox from '../components/InfoBox/InfoBox';
import { 
  BILLBOARD_SECTION_1, 
  BILLBOARD_SECTION_1_GAME, 
  BILLBOARD_SECTION_2, 
  BILLBOARD_SECTION_2_GAME, 
  BILLBOARD_SECTION_3, 
  BILLBOARD_SECTION_3_GAME, 
  BILLBOARD_SECTION_4, 
  BILLBOARD_SECTION_4_GAME
} from '../lib/constants';

const Home = () => {
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [walletData, setWalletData] = useState({});
  const [selectedColor, setSelectedColor] = useState('#000000');
  
  // ===== Media Queries =====
  
  const isMobile = useMediaQuery({ query: '(max-width: 900px)' });
  
  // Listener for wallet connection status
  
  const { currentWallet, connectionStatus } = useCurrentWallet();
  
  const hasFetchedRef = useRef(false);
  
  useEffect(() => {
    const checkWalletConnectionStatus = async () => {
      if (connectionStatus === 'connected') {
        if (!hasFetchedRef.current) {
          setIsWalletConnected(true);
          try {
            const walletDataSnapshot = await fetchWalletData(currentWallet.accounts[0].address);
            setWalletData(walletDataSnapshot);
            hasFetchedRef.current = true;  // Set ref to true after fetching data
            console.log('wallet connected');
          } catch (error) {
            console.log(error);
          }
        }
      } else {
        setIsWalletConnected(false);
        hasFetchedRef.current = false;  // Reset ref when disconnected
      } 
    };
  
    checkWalletConnectionStatus();

    // Introduce a way to periodically check the connection status
    const intervalId = setInterval(checkWalletConnectionStatus, 10000); // check every 10 seconds
  
    return () => clearInterval(intervalId); // Cleanup interval on component unmount
  }, [connectionStatus, currentWallet]);
  
  // ===== Listener for billboard modifications =====
  
  const [isLoading, setIsLoading] = useState(false);
  const [txId, setTxId] = useState('');
  const { mutate: signAndExecuteTransactionBlock } = useSignAndExecuteTransactionBlock();
  const [convertedChanges, setConvertedChanges] = useState([]);
  
  const saveColors = (e) => {
    e.preventDefault();
    console.log(convertedChanges);
    purchasePixels(convertedChanges);
  }
  
  const purchasePixels = useCallback(async (convertedChanges) => {
    if (connectionStatus === 'disconnected') return;
    
    setIsLoading(true); // Set loading state
  
    try {
      const transactionBlock = new TransactionBlock();
  
      // Dynamic mapping of sections to their respective targets and objects
      const sectionConfigs = [
        { target: `${BILLBOARD_SECTION_1}::billboard_game::take_action`, object: BILLBOARD_SECTION_1_GAME },
        { target: `${BILLBOARD_SECTION_2}::billboard_game::take_action`, object: BILLBOARD_SECTION_2_GAME },
        { target: `${BILLBOARD_SECTION_3}::billboard_game::take_action`, object: BILLBOARD_SECTION_3_GAME },
        { target: `${BILLBOARD_SECTION_4}::billboard_game::take_action`, object: BILLBOARD_SECTION_4_GAME },
      ];
  
      // Assume each section's data in convertedChanges is structured as 3 arrays per section
      for (let i = 0; i < 4; i++) { // For each section
        const baseIndex = i * 3;
        const colors = convertedChanges[baseIndex];
        const rows = convertedChanges[baseIndex + 1];
        const columns = convertedChanges[baseIndex + 2];
  
        // Only create a moveCall if the section has changes
        if (colors.length > 0) {
          const { target, object } = sectionConfigs[i];
          transactionBlock.moveCall({
            target: target,
            typeArguments: [],
            arguments: [
              transactionBlock.object(object),
              transactionBlock.pure(colors),
              transactionBlock.pure(rows),
              transactionBlock.pure(columns),
              transactionBlock.pure(colors.length), // Number of changes in this section
            ]
          });
        }
      }
  
      signAndExecuteTransactionBlock(
        {
          transactionBlock,
          chain: 'sui:testnet',
        },
        {
          onSuccess: (result) => {
            console.log('executed transaction block', result);
            setTxId(result.digest);
            setConvertedChanges([]);
            setIsLoading(false);
          },
          onError: error => {
            console.log('error', error);
            setIsLoading(false);
          },
        },
      );
    } catch (error) {
      console.log(error);
    }
  }, [connectionStatus, setIsLoading, setTxId, signAndExecuteTransactionBlock]);

  const reset = useCallback(() => {
    setTxId(undefined)
  }, [])
  
  useEffect(() => {
    reset()
  }, [reset])
  
  return (
    <div className='home w-screen h-screen font-anton bg-cover bg-top text-white bg-no-repeat bg-darkblue overflow-y-auto'>
      <Navbar walletData={walletData} isWalletConnected={isWalletConnected} />
      {!isMobile ? (
        <>
          <div className='body w-screen flex items-stretch mt-2 px-4 z-0'>
            <div className='billboard'>
              <Billboard setConvertedChanges={setConvertedChanges} selectedColor={selectedColor} setSelectedColor={setSelectedColor} />
            </div>
            <div className='side-bar'> 
              <InfoBox convertedChanges={convertedChanges} />
            </div>
          </div>
          {isLoading ? (
            <div className="popup fixed top-0 left-0 w-full h-full text-white">
              <div className="popup-bg fixed w-full h-full bg-lightbox bg-cover z-50" onClick={() => setIsLoading(false)}>
                <div className='text-6xl text-center flex h-full justify-center items-center'>Loading...</div>
              </div>
            </div>
          ) : (
            <>
              {txId && (
                <SuccessMessage reset={reset}>
                  <a 
                    href={`https://suiscan.xyz/testnet/tx/${txId}`}
                    target="_blank" 
                    rel="noreferrer"
                    className='underline font-blue-600' 
                  >
                    View your transaction on Sui Scan
                  </a>
                </SuccessMessage>
              )}
            </>
          )}
          <input
            type="color"
            value={selectedColor}
            disabled={connectionStatus === 'disconnected'} 
            data-tooltip-id="connect-first" 
            data-tooltip-content="You have to connect your wallet first!"
            onChange={(e) => setSelectedColor(e.target.value)}
            className={`select-color mt-4 col-span-2 mx-4 ${connectionStatus === 'disconnected' ? '' : 'cursor-pointer hover:opacity-70'}`}
          />
          <button 
            onClick={saveColors} 
            disabled={connectionStatus === 'disconnected'} 
            data-tooltip-id="connect-first" 
            data-tooltip-content="You have to connect your wallet first!"
            className={`mt-4 ${connectionStatus === 'disconnected' ? 'opacity-50' : 'cursor-pointer hover:opacity-70'}`}
          >       
            Save Changes
          </button>   
          {connectionStatus === 'disconnected' && 
            <Tooltip id="connect-first" place="top" effect="solid" className="font-sans z-50" />
          }
        </>
      ) : (
        <>
          <div className='body w-screen flex items-stretch mt-2 px-4'>
            <div className='billboard'>
              <Billboard setConvertedChanges={setConvertedChanges} selectedColor={selectedColor} setSelectedColor={setSelectedColor} />
            </div>
            <div className='side-bar'> 
              <InfoBox convertedChanges={convertedChanges} />
            </div>
          </div>    
          {isLoading ? (
            <div className="popup fixed top-0 left-0 z-10 w-full h-full text-white">
              <div className="popup-bg fixed w-full h-full bg-lightbox bg-cover z-10" onClick={() => setIsLoading(false)}>
                <div className='text-6xl text-center flex h-full justify-center items-center'>Loading...</div>
              </div>
            </div>
          ) : (
            <>
              {txId && (
                <SuccessMessage reset={reset}>
                  <a 
                    href={`https://suiscan.xyz/testnet/tx/${txId}`}
                    target="_blank" 
                    rel="noreferrer"
                    className='underline font-blue-600' 
                  >
                    View your transaction on Sui Scan
                  </a>
                </SuccessMessage>
              )}
            </>
          )}
          <input
            type="color"
            value={selectedColor}
            onChange={(e) => setSelectedColor(e.target.value)}
            className='select-color mt-4 col-span-2 mx-4'
          />
          <button 
            onClick={saveColors} 
            disabled={connectionStatus === 'disconnected'} 
            style={{ marginTop: '10px' }}
            data-tooltip-id="connect-first" 
            data-tooltip-content="You have to connect your wallet first!"
          >
            Save Changes
          </button>
          {connectionStatus === 'disconnected' && 
            <Tooltip id="connect-first" place="top" effect="solid" className="font-sans" />
          }
        </>
      )}
    </div>
  )
}

export default Home;