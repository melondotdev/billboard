import React, { useState, useEffect } from 'react';
import fetchBillboardData from '../Utils/fetchBillboardData';
import Pixel from './Pixel';
import rgbToHex from '../Utils/rgbToHex';

const BillboardSectionPixel = ({ selectedColor, sectionIndex, storeInitData, updateCurrentColors, lastChange, setLastChange }) => {
  const gridSize = 60 * 20; // Total pixels in a 30x20 grid
  const [colors, setColors] = useState(Array(gridSize).fill('#000')); // Initialize all pixels to black
  const [fees, setFees] = useState(Array(gridSize).fill('1000000'));
  
  // ===== Load Blockchain Data and Store It =====
  
  const [isLoading, setIsLoading] = useState(true); // State to track loading status
  
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true); // Start loading
      try {
        const data = await fetchBillboardData();
        const i = sectionIndex - 1;
        if (data[i] && data[i].pixels) {
          const currentColors = [...colors];
          const currentFees = [...fees];
          
          const nodes = data[i].pixels.flatMap((row) => 
            row.map((pixel) => ({
              owner: pixel.owner,
              color: rgbToHex(pixel.color),
              index: Number(pixel.row) * 60 + Number(pixel.col),
              fee: pixel.fee
            }))
          );
          
          nodes.forEach(node => {
            currentColors[node.index] = node.color;  // Update the color at each index
            currentFees[node.index] = node.fee; // Update the fees at each index
          });
          
          setColors(currentColors); 
          setFees(currentFees);
          storeInitData(sectionIndex, currentColors);
        }
      } catch (error) {
        console.error('Failed to load data:', error);
      } finally {
        setIsLoading(false); // End loading
      }
    };
    
    loadData();
    
    return () => setIsLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  // ===== Save Current Colors =====
  
  const handleUpdateCurrentColor = (pixelIndex, currentColor) => {
    let change = [];
    
    if (colors[pixelIndex] === currentColor) {
      return;
    } else {
      change = {sectionIndex, pixelIndex, currentColor, fee: fees[pixelIndex]};
    }
    
    updateCurrentColors(change);
  }
  
  // ===== Listen for Undo =====
  
  const [undoPixelParameters, setUndoPixelParameters] = useState();
  
  useEffect(() => {
    if (lastChange) {
      if (lastChange.sectionIndex === sectionIndex) {
        const undoIndex = lastChange.pixelIndex;
        setUndoPixelParameters({location: undoIndex});
        setLastChange({});
      }
    }
  }, [lastChange, sectionIndex, setLastChange, undoPixelParameters])
  
  return (
    <div
      style={{ display: 'grid', gridTemplateColumns: 'repeat(60, 10px)' }}
    >
      {!isLoading && colors.map((color, index) => (
        <Pixel
          key={index}
          initColor={color}
          location={index}
          undoPixelParameters={undoPixelParameters || {}}
          setUndoPixelParameters={setUndoPixelParameters}
          selectedColor={selectedColor}
          updateCurrentColor={handleUpdateCurrentColor}
        />
      ))}
      {isLoading && <div>Loading...</div>}
    </div>
  );
};

export default BillboardSectionPixel;
