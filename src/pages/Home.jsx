import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useCurrentWallet, useSignAndExecuteTransactionBlock } from '@mysten/dapp-kit';
import { TransactionBlock } from '@mysten/sui.js/transactions';
// import { useMediaQuery } from 'react-responsive';
import { Tooltip } from 'react-tooltip'
import SuccessMessage from '../components/Utils/SuccessMessage';
import Navbar from '../components/Navbar';
import fetchWalletData from '../components/Utils/FetchWalletData';
import Billboard from '../components/Billboard/Billboard';
import InfoBox from '../components/InfoBox/InfoBox';
import LoadingSnail from '../assets/loading_snail.gif';
import { 
  BILLBOARD_SECTION_1, 
  BILLBOARD_SECTION_1_GAME, 
  BILLBOARD_SECTION_1_MAINTAINER, 
  BILLBOARD_SECTION_2, 
  BILLBOARD_SECTION_2_GAME, 
  BILLBOARD_SECTION_2_MAINTAINER, 
  BILLBOARD_SECTION_3, 
  BILLBOARD_SECTION_3_GAME, 
  BILLBOARD_SECTION_3_MAINTAINER, 
  BILLBOARD_SECTION_4, 
  BILLBOARD_SECTION_4_GAME,
  BILLBOARD_SECTION_4_MAINTAINER,
} from '../lib/constants';
import Leaderboard from '../components/Leaderboard';

const Home = () => {
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [walletData, setWalletData] = useState({});
  const [selectedColor, setSelectedColor] = useState('#000000');
  const [isUndoing, setIsUndoing] = useState(false);
  
  // ===== Media Queries =====
  
  // const isMobile = useMediaQuery({ query: '(max-width: 900px)' });
  
  // ===== Listener for wallet connection status =====
  
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

  // ===== Fetch Data from Billboard, then Sign & Execute Tx =====

  const [convertedChanges, setConvertedChanges] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [txId, setTxId] = useState('');
  const { mutate: signAndExecuteTransactionBlock } = useSignAndExecuteTransactionBlock();
  
  const saveColors = (e) => {
    e.preventDefault();
    purchasePixels(convertedChanges);
  }
  
  const purchasePixels = useCallback(async (convertedChanges) => {
    if (connectionStatus === 'disconnected') return;
    
    setIsLoading(true); 
    console.log(convertedChanges);

    // Initialize globalTotalFee to 0
    let globalTotalFee = 0;
    
    // Calculate total fees across all sections
    for (let i = 0; i < 4; i++) {
      const baseIndex = i * 4;
      const fees = convertedChanges[baseIndex + 3];
      
      // Check if fees is defined and is an array
      if (Array.isArray(fees)) {
        const sectionTotalFee = fees.reduce((acc, fee) => {
          // Parse fee as a float or integer, depending on expected input
          return acc + Number(fee);
        }, 0);
        globalTotalFee += sectionTotalFee;
      }
    }

    // If no fees are needed, log and return immediately
    if (globalTotalFee === 0) {
      console.log("No changes to process, returning...");
      setIsLoading(false);
      return;
    }

    try {
      const transactionBlock = new TransactionBlock();
  
      // Dynamic mapping of sections to their respective targets and objects
      const sectionConfigs = [
        { target: `${BILLBOARD_SECTION_1}::billboard_game::take_action`, object: BILLBOARD_SECTION_1_GAME, maintainer: BILLBOARD_SECTION_1_MAINTAINER },
        { target: `${BILLBOARD_SECTION_2}::billboard_game::take_action`, object: BILLBOARD_SECTION_2_GAME, maintainer: BILLBOARD_SECTION_2_MAINTAINER },
        { target: `${BILLBOARD_SECTION_3}::billboard_game::take_action`, object: BILLBOARD_SECTION_3_GAME, maintainer: BILLBOARD_SECTION_3_MAINTAINER },
        { target: `${BILLBOARD_SECTION_4}::billboard_game::take_action`, object: BILLBOARD_SECTION_4_GAME, maintainer: BILLBOARD_SECTION_4_MAINTAINER },
      ];
  
      // Assume each section's data in convertedChanges is structured as 3 arrays per section
      for (let i = 0; i < 4; i++) { // For each section
        const baseIndex = i * 4;
        const colors = convertedChanges[baseIndex];
        const rows = convertedChanges[baseIndex + 1];
        const columns = convertedChanges[baseIndex + 2];
        const fees = convertedChanges[baseIndex + 3];
      
        // Check if fees is defined and is an array
        if (Array.isArray(fees) && fees.length > 0) {
          const totalFee = fees.reduce((acc, fee) => acc + Number(fee), 0);

          if (totalFee > 0 && colors.length > 0) {
            const payment = transactionBlock.splitCoins(
              transactionBlock.gas,
              [transactionBlock.pure(totalFee)]
            );
            const coinVec = transactionBlock.makeMoveVec({ objects: [payment] });
            
            const { target, object, maintainer } = sectionConfigs[i];
            transactionBlock.moveCall({
              target: target,
              typeArguments: [],
              arguments: [
                transactionBlock.object(object),
                transactionBlock.pure(colors),
                transactionBlock.pure(rows),
                transactionBlock.pure(columns),
                transactionBlock.pure(colors.length),
                transactionBlock.pure(maintainer),
                coinVec,
              ]
            });
          }
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
  
  // ===== Undo Color Change =====
  
  const undoChange = () => {
    setIsUndoing(true);
  }

  // ===== Leaderboard =====
  
  const [isDisplayLeaderboard, setIsDisplayLeaderboard] = useState(false);
  const [currentOwners, setCurrentOwners] = useState([]); // Array to store owners for each section
 
  // ===== Marquee =====
  
  const [recentPurchases, setRecentPurchases] = useState([]);
  
  const saveRecentPurchases = (events) => {
    setRecentPurchases(prevPurchases => [...prevPurchases, events]); // Use a callback to access the most current state
  }  
  
  // ===== Guide =====
  
  const [isDisplayGuide, setIsDisplayGuide] = useState(false);
  
  return (
    <div className='home w-screen h-screen font-anton bg-cover bg-top text-white bg-no-repeat bg-darkblue overflow-y-auto'>
      <Navbar 
        walletData={walletData} 
        isWalletConnected={isWalletConnected} 
        setIsDisplayLeaderboard={setIsDisplayLeaderboard} 
        setIsDisplayGuide={setIsDisplayGuide} 
        recentPurchases={recentPurchases}
      />
      {isDisplayLeaderboard && (
        <Leaderboard 
          setIsDisplayLeaderboard={setIsDisplayLeaderboard} 
          currentOwners={currentOwners} 
        />
      )}
      {isDisplayGuide && (
        <div className="popup fixed top-0 left-0 w-full h-full text-white">
          <div className="popup-bg fixed w-full h-full bg-lightbox bg-cover z-50 justify-center items-center" onClick={() => setIsDisplayGuide(false)}>
            <div className='flex h-full w-full justify-center items-center'>
              <img src={LoadingSnail} alt='loading'></img>
            </div>
          </div>
        </div>
      )}
      {/* {!isMobile ? ( */}
        <>
          <div className='body w-screen flex mt-2 px-4 z-0'>
            <Billboard 
              setConvertedChanges={setConvertedChanges} 
              selectedColor={selectedColor} 
              isUndoing={isUndoing} 
              setIsUndoing={setIsUndoing}
              setCurrentOwners={setCurrentOwners}
              setRecentPurchases={saveRecentPurchases}
            />
          </div>
          {isLoading ? (
            <div className="popup fixed top-0 left-0 w-full h-full text-white">
              <div className="popup-bg fixed w-full h-full bg-lightbox bg-cover z-50 justify-center items-center" onClick={() => setIsLoading(false)}>
                <div className='flex h-full w-full justify-center items-center'>
                  <img src={LoadingSnail} alt='loading'></img>
                </div>
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
          <div className='info-bar w-full flex justify-between items-center max-w-[1214px]'>
            <div 
              className={`left-side flex items-end ${!isWalletConnected && 'opacity-50'}`}
              data-tooltip-id="connect-first" 
              data-tooltip-content="You have to connect your wallet first!"
            >
              <input
                type="color"
                value={selectedColor}
                disabled={!isWalletConnected} 
                onChange={(e) => setSelectedColor(e.target.value)}
                className={`select-color mt-4 col-span-2 mx-4 ${isWalletConnected && 'cursor-pointer hover:bg-ssblue'}`}
              />
              <button 
                onClick={undoChange} 
                disabled={!isWalletConnected} 
                style={{ marginTop: '10px' }}
                data-tooltip-id="connect-first" 
                data-tooltip-content="You have to connect your wallet first!"
                className={`mt-4 mr-4 ${isWalletConnected && 'cursor-pointer hover:text-ssblue'}`}
              >
                Undo
              </button>
            </div>
            <div 
              className={`right-side flex items-center ${!isWalletConnected && 'opacity-50'}`}
              data-tooltip-id="connect-first" 
              data-tooltip-content="You have to connect your wallet first!"
            > 
              <InfoBox convertedChanges={convertedChanges} isWalletConnected={isWalletConnected} />
              <button 
                onClick={saveColors} 
                disabled={!isWalletConnected} 
                className={`ml-8 mt-4 border-2 bg-ssblue ${isWalletConnected && 'hover:bg-transparent hover:border-ssblue cursor-pointer'} py-1 px-4`}
              >       
                Purchase Tiles
              </button>
            </div>
            {!isWalletConnected && 
              <Tooltip id="connect-first" place="top" effect="solid" className="font-sans z-50" />
            }
          </div>
        </>
      {/* ) : (
        <>
          <div className='body w-screen flex mt-2 px-4 z-0'>
            <Billboard setConvertedChanges={setConvertedChanges} selectedColor={selectedColor} isUndoing={isUndoing} setIsUndoing={setIsUndoing} />
          </div>
          {isLoading ? (
            <div className="popup fixed top-0 left-0 w-full h-full text-white">
              <div className="popup-bg fixed w-full h-full bg-lightbox bg-cover z-50 justify-center items-center" onClick={() => setIsLoading(false)}>
                <div className='flex h-full w-full justify-center items-center'>
                  <img src={LoadingSnail} alt='loading'></img>
                </div>
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
          <div className='info-bar w-full flex justify-between items-center max-w-[1214px]'>
            <div 
              className={`left-side flex items-end ${!isWalletConnected ? 'opacity-50' : ''}`}
              data-tooltip-id="connect-first" 
              data-tooltip-content="You have to connect your wallet first!"
            >
              <input
                type="color"
                value={selectedColor}
                disabled={!isWalletConnected} 
                onChange={(e) => setSelectedColor(e.target.value)}
                className={`select-color mt-4 col-span-2 mx-4 ${!isWalletConnected ? '' : 'cursor-pointer hover:opacity-70'}`}
              />
              <button 
                onClick={undoChange} 
                disabled={!isWalletConnected} 
                style={{ marginTop: '10px' }}
                data-tooltip-id="connect-first" 
                data-tooltip-content="You have to connect your wallet first!"
                className={`mt-4 mr-4 ${!isWalletConnected ? '' : 'cursor-pointer hover:opacity-70'}`}
              >
                Undo
              </button>
            </div>
            <div 
              className={`right-side flex items-center ${!isWalletConnected ? 'opacity-50' : ''}`}
              data-tooltip-id="connect-first" 
              data-tooltip-content="You have to connect your wallet first!"
            > 
              <InfoBox convertedChanges={convertedChanges} isWalletConnected={isWalletConnected} />
              <button 
                onClick={saveColors} 
                disabled={!isWalletConnected} 
                className={`ml-8 mt-4 border-2 bg-ssblue ${!isWalletConnected ? '' : 'hover:bg-transparent hover:border-ssblue cursor-pointer'} py-1 px-4`}
              >       
                Purchase Tiles
              </button>
            </div>
            {!isWalletConnected && 
              <Tooltip id="connect-first" place="top" effect="solid" className="font-sans z-50" />
            }
          </div>
        </>
      )} */}
    </div>
  )
}

export default Home;