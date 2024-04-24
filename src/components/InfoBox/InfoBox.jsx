import React, { useState, useEffect } from 'react';
import { Tooltip } from 'react-tooltip';
import { IoIosCloseCircle } from "react-icons/io";

const InfoBox = ({ convertedChanges, isWalletConnected }) => {
  const [purchaseCount, setPurchaseCount] = useState(0);
  const [purchasePrice, setPurchasePrice] = useState(0);
  const [isOpenPriceList, setIsOpenPriceList] = useState(false);
  const [rowsAndPrices, setRowsAndPrices] = useState([]);

  useEffect(() => {
    const rowIndices = [1, 5, 9, 13];
    const colIndices = [2, 6, 10, 14];
    const feeIndices = [3, 7, 11, 15];

    const data = rowIndices.map((rowIndex, i) => {
      const rows = convertedChanges[rowIndex] || [];
      const cols = convertedChanges[colIndices[i]] || [];
      const fees = convertedChanges[feeIndices[i]] || [];

      return rows.map((row, index) => ({
        row: row,
        col: cols[index],
        price: parseFloat(fees[index]) / 1000000000 // Direct conversion to float and adjustment
      }));
    }).flat();

    // Sort the entries by price in descending order
    const sortedData = data.sort((a, b) => b.price - a.price);

    setRowsAndPrices(sortedData);
    setPurchaseCount(sortedData.length);
    setPurchasePrice(sortedData.reduce((acc, entry) => acc + entry.price, 0).toFixed(3));
  }, [convertedChanges]);
  
  return (
    <div className='flex mt-4 flex-row items-center'>
      <h1 className='mr-4'>Pixels Selected: {purchaseCount}</h1>
      <h1
        className={`border-b-2 border-ssblue text-ssblue border-solid ${isWalletConnected && ('hover:text-white hover:border-white cursor-pointer')}`}
        data-tooltip-id="cost"
        data-tooltip-content="*Price doesn't include transaction fees"
        onClick={() => setIsOpenPriceList(true)}
      >
        Total Price (SUI): {purchasePrice}*
      </h1>
      {isWalletConnected && 
        <Tooltip id="cost" place="top" effect="solid" className="font-sans z-50" />
      }
      {isOpenPriceList && (
        <div className="popup fixed top-0 left-0 w-full h-full text-white">
          <div className="popup-bg fixed w-full h-full bg-lightbox bg-cover z-50" onClick={() => setIsOpenPriceList(false)}>
            <div className='popup-container w-full h-full flex justify-center items-center'>
              <div className='popup-box-container relative w-96 h-96 bg-darkblue overflow-y-auto'>
                <div className='close-popup absolute top-0 right-0 text-3xl text-white p-2 cursor-pointer hover:opacity-70'>
                  <IoIosCloseCircle onClick={() => setIsOpenPriceList(false)} />
                </div>
                <div className='purchases overflow-y-scroll p-4'>
                  <table className='w-full text-white text-left font-sans'>
                    <thead>
                      <tr>
                        <th className="px-4 py-2 text-left">Row</th>
                        <th className="px-4 py-2 text-left">Column</th>
                        <th className="px-4 py-2 text-right">Price (SUI)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rowsAndPrices.map((item, index) => (
                        <tr key={index}>
                          <td className="px-4 py-2">{item.row}</td>
                          <td className="px-4 py-2">{item.col}</td>
                          <td className="px-4 py-2 text-right">{item.price.toFixed(3)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default InfoBox;
