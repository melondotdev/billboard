import React, { useState, useEffect } from 'react';
import BillboardSectionPixel from './BillboardSectionPixel';
import hexToRgb from '../Utils/hexToRgb';
import { 
  BILLBOARD_SECTION_1, 
  BILLBOARD_SECTION_2, 
  BILLBOARD_SECTION_3, 
  BILLBOARD_SECTION_4, 
} from '../../lib/constants';

const Billboard = ({ setConvertedChanges, selectedColor, isUndoing, setIsUndoing, setCurrentOwners, setRecentPurchases }) => {
  const sections = [BILLBOARD_SECTION_1, BILLBOARD_SECTION_2, BILLBOARD_SECTION_3, BILLBOARD_SECTION_4];
  
  // ===== Store Init Data =====
  
  const [initColors, setInitColors] = useState([]); // Array to store colors for each section
  
  const handleStoreData = (sectionIndex, colors, owners) => {
    // Update the corresponding section colors array
    setInitColors(prevColors => {
      const newColors = [...prevColors];
      // Check if the colors for the specific index are already initialized
      if (newColors[sectionIndex - 1]) {
        newColors[sectionIndex - 1] = colors;
      } else {
        // Ensure that the array is correctly initialized up to the needed index
        while (newColors.length < sectionIndex) {
          newColors.push(undefined); // Fill with undefined up to the needed index
        }
        newColors[sectionIndex - 1] = colors; // Initialize the correct index
      }
      return newColors;
    });
    
    setCurrentOwners((prevOwners) => {
      const currentOwners = [...prevOwners];
      if (currentOwners[sectionIndex - 1]) {
        currentOwners[sectionIndex - 1] = owners;
      } else {
        // Ensure that the array is correctly initialized up to the needed index
        while (currentOwners.length < sectionIndex) {
          currentOwners.push(undefined); // Fill with undefined up to the needed index
        }
        currentOwners[sectionIndex - 1] = owners; // Initialize the correct index
      }
      return currentOwners;
    })
  };
  
  // ===== Update Changes =====
  
  const [updatedChanges, setUpdatedChanges] = useState([]); // Array to store colors for each section
  
  const handleUpdateChanges = (change) => {
    if (initColors[change.sectionIndex - 1][change.pixelIndex] === change.currentColor) {
      return;
    } else {
      const sectionIndex = change.sectionIndex;
      const localRow = Math.floor(change.pixelIndex / 60);
      const localCol = change.pixelIndex % 60;
      // Convert color from hex to RGB
      const color = hexToRgb(change.currentColor);
      const fee = change.fee;
      const updatedChange = { sectionIndex, color, row: localRow, column: localCol, fee };
    
      // Correctly use setState to append to the existing array
      setUpdatedChanges(prevChanges => [...prevChanges, updatedChange]);
    }
  };
  
  useEffect(() => {
    const formatChanges = () => {
      const formattedChanges = Array.from({ length: 4 }, () => ({
        colors: [],
        rows: [],
        columns: [],
        fees: []
      }));
      
      updatedChanges.forEach(change => {
        const { sectionIndex, color, row, column, fee } = change;
        const section = formattedChanges[sectionIndex - 1];
        const existingIndex = section.rows.findIndex((r, idx) => r === row && section.columns[idx] === column);
  
        if (existingIndex !== -1) {
          // Entry with same row and column already exists, update color and fee
          section.colors[existingIndex] = color; // Update the color at the existing index
          section.fees[existingIndex] = fee;     // Update the fee at the existing index
        } else {
          // No existing entry, push the original data
          section.colors.push(color);
          section.rows.push(row);
          section.columns.push(column);
          section.fees.push(fee);
        }
      });
  
      // Flatten the arrays to have them in the required format
      const output = [];
      formattedChanges.forEach(section => {
        output.push(section.colors);
        output.push(section.rows);
        output.push(section.columns);
        output.push(section.fees);
      });
      
      return output;
    };  
    
    setConvertedChanges(formatChanges());
  }, [updatedChanges, setConvertedChanges]);
  
  // ===== undo last change =====
  
  const [lastChange, setLastChange] = useState();
  
  useEffect(() => {
    if (isUndoing) {
      if (updatedChanges.length > 0) {
        const lastChange = updatedChanges[updatedChanges.length - 1];
        
        const newChanges = updatedChanges.slice(0, -1); // Copy all items except the last one
        setUpdatedChanges(newChanges); // Update the state with the new array
        
        const pixelIndex = Number(lastChange.row) * 60 + Number(lastChange.column);
        setLastChange({
          sectionIndex: lastChange.sectionIndex,
          pixelIndex: pixelIndex,
          oldColor: lastChange.color // Assuming you want to revert to the previous color stored here
        });
      }
      setIsUndoing(false);
    }
  }, [isUndoing, setIsUndoing, updatedChanges])
  
  return (
    <div className='grid grid-cols-2 max-w-[1206px] min-w-[1206px] w-full' style={{ border: '2px solid white', padding: '1px' }}>
      {Array.from({ length: 4 }, (_, i) => (
        <BillboardSectionPixel
          key={i}
          sectionIndex={i + 1}
          section={sections[i]}
          selectedColor={selectedColor}
          lastChange={lastChange}
          setLastChange={setLastChange}
          storeInitData={handleStoreData}
          updateCurrentColors={handleUpdateChanges}
          setRecentPurchases={setRecentPurchases}
        />
      ))}
    </div>
  )
}

export default Billboard;
