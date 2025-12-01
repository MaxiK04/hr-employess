const express = require('express');
const { Pool } = require('pg');

const app = express();
const port = 3000;

// Подключение к БД
const pool = new Pool({
    user: 'postgres',     
    host: 'localhost',
    database: 'employess_db',  
    password: 'qwertyui',   
    port: 5432,
});

// Раздача статических файлов из папки frontend
app.use(express.static('frontend'));

// API для получения сотрудников
app.get('/api/employees', async (req, res) => {
    try {
        const query = `
            SELECT 
                e.employee_id,
                e.second_name,
                e.first_name,
                e.last_name,
                e.birth_date,
                e.passport_serial,
                e.passport_number,
                e.phone,
                e.email,
                e.address,
                e.salary,
                e.add_at as hire_date,
                p.name as position_name,
                d.name as department_name
            FROM employees e
            LEFT JOIN positions p ON e.id_position = p.position_id
            LEFT JOIN departament d ON p.id_departament = d.departament_id
            ORDER BY e.second_name, e.first_name
        `;
        
        const result = await pool.query(query);
        res.json(result.rows);
    } catch (error) {
        console.error('Ошибка:', error);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

app.listen(port, () => {
    console.log(`Сервер запущен: http://localhost:${port}`);
});