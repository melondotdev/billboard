import React, { useState, useEffect } from 'react';
import { IoIosCloseCircle } from "react-icons/io";

const Leaderboard = ({ setIsDisplayLeaderboard, currentOwners }) => {
  const [leaderboard, setLeaderboard] = useState([]);
  
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
      <div className="popup-bg fixed w-full h-full bg-lightbox bg-cover z-50" onClick={() => setIsDisplayLeaderboard(false)}>
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
                      <td className="px-4 py-2">{rank}</td>
                      <td className="px-4 py-2">{displayAddress}</td>
                      <td className="px-4 py-2 text-right">{count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;
