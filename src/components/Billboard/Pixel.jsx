import React, { useState } from "react";

import "./styles.css";

const Pixel = ({ initColor, location, selectedColor, updateCurrentColor }) => {
  const [color, setColor] = useState(initColor);
  
  const changeColor = (e) => {
    // check for right click
    if (e.buttons === 2) {
      
    } else {
      setColor(selectedColor);
      updateCurrentColor(location, selectedColor);
    }
  }
  
  const changeColorDraw = (e) => {
    if (e.buttons === 1 || e.buttons === 3) {
      setColor(selectedColor);
      updateCurrentColor(location, selectedColor);
    }
  }
  
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
