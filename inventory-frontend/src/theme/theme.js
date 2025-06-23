import { createTheme, alpha } from "@mui/material/styles";

// Create custom shadows
const createCustomShadows = () => {
  const transparent = alpha("#000", 0);
  const shadowColor = alpha("#000", 0.08);

  return [
    "none",
    `0px 2px 1px -1px ${shadowColor},0px 1px 1px 0px ${shadowColor},0px 1px 3px 0px ${shadowColor}`,
    `0px 3px 1px -2px ${shadowColor},0px 2px 2px 0px ${shadowColor},0px 1px 5px 0px ${shadowColor}`,
    `0px 3px 3px -2px ${shadowColor},0px 3px 4px 0px ${shadowColor},0px 1px 8px 0px ${shadowColor}`,
    `0px 2px 4px -1px ${shadowColor},0px 4px 5px 0px ${shadowColor},0px 1px 10px 0px ${shadowColor}`,
    `0px 3px 5px -1px ${shadowColor},0px 5px 8px 0px ${shadowColor},0px 1px 14px 0px ${shadowColor}`,
    `0px 3px 5px -1px ${shadowColor},0px 6px 10px 0px ${shadowColor},0px 1px 18px 0px ${shadowColor}`,
    `0px 4px 5px -2px ${shadowColor},0px 7px 10px 1px ${shadowColor},0px 2px 16px 1px ${shadowColor}`,
    `0px 5px 5px -3px ${shadowColor},0px 8px 10px 1px ${shadowColor},0px 3px 14px 2px ${shadowColor}`,
    `0px 5px 6px -3px ${shadowColor},0px 9px 12px 1px ${shadowColor},0px 3px 16px 2px ${shadowColor}`,
    `0px 6px 6px -3px ${shadowColor},0px 10px 14px 1px ${shadowColor},0px 4px 18px 3px ${shadowColor}`,
    `0px 6px 7px -4px ${shadowColor},0px 11px 15px 1px ${shadowColor},0px 4px 20px 3px ${shadowColor}`,
    `0px 7px 8px -4px ${shadowColor},0px 12px 17px 2px ${shadowColor},0px 5px 22px 4px ${shadowColor}`,
    `0px 7px 8px -4px ${shadowColor},0px 13px 19px 2px ${shadowColor},0px 5px 24px 4px ${shadowColor}`,
    `0px 7px 9px -4px ${shadowColor},0px 14px 21px 2px ${shadowColor},0px 5px 26px 4px ${shadowColor}`,
    `0px 8px 9px -5px ${shadowColor},0px 15px 22px 2px ${shadowColor},0px 6px 28px 5px ${shadowColor}`,
    `0px 8px 10px -5px ${shadowColor},0px 16px 24px 2px ${shadowColor},0px 6px 30px 5px ${shadowColor}`,
    `0px 8px 11px -5px ${shadowColor},0px 17px 26px 2px ${shadowColor},0px 6px 32px 5px ${shadowColor}`,
    `0px 9px 11px -5px ${shadowColor},0px 18px 28px 2px ${shadowColor},0px 7px 34px 6px ${shadowColor}`,
    `0px 9px 12px -6px ${shadowColor},0px 19px 29px 2px ${shadowColor},0px 7px 36px 6px ${shadowColor}`,
    `0px 10px 13px -6px ${shadowColor},0px 20px 31px 3px ${shadowColor},0px 8px 38px 7px ${shadowColor}`,
    `0px 10px 13px -6px ${shadowColor},0px 21px 33px 3px ${shadowColor},0px 8px 40px 7px ${shadowColor}`,
    `0px 10px 14px -6px ${shadowColor},0px 22px 35px 3px ${shadowColor},0px 8px 42px 7px ${shadowColor}`,
    `0px 11px 14px -7px ${shadowColor},0px 23px 36px 3px ${shadowColor},0px 9px 44px 8px ${shadowColor}`,
    `0px 11px 15px -7px ${shadowColor},0px 24px 38px 3px ${shadowColor},0px 9px 46px 8px ${shadowColor}`,
  ];
};

// Create the theme
const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#000000",
      light: "#333333",
      dark: "#000000",
      contrastText: "#ffffff",
    },
    secondary: {
      main: "#333333",
      light: "#555555",
      dark: "#111111",
      contrastText: "#ffffff",
    },
    error: {
      main: "#d32f2f",
      light: "#ef5350",
      dark: "#c62828",
      contrastText: "#ffffff",
    },
    warning: {
      main: "#ed6c02",
      light: "#ff9800",
      dark: "#e65100",
      contrastText: "#ffffff",
    },
    info: {
      main: "#0288d1",
      light: "#03a9f4",
      dark: "#01579b",
      contrastText: "#ffffff",
    },
    success: {
      main: "#2e7d32",
      light: "#4caf50",
      dark: "#1b5e20",
      contrastText: "#ffffff",
    },
    grey: {
      50: "#fafafa",
      100: "#f5f5f5",
      200: "#eeeeee",
      300: "#e0e0e0",
      400: "#bdbdbd",
      500: "#9e9e9e",
      600: "#757575",
      700: "#616161",
      800: "#424242",
      900: "#212121",
      A100: "#f5f5f5",
      A200: "#eeeeee",
      A400: "#bdbdbd",
      A700: "#616161",
    },
    text: {
      primary: "#000000",
      secondary: "#555555",
      disabled: "#9e9e9e",
    },
    divider: "rgba(0, 0, 0, 0.12)",
    background: {
      paper: "#ffffff",
      default: "#f8f8f8",
    },
    action: {
      active: "rgba(0, 0, 0, 0.54)",
      hover: "rgba(0, 0, 0, 0.04)",
      hoverOpacity: 0.04,
      selected: "rgba(0, 0, 0, 0.08)",
      selectedOpacity: 0.08,
      disabled: "rgba(0, 0, 0, 0.26)",
      disabledBackground: "rgba(0, 0, 0, 0.12)",
      disabledOpacity: 0.38,
      focus: "rgba(0, 0, 0, 0.12)",
      focusOpacity: 0.12,
      activatedOpacity: 0.12,
    },
  },
  typography: {
    fontFamily: [
      "-apple-system",
      "BlinkMacSystemFont",
      "San Francisco",
      "Segoe UI",
      "Roboto",
      "Helvetica Neue",
      "Arial",
      "sans-serif",
    ].join(","),
    h1: {
      fontWeight: 700,
      fontSize: "2.5rem",
      lineHeight: 1.2,
      letterSpacing: "-0.01562em",
    },
    h2: {
      fontWeight: 700,
      fontSize: "2rem",
      lineHeight: 1.2,
      letterSpacing: "-0.00833em",
    },
    h3: {
      fontWeight: 600,
      fontSize: "1.75rem",
      lineHeight: 1.2,
      letterSpacing: "0em",
    },
    h4: {
      fontWeight: 600,
      fontSize: "1.5rem",
      lineHeight: 1.2,
      letterSpacing: "0.00735em",
    },
    h5: {
      fontWeight: 600,
      fontSize: "1.25rem",
      lineHeight: 1.2,
      letterSpacing: "0em",
    },
    h6: {
      fontWeight: 600,
      fontSize: "1rem",
      lineHeight: 1.2,
      letterSpacing: "0.0075em",
    },
    subtitle1: {
      fontWeight: 500,
      fontSize: "1rem",
      lineHeight: 1.5,
      letterSpacing: "0.00938em",
    },
    subtitle2: {
      fontWeight: 500,
      fontSize: "0.875rem",
      lineHeight: 1.5,
      letterSpacing: "0.00714em",
    },
    body1: {
      fontWeight: 400,
      fontSize: "1rem",
      lineHeight: 1.5,
      letterSpacing: "0.00938em",
    },
    body2: {
      fontWeight: 400,
      fontSize: "0.875rem",
      lineHeight: 1.5,
      letterSpacing: "0.01071em",
    },
    button: {
      fontWeight: 500,
      fontSize: "0.875rem",
      lineHeight: 1.75,
      letterSpacing: "0.02857em",
      textTransform: "none",
    },
    caption: {
      fontWeight: 400,
      fontSize: "0.75rem",
      lineHeight: 1.66,
      letterSpacing: "0.03333em",
    },
    overline: {
      fontWeight: 400,
      fontSize: "0.75rem",
      lineHeight: 2.66,
      letterSpacing: "0.08333em",
      textTransform: "uppercase",
    },
  },
  shape: {
    borderRadius: 8,
  },
  shadows: createCustomShadows(),
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          scrollbarWidth: "thin",
          scrollbarColor: "#bdbdbd transparent",
          "&::-webkit-scrollbar": {
            width: "8px",
            height: "8px",
          },
          "&::-webkit-scrollbar-track": {
            background: "transparent",
          },
          "&::-webkit-scrollbar-thumb": {
            backgroundColor: "#bdbdbd",
            borderRadius: "4px",
          },
          "&::-webkit-scrollbar-thumb:hover": {
            backgroundColor: "#9e9e9e",
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: "none",
          fontWeight: 500,
          boxShadow: "none",
          "&:hover": {
            boxShadow: "none",
          },
        },
        contained: {
          boxShadow: "none",
          "&:hover": {
            boxShadow: "none",
          },
        },
        containedPrimary: {
          backgroundColor: "#000",
          "&:hover": {
            backgroundColor: "#333",
          },
        },
        outlined: {
          borderWidth: "1px",
          "&:hover": {
            borderWidth: "1px",
          },
        },
        outlinedPrimary: {
          borderColor: "#000",
          "&:hover": {
            borderColor: "#333",
            backgroundColor: "rgba(0, 0, 0, 0.04)",
          },
        },
        text: {
          "&:hover": {
            backgroundColor: "rgba(0, 0, 0, 0.04)",
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.05)",
          transition: "transform 0.3s ease, box-shadow 0.3s ease",
          "&:hover": {
            boxShadow: "0px 8px 30px rgba(0, 0, 0, 0.08)",
          },
        },
      },
    },
    MuiCardHeader: {
      styleOverrides: {
        root: {
          padding: "24px 24px 0",
        },
        title: {
          fontSize: "1.25rem",
          fontWeight: 600,
        },
        subheader: {
          fontSize: "0.875rem",
          color: "#757575",
        },
      },
    },
    MuiCardContent: {
      styleOverrides: {
        root: {
          padding: "24px",
          "&:last-child": {
            paddingBottom: "24px",
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 6,
          fontWeight: 500,
        },
        filled: {
          backgroundColor: "#f5f5f5",
          color: "#333",
          "&.MuiChip-colorPrimary": {
            backgroundColor: "#000",
            color: "#fff",
          },
          "&.MuiChip-colorSecondary": {
            backgroundColor: "#333",
            color: "#fff",
          },
          "&.MuiChip-colorSuccess": {
            backgroundColor: "rgba(46, 125, 50, 0.1)",
            color: "#2e7d32",
          },
          "&.MuiChip-colorError": {
            backgroundColor: "rgba(211, 47, 47, 0.1)",
            color: "#d32f2f",
          },
          "&.MuiChip-colorWarning": {
            backgroundColor: "rgba(237, 108, 2, 0.1)",
            color: "#ed6c02",
          },
          "&.MuiChip-colorInfo": {
            backgroundColor: "rgba(2, 136, 209, 0.1)",
            color: "#0288d1",
          },
        },
      },
    },
    MuiTable: {
      styleOverrides: {
        root: {
          borderCollapse: "separate",
          borderSpacing: "0",
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          padding: "16px 24px",
          borderBottom: "1px solid #f0f0f0",
        },
        head: {
          backgroundColor: "#fafafa",
          color: "#333",
          fontWeight: 600,
          fontSize: "0.875rem",
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          transition: "background-color 0.2s ease",
          "&:hover": {
            backgroundColor: "rgba(0, 0, 0, 0.02)",
          },
        },
      },
    },
    MuiPagination: {
      styleOverrides: {
        root: {
          "& .MuiPaginationItem-root": {
            borderRadius: 8,
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: "0px 1px 10px rgba(0, 0, 0, 0.05)",
        },
        colorDefault: {
          backgroundColor: "#fff",
          color: "#000",
        },
      },
    },
    MuiToolbar: {
      styleOverrides: {
        root: {
          minHeight: "64px",
          "@media (min-width: 600px)": {
            minHeight: "64px",
          },
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: "#fff",
          borderRight: "1px solid #f0f0f0",
        },
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: {
          borderColor: "#f0f0f0",
        },
      },
    },
    MuiListItem: {
      styleOverrides: {
        root: {
          paddingTop: 8,
          paddingBottom: 8,
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          "&.Mui-selected": {
            backgroundColor: "rgba(0, 0, 0, 0.04)",
            "&:hover": {
              backgroundColor: "rgba(0, 0, 0, 0.08)",
            },
          },
        },
      },
    },
    MuiListItemIcon: {
      styleOverrides: {
        root: {
          minWidth: 40,
          color: "#757575",
        },
      },
    },
    MuiListItemText: {
      styleOverrides: {
        primary: {
          fontWeight: 500,
        },
      },
    },
    MuiInputBase: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          "&:hover .MuiOutlinedInput-notchedOutline": {
            borderColor: "#000",
          },
          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
            borderColor: "#000",
            borderWidth: "1px",
          },
        },
        notchedOutline: {
          borderColor: "#e0e0e0",
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          "& label.Mui-focused": {
            color: "#000",
          },
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        icon: {
          color: "#757575",
        },
      },
    },
    MuiMenuItem: {
      styleOverrides: {
        root: {
          minHeight: "auto",
          padding: "8px 16px",
        },
      },
    },
    MuiCheckbox: {
      styleOverrides: {
        root: {
          color: "#bdbdbd",
          "&.Mui-checked": {
            color: "#000",
          },
        },
      },
    },
    MuiRadio: {
      styleOverrides: {
        root: {
          color: "#bdbdbd",
          "&.Mui-checked": {
            color: "#000",
          },
        },
      },
    },
    MuiSwitch: {
      styleOverrides: {
        root: {
          width: 42,
          height: 26,
          padding: 0,
          "& .MuiSwitch-switchBase": {
            padding: 0,
            margin: 2,
            transitionDuration: "300ms",
            "&.Mui-checked": {
              transform: "translateX(16px)",
              color: "#fff",
              "& + .MuiSwitch-track": {
                backgroundColor: "#000",
                opacity: 1,
                border: 0,
              },
              "&.Mui-disabled + .MuiSwitch-track": {
                opacity: 0.5,
              },
            },
            "&.Mui-focusVisible .MuiSwitch-thumb": {
              color: "#000",
              border: "6px solid #fff",
            },
            "&.Mui-disabled .MuiSwitch-thumb": {
              color: "#bdbdbd",
            },
            "&.Mui-disabled + .MuiSwitch-track": {
              opacity: 0.7,
            },
          },
          "& .MuiSwitch-thumb": {
            boxSizing: "border-box",
            width: 22,
            height: 22,
          },
          "& .MuiSwitch-track": {
            borderRadius: 26 / 2,
            backgroundColor: "#e0e0e0",
            opacity: 1,
          },
        },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          backgroundColor: "rgba(0, 0, 0, 0.8)",
          fontSize: "0.75rem",
          padding: "8px 12px",
          borderRadius: 4,
        },
        arrow: {
          color: "rgba(0, 0, 0, 0.8)",
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: "12px 16px",
        },
        standardSuccess: {
          backgroundColor: "rgba(46, 125, 50, 0.1)",
          color: "#2e7d32",
        },
        standardError: {
          backgroundColor: "rgba(211, 47, 47, 0.1)",
          color: "#d32f2f",
        },
        standardWarning: {
          backgroundColor: "rgba(237, 108, 2, 0.1)",
          color: "#ed6c02",
        },
        standardInfo: {
          backgroundColor: "rgba(2, 136, 209, 0.1)",
          color: "#0288d1",
        },
      },
    },
    MuiAvatar: {
      styleOverrides: {
        root: {
          backgroundColor: "#000",
          color: "#fff",
        },
      },
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: {
          borderRadius: 4,
          height: 6,
        },
        bar: {
          borderRadius: 4,
        },
      },
    },
    MuiCircularProgress: {
      styleOverrides: {
        circle: {
          strokeLinecap: "round",
        },
      },
    },
  },
});

export default theme;
