import Toolbar from '@mui/material/Toolbar';
import React from 'react';

const pageStyles = {
  appFooter: {
    backgroundColor: '#003366',
    borderTop: '1px solid white'
  },
  appFooterToolbar: {
    minHeight: '46px',
    '& ul': {
      display: 'flex',
      flexWrap: 'wrap',
      alignItems: 'center',
      margin: 0,
      padding: 0,
      fontSize: '14px',
      listStyleType: 'none'
    },
    '& li + li ': {
      marginLeft: '0.8rem',
      paddingLeft: '0.8rem',
      borderLeft: '1px solid #4b5e7e'
    },
    '& a': {
      color: '#ffffff',
      textDecoration: 'none'
    },
    '& a:hover': {
      textDecoration: 'underline'
    }
  }
};

const Footer: React.FC = () => {
  return (
    <footer style={pageStyles.appFooter} role="contentinfo" aria-label="Footer">
      <Toolbar
        variant="dense"
        sx={pageStyles.appFooterToolbar}
        role="navigation"
        data-testid="footer"
        aria-label="Footer Navigation">
        <ul>
          <li>
            <a href="https://www2.gov.bc.ca/gov/content/home/disclaimer" role="link">
              Disclaimer
            </a>
          </li>
          <li>
            <a href="https://www2.gov.bc.ca/gov/content/home/privacy" role="link">
              Privacy
            </a>
          </li>
          <li>
            <a href="https://www2.gov.bc.ca/gov/content/home/accessible-government" role="link">
              Accessibility
            </a>
          </li>
          <li>
            <a href="https://www2.gov.bc.ca/gov/content/home/copyright" role="link">
              Copyright
            </a>
          </li>
        </ul>
      </Toolbar>
    </footer>
  );
};

export default Footer;
