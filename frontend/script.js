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
// Показать сотрудников в таблице
function displayEmployees(employees) {
    const tableBody = document.getElementById('tableBody');
    
    if (employees.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="12">Нет данных</td></tr>';
        return;
    }
    
    let html = '';
    
    employees.forEach(emp => {
        // Форматируем данные
        const fullName = `${emp.second_name} ${emp.first_name} ${emp.last_name || ''}`;
        const birthDate = formatDate(emp.birth_date);
        const passport = `${emp.passport_serial || ''} ${emp.passport_number || ''}`;
        const add_at = formatDate(emp.add_at);
        const salary = formatSalary(emp.salary);
        const isActive = emp.active_status;  // ДОБАВЬ ЭТУ СТРОЧКУ!
        
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
                <td>${add_at}</td>
                <td>${isActive ? 'Активен' : 'Уволен'}</td>
                <td>
                <div class="action-buttons">
                    <button onclick="editEmployee(${emp.employee_id})">Редактировать</button>
                    <button onclick="toggleEmployeeStatus(${emp.employee_id}, ${!isActive})">
                        ${isActive ? 'Уволить' : 'Восстановить'}
                    </button>
                </div>
                </td>
            </tr>
        `;
    });
    
    tableBody.innerHTML = html;
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
    
    console.log('Отправка формы...');
    console.log('Режим редактирования:', window.isEditing);
    console.log('ID редактирования:', window.editingEmployeeId);
    
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
    
    console.log('Данные формы:', formData);
    
    // Проверка
    if (!formData.second_name || !formData.first_name || !formData.birth_date || 
        !formData.salary || !formData.id_position) {
        alert('Заполните обязательные поля!');
        return;
    }
    
    try {
        let url, method;
        
        if (window.isEditing && window.editingEmployeeId) {
            url = `http://localhost:3000/api/employees/${window.editingEmployeeId}`;
            method = 'PUT';
            console.log(`Отправка PUT запроса на: ${url}`);
        } else {
            url = 'http://localhost:3000/api/employees';
            method = 'POST';
            console.log(`Отправка POST запроса на: ${url}`);
        }
        
        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });
        
        console.log('Ответ сервера:', response.status);
        
        if (response.ok) {
            const result = await response.json();
            console.log('Результат:', result);
            
            alert(window.isEditing ? 'Данные обновлены!' : 'Сотрудник добавлен!');
            
            // Сбрасываем режим редактирования
            window.isEditing = false;
            window.editingEmployeeId = null;
            
            hideAddForm();
            loadEmployees(); // Обновляем таблицу
            
        } else {
            const error = await response.json();
            console.error('Ошибка сервера:', error);
            alert(' Ошибка: ' + (error.error || 'Неизвестная ошибка'));
        }
        
    } catch (error) {
        console.error('Ошибка сети:', error);
        alert('Ошибка соединения с сервером');
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
async function toggleEmployeeStatus(employeeId, newStatus) {
    const action = newStatus ? 'восстановить' : 'уволить';
    
    if (!confirm(`Вы уверены, что хотите ${action} этого сотрудника?`)) {
        return;
    }
    
    try {
        const response = await fetch(`http://localhost:3000/api/employees/${employeeId}/status`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ active_status: newStatus })
        });
        
        if (response.ok) {
            alert(`Сотрудник успешно ${action === 'уволить' ? 'уволен' : 'восстановлен'}!`);
            loadEmployees(); // Обновляем таблицу
        } else {
            alert('Ошибка при изменении статуса');
        }
    } catch (error) {
        console.error('Ошибка:', error);
        alert('Ошибка соединения');
    }
}

// Редактировать сотрудника
async function editEmployee(employeeId) {
    console.log('Редактирование сотрудника ID:', employeeId);
    
    try {
        const response = await fetch('http://localhost:3000/api/employees');
        const employees = await response.json();
        const employee = employees.find(emp => emp.employee_id == employeeId);
        
        if (!employee) {
            alert('Сотрудник не найден');
            return;
        }
        
        console.log('Найден сотрудник:', employee);
        
        // Заполняем форму данными
        document.getElementById('lastName').value = employee.second_name;
        document.getElementById('firstName').value = employee.first_name;
        document.getElementById('middleName').value = employee.last_name || '';
        
        // Форматируем дату для input type="date"
        const birthDate = new Date(employee.birth_date);
        const formattedDate = birthDate.toISOString().split('T')[0];
        document.getElementById('birthDate').value = formattedDate;
        
        document.getElementById('passportSerial').value = employee.passport_serial || '';
        document.getElementById('passportNumber').value = employee.passport_number || '';
        document.getElementById('phone').value = employee.phone || '';
        document.getElementById('email').value = employee.email || '';
        document.getElementById('address').value = employee.address || '';
        document.getElementById('salary').value = employee.salary;
        document.getElementById('positionSelect').value = employee.id_position;
        
        // Устанавливаем режим редактирования
        window.isEditing = true;
        window.editingEmployeeId = employeeId;
        
        console.log('Установлен режим редактирования:', window.isEditing, window.editingEmployeeId);
        
        // Показываем форму
        document.getElementById('addForm').style.display = 'block';
        document.getElementById('addEmployeeBtn').style.display = 'none';
        document.querySelector('#addForm h2').textContent = `Редактировать сотрудника (ID: ${employeeId})`;
        
    } catch (error) {
        console.error('Ошибка загрузки данных:', error);
        alert('Ошибка загрузки данных сотрудника');
    }
}

// Обновляем обработчик формы для редактирования
document.getElementById('employeeForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    // Собираем данные
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
    
    // Простая проверка
    if (!formData.second_name || !formData.first_name || !formData.birth_date || 
        !formData.salary || !formData.id_position) {
        alert('Заполните обязательные поля!');
        return;
    }
    
    try {
        let url, method;
        
        // Если это редактирование
        if (window.isEditing) {
            url = `http://localhost:3000/api/employees/${window.editingEmployeeId}`;
            method = 'PUT';
        } else {
            url = 'http://localhost:3000/api/employees';
            method = 'POST';
        }
        
        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });
        
        if (response.ok) {
            alert(window.isEditing ? 'Данные обновлены!' : 'Сотрудник добавлен!');
            
            // Очищаем форму и скрываем
            hideAddForm();
            window.isEditing = false;
            window.editingEmployeeId = null;
            
            // Обновляем таблицу
            loadEmployees();
        } else {
            alert('Ошибка при сохранении');
        }
    } catch (error) {
        console.error('Ошибка:', error);
        alert('Ошибка соединения');
    }
});

// Показать форму добавления (обновляем для редактирования)
function showAddForm() {
    document.getElementById('addForm').style.display = 'block';
    document.getElementById('addEmployeeBtn').style.display = 'none';
    
    // Меняем заголовок если редактируем
    if (window.isEditing) {
        document.querySelector('#addForm h2').textContent = 'Редактировать сотрудника';
    }
}

// Скрыть форму (сбрасываем режим редактирования)
// Скрыть форму
function hideAddForm() {
    document.getElementById('addForm').style.display = 'none';
    document.getElementById('addEmployeeBtn').style.display = 'block';
    document.querySelector('#addForm h2').textContent = 'Добавить нового сотрудника';
    document.getElementById('employeeForm').reset();
    
    // Сбрасываем режим редактирования
    window.isEditing = false;
    window.editingEmployeeId = null;
    
    console.log('Форма скрыта, режим редактирования сброшен');
}
// Обновить данные
function refreshData() {
    loadEmployees();
    loadPositions();
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