import React, { useState } from "react";
import { Link } from "react-router-dom";
import ConnectWallet from "./UserOptions/ConnectWallet";
import SuiSymbol from "../assets/sui-symbol.png";
import * as IoIcons from "react-icons/io5";
import * as MdIcons from "react-icons/md";
import Marquee from "react-fast-marquee";

const Navbar = ({ walletData, isWalletConnected }) => {
  const [disconnectionRequest, setDisconnectionRequest] = useState(false);
  const [isDisplayLeaderboard, setIsDisplayLeaderboard] = useState(false);
  
  const handleDisconnect = () => {
    setDisconnectionRequest(!disconnectionRequest);
  }
  
  const formatWalletAddress = (address) => {
    if (!address) return ''; // Return empty string if address is not provided
    const firstFour = address.substring(0, 4); // Extract first four characters
    const lastFour = address.substring(address.length - 4); // Extract last four characters
    return `${firstFour}...${lastFour}`; // Concatenate with "..." in the middle
  };
  
  return (
    <div className="navbar flex justify-between items-center h-20 font-anton bg-transparent text-white z-10">
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
      <button className="text-3xl" onClick={() => setIsDisplayLeaderboard(!isDisplayLeaderboard)}>
        <MdIcons.MdLeaderboard />
      </button>
      <Marquee className="w-full mx-16">
        Recent Purchases: @melondotdev purchased plot (3,4) for 0.1 Sui!
      </Marquee>
      <div className="navbar-right mr-4 flex min-w-36">
        {isWalletConnected && (
          <div className="wallet-details flex font-inter items-center text-base bg-transparent mt-1 cursor-pointer hover:opacity-70" onClick={handleDisconnect}>
            <img src={SuiSymbol} alt='symbol' className="h-4 w-auto mr-1"></img>
            <p className="mr-4">{(parseInt(walletData?.Balance || 0) / 1000000000).toFixed(2).toString()}</p>
            <p>{formatWalletAddress(walletData?.Address)}</p>
          </div>
        )}
        <ConnectWallet disconnectionRequest={disconnectionRequest} setDisconnectionRequest={setDisconnectionRequest} />
      </div>
    </div>
  );
};

export default Navbar;
