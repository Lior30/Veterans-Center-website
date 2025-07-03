<Grid container spacing={3} sx={{ py: 4 }}>
  {[ /* everything*/].map((mod, i) => (
    <Grid item xs={12} sm={6} md={3} key={i}>
      <Card
        onClick={mod.onClick}
        sx={{
          cursor: "pointer",
          transition: "transform .2s",
          "&:hover": { transform: "scale(1.03)" }
        }}
      >
        <CardMedia
          component="img"
          height="140"
          image={mod.imageUrl}
          alt={mod.title}
        />
        <CardContent>
          <Typography variant="h6">{mod.title}</Typography>
          <Typography variant="body2" color="text.secondary">
            {mod.subtitle}
          </Typography>
        </CardContent>
      </Card>
    </Grid>
  ))}
</Grid>
