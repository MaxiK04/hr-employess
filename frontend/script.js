// Загрузка данных при открытии страницы
document.addEventListener('DOMContentLoaded', function() {
    loadEmployees();
    loadPositions();
});

// Загрузить список сотрудников
async function loadEmployees() {
    try {
        const response = await fetch('http://localhost:3000/api/employees');
        const employees = await response.json();
        displayEmployees(employees);
    } catch (error) {
        console.error('Ошибка:', error);
        alert('Не удалось загрузить данные');
    }
}

// Загрузить список должностей
async function loadPositions() {
    try {
        const response = await fetch('http://localhost:3000/api/positions');
        const positions = await response.json();
        
        const select = document.getElementById('positionSelect');
        positions.forEach(position => {
            const option = document.createElement('option');
            option.value = position.position_id;
            option.textContent = `${position.name} (${position.department_name})`;
            select.appendChild(option);
        });
    } catch (error) {
        console.error('Ошибка:', error);
    }
}

// Показать сотрудников в таблице
function displayEmployees(employees) {
    const tableBody = document.getElementById('tableBody');
    
    if (employees.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="10">Нет данных</td></tr>';
        return;
    }
    
    let html = '';
    
    employees.forEach(emp => {
        // Форматируем данные
        const fullName = `${emp.second_name} ${emp.first_name} ${emp.last_name || ''}`;
        const birthDate = formatDate(emp.birth_date);
        const passport = `${emp.passport_serial || ''} ${emp.passport_number || ''}`;
        const hireDate = formatDate(emp.hire_date);
        const salary = formatSalary(emp.salary);
        
        html += `
            <tr>
                <td>${fullName}</td>
                <td>${birthDate}</td>
                <td>${passport}</td>
                <td>${emp.phone || ''}</td>
                <td>${emp.email || ''}</td>
                <td>${emp.address || ''}</td>
                <td>${emp.department_name || ''}</td>
                <td>${emp.position_name || ''}</td>
                <td>${salary}</td>
                <td>${hireDate}</td>
            </tr>
        `;
    });
    
    tableBody.innerHTML = html;
}

// Форматирование даты
function formatDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU');
}

// Форматирование зарплаты
function formatSalary(amount) {
    return new Intl.NumberFormat('ru-RU', {
        style: 'currency',
        currency: 'RUB'
    }).format(amount);
}

// Показать форму добавления
function showAddForm() {
    document.getElementById('addForm').style.display = 'block';
    document.getElementById('addEmployeeBtn').style.display = 'none';
}

// Скрыть форму добавления
function hideAddForm() {
    document.getElementById('addForm').style.display = 'none';
    document.getElementById('addEmployeeBtn').style.display = 'block';
}

// Обработка формы
document.getElementById('employeeForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    // Получаем данные формы
    const formData = {
        second_name: document.getElementById('lastName').value,
        first_name: document.getElementById('firstName').value,
        last_name: document.getElementById('middleName').value,
        birth_date: document.getElementById('birthDate').value,
        passport_serial: document.getElementById('passportSerial').value,
        passport_number: document.getElementById('passportNumber').value,
        phone: document.getElementById('phone').value,
        email: document.getElementById('email').value,
        address: document.getElementById('address').value,
        salary: document.getElementById('salary').value,
        id_position: document.getElementById('positionSelect').value
    };
    
    // Проверка обязательных полей
    if (!formData.second_name || !formData.first_name || !formData.birth_date || 
        !formData.salary || !formData.id_position) {
        alert('Заполните обязательные поля!');
        return;
    }
    
    try {
        // Отправляем данные на сервер
        const response = await fetch('http://localhost:3000/api/employees', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });
        
        if (response.ok) {
            alert('Сотрудник добавлен!');
            document.getElementById('employeeForm').reset();
            hideAddForm();
            loadEmployees(); // Обновляем таблицу
        } else {
            alert('Ошибка при добавлении');
        }
    } catch (error) {
        console.error('Ошибка:', error);
        alert('Ошибка соединения');
    }
});

// Поиск
function filterTable() {
    const search = document.getElementById('search').value.toLowerCase();
    const rows = document.querySelectorAll('#tableBody tr');
    
    rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(search) ? '' : 'none';
    });
}

// Обновить данные
function refreshData() {
    loadEmployees();
    loadPositions();
}