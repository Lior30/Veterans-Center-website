import { Button, styled } from "@mui/material";

/*  button Call-To-Action  */
const CtaButton = styled(Button)(({ theme, color = "primary" }) => {
  /* choose color */
  const pal = theme.palette[color] || theme.palette.primary;
  const main = pal.main;
  const dark = pal.dark || theme.palette[color]?.dark || main;
  const light = pal.light || theme.palette[color]?.light || main;

  return {
    position: "relative",
    overflow: "hidden",
    textTransform: "none",
    fontWeight: 600,
    borderRadius: 40,
    padding: theme.spacing(1.4, 3.5),
    color: theme.palette.getContrastText(main),

    /* shadow */
    background: `linear-gradient(135deg, ${light} 0%, ${main} 50%, ${dark} 100%)`,
    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
    transition: "transform .2s, box-shadow .25s, opacity .25s",

    /* icon*/
    "& .MuiButton-startIcon, & .MuiButton-endIcon": {
      marginLeft: theme.spacing(1),
      marginRight: 0,
    },

    /* Hover */
    "&:hover": {
      transform: "translateY(-3px)",
      boxShadow: "0 8px 22px rgba(0,0,0,0.25)",
      background: `linear-gradient(135deg, ${light} 0%, ${main} 30%, ${dark} 80%)`,
    },

    /* Active (press) */
    "&:active": {
      transform: "translateY(0)",
      boxShadow: "0 4px 12px rgba(0,0,0,0.2) inset",
    },

    /* ─── Disabled ─── */
    "&.Mui-disabled": {
      opacity: 0.45,
      boxShadow: "none",
      background: `linear-gradient(135deg, ${light} 0%, ${main} 70%)`,
      color: theme.palette.getContrastText(main),
    },

    /* ─── Responsiveness ─── */
    [theme.breakpoints.down("sm")]: {
      padding: theme.spacing(1.1, 2.4),
      fontSize: "0.875rem",
      marginRight: theme.spacing(1),
      marginTop: theme.spacing(1),
    },
  };
});

export default CtaButton;
