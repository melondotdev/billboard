import React, { useState } from 'react'
import * as CiIcons from "react-icons/ci";

const Leaderboard = () => {
  const [leaderboard, setLeaderboard] = useState([
    {
      id: 0,
      user: '@suisnails',
      prize: 'Sui Snails #1000',
    }
  ])
  
  return (
    <div className='leaderboard text-base border-2 ml-4 p-2'>
      <h1 className='title text-2xl mb-2'>Leaderboard</h1>
      <div className='leaderboard-item'>
        <p className='rank font-sans'>Rank 1 - Owns: 100</p>
        <p className='flex items-center font-sans'>
          <CiIcons.CiWallet className='mr-2'/>
          0x232...24B12
        </p>
      </div>
      <div className='leaderboard-item'>
        <p className='rank font-sans'>Rank 2 - Owns: 99</p>
        <p className='flex items-center font-sans'>
          <CiIcons.CiWallet className='mr-2'/>
          0x232...24B12
        </p>
      </div>
      <div className='leaderboard-item'>
        <p className='rank font-sans'>Rank 3 - Owns: 70</p>
        <p className='flex items-center font-sans'>
          <CiIcons.CiWallet className='mr-2'/>
          0x232...24B12
        </p>
      </div>
    </div>
  )
}

export default Leaderboard
