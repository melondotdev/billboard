import React, { useState, useEffect } from 'react';
import BillboardSectionPixel from './BillboardSectionPixel';
import hexToRgb from '../Utils/hexToRgb';

const Billboard = ({ setConvertedChanges, selectedColor, isUndoing, setIsUndoing }) => {
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
      const updatedChange = { sectionIndex, color, row: localRow, column: localCol };
    
      // Correctly use setState to append to the existing array
      setUpdatedChanges(prevChanges => [...prevChanges, updatedChange]);
    }
  };
  
  useEffect(() => {
    const formatChanges = () => {
      const formattedChanges = Array.from({ length: 4 }, () => ({
        colors: [],
        rows: [],
        columns: []
      }));
      
      updatedChanges.forEach(change => {
        const { sectionIndex, color, row, column } = change;
        formattedChanges[sectionIndex - 1].colors.push(color);
        formattedChanges[sectionIndex - 1].rows.push(row);
        formattedChanges[sectionIndex - 1].columns.push(column);
      });

      // Flatten the arrays to have them in the required format
      const output = [];
      formattedChanges.forEach(section => {
        output.push(section.colors);
        output.push(section.rows);
        output.push(section.columns);
      });
      
      return output;
    };
    
    setConvertedChanges(formatChanges());
  }, [updatedChanges, setConvertedChanges]);
  
  // ===== Store Init Data =====
  const [initColors, setInitColors] = useState([]); // Array to store colors for each section
  
  const handleStoreData = (sectionIndex, colors) => {
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
  };
  
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
    <div className='grid grid-cols-2 max-w-[1204px] w-full border-2 border-white' style={{ minWidth: '1204px' }}>
      {Array.from({ length: 4 }, (_, i) => (
        <BillboardSectionPixel
          key={i}
          sectionIndex={i + 1}
          selectedColor={selectedColor}
          lastChange={lastChange}
          setLastChange={setLastChange}
          storeInitData={handleStoreData}
          updateCurrentColors={handleUpdateChanges}
        />
      ))}
    </div>
  )
}

export default Billboard;
