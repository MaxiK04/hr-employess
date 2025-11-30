import express from 'express';
import cors from 'cors';
import pkg from 'pg';
const { Pool } = pkg;

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// Подключение к БД
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'employess_db',
  password: 'qwertyui',
  port: 5432,
});

// Проверка подключенияБД
app.get('/api/test', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW() as time');
    res.json({ 
      message: 'Сервер и БД работают', 
      dbTime: result.rows[0].time 
    });
  } catch (error) {
    res.status(500).json({ error: 'Ошибка БД: ' + error.message });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Сервер запущен: http://localhost:${PORT}`);
});