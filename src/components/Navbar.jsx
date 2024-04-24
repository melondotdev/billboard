import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import ConnectWallet from "./UserOptions/ConnectWallet";
import SuiSymbol from "../assets/sui-symbol.png";
import * as IoIcons from "react-icons/io5";
import * as Fa6Icons from "react-icons/fa6";
import * as MdIcons from "react-icons/md";
import Marquee from "react-fast-marquee";

const Navbar = ({ walletData, isWalletConnected, setIsDisplayLeaderboard, setIsDisplayGuide, recentPurchases }) => {
  const [disconnectionRequest, setDisconnectionRequest] = useState(false);
  
  const handleDisconnect = () => {
    setDisconnectionRequest(!disconnectionRequest);
  }
  
  const formatWalletAddress = (address) => {
    if (!address) return ''; // Return empty string if address is not provided
    const firstFour = address.substring(0, 4); // Extract first four characters
    const lastFour = address.substring(address.length - 4); // Extract last four characters
    return `${firstFour}...${lastFour}`; // Concatenate with "..." in the middle
  };

  const formattedPurchases = useMemo(() => {
    if (recentPurchases && recentPurchases.length > 0) {
      // Sort by timestamp in descending order and slice the first three
      const sortedPurchases = recentPurchases
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        .slice(0, 3);
      
      // Format the message for display as JSX
      return sortedPurchases.map((purchase, index) => (
        <span key={index}>
          {formatWalletAddress(purchase.owner)} purchased 
          <span className="text-ssblue"> {purchase.purchaseCount}</span> pixels on {` `}
          {new Date(purchase.timestamp).toLocaleDateString("en-US", { year: 'numeric', month: 'long', day: 'numeric' })}!
          {index < sortedPurchases.length - 1 && <span>&nbsp;&nbsp;&nbsp;&nbsp;</span>}
        </span>
      ));
    }
    return 'No recent purchases.';
  }, [recentPurchases]);
  
  return (
    <div className="navbar flex justify-between items-center h-20 font-anton bg-transparent text-white z-10 max-w-[1224px]">
      <div className="navbar-left flex items-center ml-4 text-3xl">
        <a
          href="https://www.suisnails.io"
          target="_blank"
          rel="noopener noreferrer"
          className="nav-menu-item ease-in-out duration-300 hover:text-ssblue"
        >
          <IoIcons.IoHomeOutline />
        </a>
        <Link to="/">
          <div className="navbar-left flex items-center mx-4 text-3xl">
            <span className="text-white">BILL</span>
            <span className="text-ssblue">BOARD</span>
          </div>
        </Link>
      </div>
      <div className="text-3xl hover:text-ssblue cursor-pointer mr-2" onClick={() => setIsDisplayLeaderboard(true)}>
        <MdIcons.MdLeaderboard />
      </div>
      <div className="text-2xl hover:text-ssblue cursor-pointer" onClick={() => setIsDisplayGuide(true)}>
        <Fa6Icons.FaRegCircleQuestion />
      </div>
      <Marquee className="w-full mx-12 z-0 font-sans" speed='25'>
        Recent Purchases: <span>&nbsp;&nbsp;&nbsp;&nbsp;</span> {formattedPurchases} <span>&nbsp;&nbsp;&nbsp;&nbsp;</span>
      </Marquee>
      <div className="navbar-right mr-4 flex">
        {isWalletConnected && (
          <>
            {/* <div className="mr-4 flex items-center justify-center">
              Rank
            </div> */}
            <div className="wallet-details flex font-inter items-center text-base bg-transparent cursor-pointer hover:text-ssblue" onClick={handleDisconnect}>
              <img src={SuiSymbol} alt='symbol' className="h-4 w-auto mr-1"></img>
              <p className="mr-4">{(parseInt(walletData?.Balance || 0) / 1000000000).toFixed(2).toString()}</p>
              <p>{formatWalletAddress(walletData?.Address)}</p>
            </div>
          </>
        )}
        <ConnectWallet disconnectionRequest={disconnectionRequest} setDisconnectionRequest={setDisconnectionRequest} />
      </div>
    </div>
  );
};

export default Navbar;
