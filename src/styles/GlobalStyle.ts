import { createGlobalStyle } from 'styled-components';

const GlobalStyle = createGlobalStyle`
  *, *::before, *::after {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }
  
  html, body {
    font-family: 'Inter', 'Roboto', 'Segoe UI', 'Arial', sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    background-color: ${({ theme }) => theme.colors.background};
    color: ${({ theme }) => theme.colors.text};
    height: 100%;
    width: 100%;
    overflow-x: hidden;
  }
  
  #root {
    height: 100%;
    width: 100%;
  }
  
  a {
    text-decoration: none;
    color: inherit;
  }
  
  button, input, select, textarea {
    font-family: inherit;
    font-size: inherit;
  }
  
  button {
    cursor: pointer;
  }
  
  /* Improved mobile styles */
  @media (max-width: 768px) {
    html {
      font-size: 15px;
    }
    
    input, button {
      font-size: 16px; /* Prevents zoom on iOS */
    }
  }
  
  @media (max-width: 480px) {
    html {
      font-size: 14px;
    }
    
    body {
      padding: 0;
    }
    
    /* Fix for iOS viewport height issues */
    .vh-fix {
      height: 100%;
      height: -webkit-fill-available;
    }
  }
  
  /* Fix for mobile viewport height issues */
  html {
    height: -webkit-fill-available;
  }
`;

export default GlobalStyle; 