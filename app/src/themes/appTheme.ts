import { adaptV4Theme, createTheme } from '@mui/material';
import 'styles.scss';

const appTheme = createTheme(
  adaptV4Theme({
    breakpoints: {
      values: {
        xs: 0,
        sm: 600,
        md: 960,
        lg: 1280,
        xl: 1600
      }
    },
    palette: {
      // https://material-ui.com/customization/palette/
      background: {
        default: '#fafafa'
      },
      primary: {
        light: '#5469a4',
        main: '#003366', // BC ID: corporate blue
        dark: '#001949',
        contrastText: '#ffffff'
      },
      secondary: {
        main: '#D8292F'
      },
      text: {
        primary: '#313132',
        secondary: '#575759'
      }
    },
    typography: {
      fontFamily: ['BCSans', 'Verdana', 'Arial', 'sans-serif'].join(',')
    },
    overrides: {
      MuiTypography: {
        // https://material-ui.com/api/typography/
        h1: {
          letterSpacing: '-0.02rem',
          fontSize: '2rem',
          fontWeight: 700
        },
        h2: {
          letterSpacing: '-0.01rem',
          fontSize: '1.25rem',
          fontWeight: 700
        },
        h3: {
          fontSize: '0.9375rem',
          fontWeight: 700
        },
        h4: {
          fontSize: '1rem',
          fontWeight: 700
        },
        h6: {
          letterSpacing: '-0.01rem',
          fontWeight: 700
        }
      },
      MuiButton: {
        root: {
          textTransform: 'none'
        },
        outlinedPrimary: {
          backgroundColor: '#ffffff',
          '&:hover': {
            backgroundColor: '#ffffff'
          }
        },
        endIcon: {
          marginLeft: '4px'
        }
      },
      MuiContainer: {
        // https://material-ui.com/api/container/
        root: {
          maxWidth: 'xl',
          margin: 'auto'
        }
      },
      MuiChip: {
        labelSmall: {
          fontSize: '11px',
          fontWeight: 700,
          textTransform: 'uppercase'
        }
      },
      MuiDialog: {
        paperWidthXl: {
          width: '800px'
        },
        paperWidthLg: {
          width: '700px'
        },
        paperWidthMd: {
          width: '600px'
        },
        paperWidthSm: {
          width: '500px'
        },
        paperWidthXs: {
          width: '400px'
        }
      },
      MuiDialogActions: {
        root: {
          padding: '16px 24px 20px 24px'
        }
      },
      MuiLink: {
        root: {
          textAlign: 'left',
          color: '#1a5a96',
          cursor: 'pointer'
        }
      },
      MuiLinearProgress: {
        root: {
          height: '6px',
          borderRadius: '3px'
        }
      },
      MuiListItemIcon: {
        root: {
          minWidth: '42px'
        }
      },
      MuiOutlinedInput: {
        root: {
          background: '#f6f6f6'
        }
      },
      MuiFilledInput: {
        root: {
          background: '#f6f6f6'
        }
      },
      MuiTableCell: {
        root: {
          '&:first-of-type': {
            paddingLeft: '24px'
          },
          '&:last-child': {
            paddingRight: '24px'
          }
        },
        head: {
          backgroundColor: '#fafafa',
          lineHeight: 'normal',
          letterSpacing: '0.02rem',
          fontSize: '12px',
          fontWeight: 700
        },
        stickyHeader: {
          backgroundColor: '#fafafa'
        }
      },
      MuiTablePagination: {
        root: {
          backgroundColor: '#fafafa'
        }
      },
      MuiTab: {
        root: {
          textTransform: 'none',
          minWidth: '100px !important',
          fontWeight: 700
        }
      },
      MuiCssBaseline: {
        '@media print': {
          // When printing
          header: {
            'print-color-adjust': 'exact !important',
            '-webkit-print-color-adjust': 'exact !important',
            'background-color': 'rgba(0, 51, 102, 0.6) !important',
            'border-color': 'rgba(0, 51, 102, 0.6) !important',
            'border-width': '0px !important',
            'border-style': 'none !important',
            'border-radius': '20px !important',
            padding: '10px 5px !important',
            margin: '0 0 10px 0 !important',
            'line-height': '0 !important',
            position: 'unset !important'
          },
          'header .main-nav-toolbar, footer': {
            // Hide the header and footer
            display: 'none !important'
          },
          button: {
            // Hide all buttons
            display: 'none !important'
          },
          '.MuiButton-root': {
            // Hide all buttons
            display: 'none !important'
          },
          '.MuiDrawer-root': {
            // Hide the drawer
            display: 'none !important'
          },
          'header .MuiBox-root': {
            // annoying little line
            border: 'none !important'
          },
          // Style the map attribution
          'details.maplibregl-ctrl': {
            background: 'none !important'
          },
          'details.maplibregl-ctrl > *': {
            color: 'rgba(255, 255, 255, 1) !important'
          },
          'details.maplibregl-ctrl a': {
            color: 'rgba(255, 255, 255, 1) !important'
          },
          'details.maplibregl-ctrl summary': {
            display: 'none !important'
          },
          '.MuiGrid-item:has(> div.MuiCard-root)': {
            maxWidth: '150px !important'
          }
        }
      }
    }
  })
);

export default appTheme;
