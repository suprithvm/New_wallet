import { createGlobalStyle } from 'styled-components';

// Define the theme colors
export const theme = {
  colors: {
    primary: '#8A57F1', // Purple color from screenshot
    primaryDark: '#6A3AC9',
    primaryLight: '#A77EF7',
    secondary: '#4B3DFF', // Blue accent
    background: '#13131F', // Dark background
    backgroundLight: '#1C1C2A', // Lighter background for cards
    text: '#FFFFFF',
    textSecondary: '#8A8AA0',
    success: '#4CAF50',
    error: '#FF5252',
    warning: '#FFC107',
    gray: '#2D2D3D',
  },
  fonts: {
    primary: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
  },
  fontSizes: {
    small: '0.875rem',
    medium: '1rem',
    large: '1.25rem',
    xlarge: '1.5rem',
    xxlarge: '2rem',
  },
  borderRadius: {
    small: '4px',
    medium: '8px',
    large: '16px',
    circle: '50%',
  },
  shadows: {
    small: '0 2px 8px rgba(0, 0, 0, 0.15)',
    medium: '0 4px 12px rgba(0, 0, 0, 0.2)',
    large: '0 8px 24px rgba(0, 0, 0, 0.25)',
  },
  spacing: {
    xxsmall: '4px',
    xsmall: '8px',
    small: '12px',
    medium: '16px',
    large: '24px',
    xlarge: '32px',
    xxlarge: '48px',
  },
  transitions: {
    default: '0.3s ease',
    quick: '0.15s ease',
    slow: '0.5s ease',
  },
};

// Global styles
export const GlobalStyle = createGlobalStyle`
  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  html, body {
    font-family: ${theme.fonts.primary};
    font-size: 16px;
    line-height: 1.5;
    color: ${theme.colors.text};
    background-color: ${theme.colors.background};
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    overflow-x: hidden;
  }

  #root {
    display: flex;
    flex-direction: column;
    min-height: 100vh;
  }

  a {
    color: ${theme.colors.primary};
    text-decoration: none;
    transition: color ${theme.transitions.quick};

    &:hover {
      color: ${theme.colors.primaryLight};
    }
  }

  h1, h2, h3, h4, h5, h6 {
    font-weight: 600;
    line-height: 1.2;
    margin-bottom: ${theme.spacing.medium};
  }

  h1 {
    font-size: ${theme.fontSizes.xxlarge};
  }

  h2 {
    font-size: ${theme.fontSizes.xlarge};
  }

  h3 {
    font-size: ${theme.fontSizes.large};
  }

  p {
    margin-bottom: ${theme.spacing.medium};
  }

  button {
    cursor: pointer;
    font-family: ${theme.fonts.primary};
  }

  input, textarea {
    font-family: ${theme.fonts.primary};
  }
`;

export default theme; 