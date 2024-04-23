import React, { useState, useEffect } from 'react';
import fetchBillboardData from '../Utils/fetchBillboardData';
import Pixel from './Pixel';
import rgbToHex from '../Utils/rgbToHex';

const BillboardSectionPixel = ({ selectedColor, sectionIndex, storeInitData, updateCurrentColors }) => {
  const gridSize = 60 * 20; // Total pixels in a 30x20 grid
  const [colors, setColors] = useState(Array(gridSize).fill('#000')); // Initialize all pixels to black
  
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
          const nodes = data[i].pixels.flatMap((row) => 
            row.map((pixel) => ({
              owner: pixel.owner,
              color: rgbToHex(pixel.color),
              index: Number(pixel.row) * 60 + Number(pixel.col),
              fee: pixel.fee
            }))
          );
          
          // Update the colors based on fetched data
          nodes.forEach(node => {
            currentColors[node.index] = node.color;  // Update the color at each index
          });
          
          setColors(currentColors);  // Update the state with the new color data
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
      change = {sectionIndex, pixelIndex, currentColor};
    }
    
    updateCurrentColors(change);
  }
  
  return (
    <div
      style={{ display: 'grid', gridTemplateColumns: 'repeat(60, 10px)' }}
    >
      {!isLoading && colors.map((color, index) => (
        <Pixel
          key={index}
          initColor={color}
          location={index}
          selectedColor={selectedColor}
          updateCurrentColor={handleUpdateCurrentColor}
        />
      ))}
      {isLoading && <div>Loading...</div>}
    </div>
  );
};

export default BillboardSectionPixel;
