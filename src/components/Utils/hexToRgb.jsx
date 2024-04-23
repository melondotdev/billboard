const hexToRgb = (hex) => {
  // Remove the hash at the beginning if it's there
  hex = hex.replace(/^#/, '');
  // Parse the hex color
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  return [r, g, b];
};

export default hexToRgb;