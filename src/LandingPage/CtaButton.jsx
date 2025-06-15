// src/components/CtaButton.jsx
import { styled, Button } from "@mui/material";

const CtaButton = styled(Button)(({ theme, color = "primary" }) => {
  const palette = theme.palette[color] || theme.palette.primary;
  return {
    textTransform: "none",
    borderRadius: 50,
    boxShadow: "0px 4px 10px rgba(0,0,0,0.1)",
    padding: theme.spacing(1.5, 3),
    color: palette.contrastText,
    backgroundColor: palette.main,
    "&:hover": {
      backgroundColor: palette.dark || palette.main,
      boxShadow: "0px 6px 14px rgba(0,0,0,0.15)",
    },
    // רווח בין startIcon לטקסט
    "& .MuiButton-startIcon": {
      marginLeft: theme.spacing(1),
    },
    // רווח בין endIcon לטקסט (במידה ויש)
    "& .MuiButton-endIcon": {
      marginLeft: theme.spacing(1),
    },
    [theme.breakpoints.down("sm")]: {
      padding: theme.spacing(1, 2),
      fontSize: "0.875rem",
      marginRight: theme.spacing(1),
      marginTop: theme.spacing(1),
    },
  };
});

export default CtaButton;
