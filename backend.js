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

// Раздача статических файлов из папки 
app.use(express.json());
app.use(express.static('frontend'));

// API для получения сотрудников
// Получить всех сотрудников
app.get('/api/employees', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT 
                e.*,
                p.name as position_name,
                d.name as department_name
            FROM employees e
            LEFT JOIN positions p ON e.id_position = p.position_id
            LEFT JOIN departament d ON p.id_departament = d.departament_id
            ORDER BY e.employee_id DESC
        `);
        res.json(result.rows);
    } catch (error) {
        console.error('Ошибка:', error);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

// Получить должности
app.get('/api/positions', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT p.position_id, p.name, d.name as department_name
            FROM positions p
            LEFT JOIN departament d ON p.id_departament = d.departament_id
        `);
        res.json(result.rows);
    } catch (error) {
        console.error('Ошибка:', error);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

// Добавить сотрудника
app.post('/api/employees', async (req, res) => {
    try {
        const {
            second_name, first_name, last_name, birth_date,
            passport_serial, passport_number, phone, email,
            address, salary, id_position
        } = req.body;

        const result = await pool.query(`
            INSERT INTO employees (
                second_name, first_name, last_name, birth_date,
                passport_serial, passport_number, phone, email,
                address, salary, id_position
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
            RETURNING *
        `, [
            second_name, first_name, last_name, birth_date,
            passport_serial, passport_number, phone, email,
            address, salary, id_position
        ]);

        res.json({ success: true, employee: result.rows[0] });
    } catch (error) {
        console.error('Ошибка:', error);
        res.status(500).json({ error: 'Ошибка при добавлении' });
    }
});
app.put('/api/employees/:id/status', async (req, res) => {
    try {
        const { id } = req.params;
        const { active_status } = req.body;
        
        const result = await pool.query(
            'UPDATE employees SET active_status = $1 WHERE employee_id = $2 RETURNING *',
            [active_status, id]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Сотрудник не найден' });
        }
        
        res.json({ success: true, employee: result.rows[0] });
        
    } catch (error) {
        console.error('Ошибка:', error);
        res.status(500).json({ error: 'Ошибка при изменении статуса' });
    }
});

// Обновить данные сотрудника
app.put('/api/employees/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const {
            second_name, first_name, last_name, birth_date,
            passport_serial, passport_number, phone, email,
            address, salary, id_position
        } = req.body;

        const result = await pool.query(
            `UPDATE employees SET 
                second_name = $1, first_name = $2, last_name = $3, birth_date = $4,
                passport_serial = $5, passport_number = $6, phone = $7, email = $8,
                address = $9, salary = $10, id_position = $11
            WHERE employee_id = $12 RETURNING *`,
            [
                second_name, first_name, last_name, birth_date,
                passport_serial, passport_number, phone, email,
                address, salary, id_position, id
            ]
        );

         if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Сотрудник не найден' });
        }

        console.log('Сотрудник обновлен:', result.rows[0]);
        res.json({ 
            success: true, 
            message: 'Данные обновлены',
            employee: result.rows[0] 
        });

    } catch (error) {
        console.error('Ошибка при обновлении:', error);
        res.status(500).json({ 
            error: 'Ошибка при обновлении',
            details: error.message 
        });
    }
});
app.listen(port, () => {
    console.log(`Сервер запущен: http://localhost:${port}`);
});