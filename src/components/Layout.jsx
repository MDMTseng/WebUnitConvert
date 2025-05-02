import React from 'react';
import styled from 'styled-components';
import { useTheme } from '../contexts/ThemeContext';
import IconButton from './IconButton';

// Placeholder icons
const SunIcon = () => <span>☀️</span>;
const MoonIcon = () => <span>🌙</span>;

const AppWrapper = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
  background-color: ${({ theme }) => theme.background};
`;

const Header = styled.header`
  padding: 1rem;
  background-color: ${({ theme }) => theme.headerBg};
  color: ${({ theme }) => theme.text};
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Main = styled.main`
  flex-grow: 1;
  display: flex;
`;

const Footer = styled.footer`
  padding: 1rem;
  background-color: ${({ theme }) => theme.footerBg};
  color: ${({ theme }) => theme.text};
  text-align: center;
`;

const Layout = ({ children }) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <AppWrapper>
      <Header>
        {/* <h1>Unit Converter</h1> */}
      </Header>
      <Main>{children}</Main>
      <Footer>
        <p>&copy; {new Date().getFullYear()} Unit Converter</p>
      </Footer>
    </AppWrapper>
  );
};

export default Layout; 