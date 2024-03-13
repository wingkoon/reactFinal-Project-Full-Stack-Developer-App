import { useState, createContext, useEffect } from "react";
import "./App.css";
import Router from "./Router";
import Navbar from "./components/Navbar";
import Loader from "./components/Loader";
import Snackbar from "./components/Snackbar";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import FooterPage from "./components/FooterPage";
import CssBaseline from "@mui/material/CssBaseline";
import { RoleTypes } from './components/RoleTypes';
import { jwtDecode } from "jwt-decode";

export const GeneralContext = createContext();

function App() {
  const [themeLight, setThemeType] = useState(true);
  const [user, setUser] = useState(true);
  const [loader, setLoader] = useState(true);
  const [snackbarText, setSnackbarText] = useState("");

  const snackbar = (text) => {
    setSnackbarText(text);
    setTimeout(() => setSnackbarText(""), 3 * 1000);
  };
const [userRoleType, setUserRoleType] = useState(localStorage.getItem('userId') || RoleTypes.none);

    function handleThemeChange() {
    setThemeType(!themeLight);
  }
  
  const theme = createTheme({
  palette: {
      mode: themeLight ? "light" : "dark",
    primary: {
      light: '#757ce8',
      main: '#3f50b5',
      dark: '#002884',
      contrastText: '#fff',
    },
    secondary: {
      light: '#ff7961',
      main: '#f44336',
      dark: '#ba000d',
      contrastText: '#000',
    },
  },
});

// ...

useEffect(() => {
  const token = localStorage.getItem('token');
  if (!token) {
    setUserRoleType(RoleTypes.none);
    setLoader(false);
    return;
  }

  const user = jwtDecode(token);
  let role = RoleTypes.user;

  if (user.isAdmin) {
    role = RoleTypes.isAdmin;
  } else if (user.IsBusiness) {
    role = RoleTypes.IsBusiness;
  }

  setUserRoleType(role);
  setLoader(false);
}, []);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <GeneralContext.Provider
        value={{
          user,
          setUser,
          snackbar,
          setLoader,
          userRoleType,
          setUserRoleType,
        }}>
        <Navbar onThemeChange={handleThemeChange} theme={theme} />
        <Router theme={theme} />
        {loader && <Loader />}
        {snackbarText && <Snackbar text={snackbarText} />}
          <FooterPage/>
      </GeneralContext.Provider>
    </ThemeProvider>
  );
}

export default App;
