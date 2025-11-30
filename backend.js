import express from 'express';
import cors from 'cors';

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());


app.get('/api/test', (req, res) => {
  res.json({ message: 'Сервер работает! 🚀', timestamp: new Date() });
});

app.listen(PORT, () => {
  console.log(`✅ Сервер запущен: http://localhost:${PORT}`);
});