import { createGlobalStyle } from 'styled-components';

export interface ThemeType {
  colors: {
    primary: string;
    secondary: string;
    background: string;
    backgroundSecondary: string;
    text: string;
    textSecondary: string;
    success: string;
    error: string;
    warning: string;
    info: string;
    border: string;
    buttonText: string;
  };
  fonts: {
    main: string;
  };
  breakpoints: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
  spacing: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
  shadows: {
    small: string;
    medium: string;
    large: string;
  };
  transitions: {
    default: string;
  };
}

export const theme: ThemeType = {
  colors: {
    primary: '#8A2BE2',
    secondary: '#4A00E0',
    background: '#121212',
    backgroundSecondary: '#1E1E1E',
    text: '#FFFFFF',
    textSecondary: '#B3B3B3',
    success: '#4CAF50',
    error: '#F44336',
    warning: '#FFC107',
    info: '#2196F3',
    border: '#333333',
    buttonText: '#FFFFFF',
  },
  fonts: {
    main: "'Inter', sans-serif",
  },
  breakpoints: {
    xs: '480px',
    sm: '768px',
    md: '992px',
    lg: '1200px',
    xl: '1600px',
  },
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
  },
  shadows: {
    small: '0 2px 5px rgba(0, 0, 0, 0.2)',
    medium: '0 5px 15px rgba(0, 0, 0, 0.3)',
    large: '0 10px 25px rgba(0, 0, 0, 0.4)',
  },
  transitions: {
    default: 'all 0.3s ease',
  },
};

export const GlobalStyle = createGlobalStyle`
  *, *::before, *::after {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }
  
  html, body {
    font-family: ${({ theme }) => theme.fonts.main};
    background-color: ${({ theme }) => theme.colors.background};
    color: ${({ theme }) => theme.colors.text};
    line-height: 1.5;
    height: 100%;
    width: 100%;
  }
  
  #root {
    height: 100%;
    width: 100%;
  }
  
  a {
    color: ${({ theme }) => theme.colors.primary};
    text-decoration: none;
    
    &:hover {
      text-decoration: underline;
    }
  }
  
  button, input, textarea, select {
    font-family: inherit;
  }
  
  h1, h2, h3, h4, h5, h6 {
    margin-bottom: 10px;
    font-weight: 600;
  }
  
  p {
    margin-bottom: 16px;
  }
  
  button {
    cursor: pointer;
  }
  
  /* Custom scrollbar */
  ::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }
  
  ::-webkit-scrollbar-track {
    background: #1E1E1E;
  }
  
  ::-webkit-scrollbar-thumb {
    background: #333;
    border-radius: 4px;
  }
  
  ::-webkit-scrollbar-thumb:hover {
    background: #444;
  }
`;

export default theme; 