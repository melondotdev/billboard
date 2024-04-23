import React, { useState, useEffect } from "react";

const Pixel = ({ initColor, location, selectedColor, updateCurrentColor, undoPixelParameters }) => {
  const [color, setColor] = useState(initColor);
  const [colorChangeHistory, setColorChangeHistory] = useState([])
  
  useEffect(() => {
    // This will log the color change history every time it updates
    if (undoPixelParameters.location === location) {
      const undoneHistory = colorChangeHistory.pop();
      setColor(undoneHistory);
    }
  }, [undoPixelParameters, location, colorChangeHistory]); // Dependency array includes colorChangeHistory
  
  const changeColor = (e) => {
    // Check for right click
    if (e.buttons === 2) {
      // Handle right-click if necessary
    } else {
      updateColor(selectedColor);
    }
  };
  
  const changeColorDraw = (e) => {
    if (e.buttons === 1 || e.buttons === 3) { // Left click or both buttons
      updateColor(selectedColor);
    }
  };
  
  // Unified function to update color
  const updateColor = (newColor) => {
    const oldColor = color;
    if (newColor !== oldColor) { // Only change color if it is different from the current color
      setColor(newColor);
      setColorChangeHistory(prevState => [...prevState, oldColor]); // Add the old color to history
      updateCurrentColor(location, newColor, oldColor);
    }
  };

  const pixelStyle = {
    backgroundColor: color,
    border: '1px dotted rgba(0, 145, 255, 0.25)',
    width: '10px',
    height: '10px',
    cursor: 'pointer'
  };
    
  return (
    <>
      <div
        id="pixel"
        location={location}
        color={color}
        style={pixelStyle}
        onMouseDown={changeColor}
        onMouseEnter={changeColorDraw}
      />
    </>
  );
}

export default Pixel;
