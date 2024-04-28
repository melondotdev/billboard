import React, { useState, useEffect } from 'react';
import { IoIosCloseCircle } from "react-icons/io";
import { Tooltip } from 'react-tooltip';
import diamondBadge from '../assets/badges/diamond-transparent.png';
import platinumBadge from '../assets/badges/platinum-transparent.png';
import goldBadge from '../assets/badges/gold-transparent.png';
import silverBadge from '../assets/badges/silver-transparent.png';
import bronzeBadge from '../assets/badges/bronze-transparent.png';
import ironBadge from '../assets/badges/iron-transparent.png';
import copperBadge from '../assets/badges/copper-transparent.png';
import woodBadge from '../assets/badges/wood-transparent.png';

const Leaderboard = ({ setIsDisplayLeaderboard, currentOwners }) => {
  const [leaderboard, setLeaderboard] = useState([]);
  
  const getBadge = (count) => {
    if (count >= 480) return diamondBadge;
    if (count >= 240) return platinumBadge;
    if (count >= 120) return goldBadge;
    if (count >= 60) return silverBadge;
    if (count >= 30) return bronzeBadge;
    if (count >= 10) return ironBadge;
    if (count >= 5) return copperBadge;
    if (count >= 1) return woodBadge;
    return null;
  }
  
  const getBadgeName = (count) => {
    if (count >= 480) return 'Diamond';
    if (count >= 240) return 'Platinum';
    if (count >= 120) return 'Gold';
    if (count >= 60) return 'Silver';
    if (count >= 30) return 'Bronze';
    if (count >= 10) return 'Iron';
    if (count >= 5) return 'Copper';
    if (count >= 1) return 'Wood';
    return null;
  }
  
  useEffect(() => {
    const countPixels = () => {
      const addressCount = {};
      const ignoreAddress = '0xdc9d3855fb66bb34abcd4c18338bca6c568b7beaf3870c5dd3f9d3441c2cf11d';
      
      currentOwners.forEach(node => {
        node.forEach(address => {
          if (address !== ignoreAddress) {
            addressCount[address] = (addressCount[address] || 0) + 1;
          }
        });
      });

      const sortedAddresses = Object.entries(addressCount).sort((a, b) => b[1] - a[1]);
      return sortedAddresses.map(([address, count], index) => ({
        rank: index + 1,
        address,
        count,
        displayAddress: `${address.slice(0, 4)}...${address.slice(-4)}`
      }));
    };
    
    setLeaderboard(countPixels());
  }, [currentOwners]);

  return (
    <div className="popup fixed top-0 left-0 w-full h-full text-white">
      <div className="popup-bg fixed w-full h-full bg-lightbox bg-cover z-30" onClick={() => setIsDisplayLeaderboard(false)}>
        <div className='popup-container w-full h-full flex justify-center items-center'>
          <div className='popup-box-container relative w-96 h-96 bg-darkblue overflow-y-auto'>
            <div className='close-popup absolute top-0 right-0 text-3xl text-white p-2 cursor-pointer hover:opacity-70'>
              <IoIosCloseCircle onClick={() => setIsDisplayLeaderboard(false)} />
            </div>
            <div className='purchases overflow-y-scroll p-4'>
              <table className='w-full text-white text-left font-sans'>
                <thead>
                  <tr>
                    <th className="px-4 py-2 text-left">Rank</th>
                    <th className="px-4 py-2 text-left">Owner</th>
                    <th className="px-4 py-2 text-right">Pixels Owned</th>
                  </tr>
                </thead>
                <tbody>
                  {leaderboard.map(({ rank, displayAddress, count }) => (
                    <tr key={rank}>
                      <td className="px-4 py-2 flex items-center">
                        <img 
                          src={getBadge(count)} 
                          alt="badge" 
                          style={{ width: '20px', marginRight: '8px' }} 
                          data-tooltip-id="rank" 
                          data-tooltip-content={getBadgeName(count)}
                        />
                        {rank}
                      </td>
                      <td className="px-4 py-2">{displayAddress}</td>
                      <td className="px-4 py-2 text-right">{count}</td>
                    </tr>
                  ))}
                </tbody>
                <Tooltip id="rank" place="top" effect="solid" className="font-sans z-50" />
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );  
};

export default Leaderboard;
