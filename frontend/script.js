// Загрузка данных при открытии страницы
document.addEventListener('DOMContentLoaded', loadEmployees);

async function loadEmployees() {
    const loading = document.getElementById('loading');
    const tableBody = document.getElementById('tableBody');
    
    loading.style.display = 'block';
    tableBody.innerHTML = '<tr><td colspan="10">Загрузка...</td></tr>';
    
    try {
        const response = await fetch('http://localhost:3000/api/employees');
        const employees = await response.json();
        
        displayEmployees(employees);
    } catch (error) {
        console.error('Ошибка загрузки:', error);
        tableBody.innerHTML = '<tr><td colspan="10" style="color: red;">Ошибка загрузки данных</td></tr>';
    } finally {
        loading.style.display = 'none';
    }
}

function displayEmployees(employees) {
    const tableBody = document.getElementById('tableBody');
    
    if (employees.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="10">Нет данных</td></tr>';
        return;
    }
    
    let html = '';
    
    employees.forEach(employee => {
        // Форматируем ФИО
        const fullName = `${employee.second_name} ${employee.first_name} ${employee.last_name || ''}`;
        
        // Форматируем дату рождения
        const birthDate = formatDate(employee.birth_date);
        
        // Форматируем паспорт
        const passport = `${employee.passport_serial || ''} ${employee.passport_number || ''}`;
        
        // Форматируем телефон (если есть)
        let phone = employee.phone || '';
        if (phone && phone.length === 11) {
            phone = `+${phone[0]} (${phone.slice(1,4)}) ${phone.slice(4,7)}-${phone.slice(7,9)}-${phone.slice(9)}`;
        }
        
        // Форматируем дату приёма
        const hireDate = formatDate(employee.hire_date);
        
        // Форматируем зарплату
        const salary = formatSalary(employee.salary);
        
        html += `
            <tr>
                <td>${fullName}</td>
                <td>${birthDate}</td>
                <td>${passport}</td>
                <td>${phone}</td>
                <td>${employee.email || ''}</td>
                <td>${employee.address || ''}</td>
                <td>${employee.department_name || ''}</td>
                <td>${employee.position_name || ''}</td>
                <td>${salary}</td>
                <td>${hireDate}</td>
            </tr>
        `;
    });
    
    tableBody.innerHTML = html;
}

// Вспомогательные функции
function formatDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU');
}

function formatSalary(amount) {
    return new Intl.NumberFormat('ru-RU', {
        style: 'currency',
        currency: 'RUB',
        minimumFractionDigits: 0
    }).format(amount);
}

function filterTable() {
    const search = document.getElementById('search').value.toLowerCase();
    const rows = document.querySelectorAll('#tableBody tr');
    
    rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(search) ? '' : 'none';
    });
}

function refreshData() {
    loadEmployees();
}