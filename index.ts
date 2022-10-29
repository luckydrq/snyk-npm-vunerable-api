import app from './lib/app';

const PORT = process.env.PORT || 3389;

app.listen(PORT, async () => {
  console.log(`Server is running at http://127.0.0.1:${PORT}/`);
});
