/**
 * File: colorUtils.js
 * Description: Utility functions for color mapping and conversion
 */

// Color mapping for common color names
export const colorMap = {
  'red': '#FF0000',
  'blue': '#0000FF',
  'green': '#008000',
  'yellow': '#FFFF00',
  'orange': '#FFA500',
  'purple': '#800080',
  'pink': '#FFC0CB',
  'brown': '#A52A2A',
  'black': '#000000',
  'white': '#FFFFFF',
  'gray': '#808080',
  'grey': '#808080',
  'gold': '#FFD700',
  'golden': '#FFD700',
  'silver': '#C0C0C0',
  'beige': '#F5F5DC',
  'cream': '#FFFDD0',
  'ivory': '#FFFFF0',
  'maroon': '#800000',
  'navy': '#000080',
  'teal': '#008080',
  'olive': '#808000',
  'lime': '#00FF00',
  'aqua': '#00FFFF',
  'fuchsia': '#FF00FF',
  'turquoise': '#40E0D0',
  'lavender': '#E6E6FA',
  'peach': '#FFDAB9',
  'coral': '#FF7F50',
  'crimson': '#DC143C',
  'indigo': '#4B0082',
  'violet': '#EE82EE',
  'magenta': '#FF00FF',
  'cyan': '#00FFFF',
  'khaki': '#F0E68C',
  'tan': '#D2B48C',
  'charcoal': '#36454F',
  'burgundy': '#800020',
  'plum': '#DDA0DD',
  'rust': '#B7410E',
  'sage': '#9DC183',
  'mint': '#98FF98',
  'sky blue': '#87CEEB',
  'skyblue': '#87CEEB',
  'royal blue': '#4169E1',
  'royalblue': '#4169E1',
  'forest green': '#228B22',
  'forestgreen': '#228B22',
  'dark green': '#006400',
  'darkgreen': '#006400',
  'light blue': '#ADD8E6',
  'lightblue': '#ADD8E6',
  'dark blue': '#00008B',
  'darkblue': '#00008B',
  'light green': '#90EE90',
  'lightgreen': '#90EE90',
  'dark red': '#8B0000',
  'darkred': '#8B0000',
  'light red': '#FF6347',
  'lightred': '#FF6347',
  'dark yellow': '#DAA520',
  'darkyellow': '#DAA520',
  'light yellow': '#FFFFE0',
  'lightyellow': '#FFFFE0',
  'dark purple': '#4B0082',
  'darkpurple': '#4B0082',
  'light purple': '#D8BFD8',
  'lightpurple': '#D8BFD8',
  'dark orange': '#FF8C00',
  'darkorange': '#FF8C00',
  'light orange': '#FFB347',
  'lightorange': '#FFB347',
  'dark pink': '#C71585',
  'darkpink': '#C71585',
  'light pink': '#FFB6C1',
  'lightpink': '#FFB6C1',
  'dark brown': '#3E2723',
  'darkbrown': '#3E2723',
  'light brown': '#D2B48C',
  'lightbrown': '#D2B48C',
  'dark gray': '#A9A9A9',
  'darkgray': '#A9A9A9',
  'darkgrey': '#A9A9A9',
  'light gray': '#D3D3D3',
  'lightgray': '#D3D3D3',
  'lightgrey': '#D3D3D3',
};

/**
 * Get color hex value from color name
 * @param {string} colorName - The name of the color
 * @returns {string} The hex color code
 */
export const getColorValue = (colorName) => {
  if (!colorName) return '#CCCCCC';
  const lowerColor = colorName.toLowerCase().trim();
  return colorMap[lowerColor] || lowerColor;
};

/**
 * Parse multi-color string and return array of color values
 * @param {string} colorName - The color name (e.g., "Pink and Green", "Red/Blue")
 * @returns {string[]} Array of hex color codes
 */
export const parseMultiColor = (colorName) => {
  if (!colorName) return ['#CCCCCC'];
  
  const lowerColor = colorName.toLowerCase().trim();
  
  // Check if it's a single color in the map
  if (colorMap[lowerColor]) {
    return [colorMap[lowerColor]];
  }
  
  // Split by common separators: "and", "&", "/", "-", "with", "+"
  const colors = lowerColor
    .split(/\s+and\s+|\s*&\s*|\s*\/\s*|\s*-\s*|\s+with\s+|\s*\+\s+/)
    .map(c => c.trim())
    .filter(c => c.length > 0);
  
  if (colors.length === 0) {
    return [lowerColor];
  }
  
  // Map each color to its hex value
  return colors.map(c => colorMap[c] || c);
};

/**
 * Check if color name represents multiple colors
 * @param {string} colorName - The color name
 * @returns {boolean} True if multi-color
 */
export const isMultiColor = (colorName) => {
  if (!colorName) return false;
  const lowerColor = colorName.toLowerCase().trim();
  
  // Check if it's a single color in the map
  if (colorMap[lowerColor]) return false;
  
  // Check for multi-color separators
  return /\s+and\s+|\s*&\s*|\s*\/\s*|\s*-\s*|\s+with\s+|\s*\+\s+/.test(lowerColor);
};
