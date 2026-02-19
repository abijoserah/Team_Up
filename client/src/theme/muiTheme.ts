import { createTheme } from "@mui/material/styles";

export const muiTheme = createTheme({
  components: {
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-notchedOutline": {
            borderColor: "var(--input-color)",
          },
          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
            borderColor: "var(--input-color)",
          },
        },
      },
    },

    MuiInputLabel: {
      styleOverrides: {
        root: {
          "&.Mui-focused": {
            color: "var(--input-color)",
          },
        },
      },
    },
    MuiInputBase: {
      styleOverrides: {
        input: {
          textAlign: "center",
        },
      },
    },
  },
});
