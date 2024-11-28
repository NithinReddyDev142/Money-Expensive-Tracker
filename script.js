const expenseForm = document.getElementById('expense-form');
const categorySelect = document.getElementById('category-select');
const amountInput = document.getElementById('amount-input');
const dateInput = document.getElementById('date-input');
const addUpdateBtn = document.getElementById('add-update-btn');
const expenseTableBody = document.getElementById('expense-table-body');
const totalAmountCell = document.getElementById('total-amount');
const ctx = document.getElementById('expense-chart').getContext('2d');

let expenses = JSON.parse(sessionStorage.getItem('expenses')) || [];
let totalAmount = 0;
let chart;
let editIndex = null; // Track the index of the expense being edited

// Load existing expenses from session storage
window.addEventListener('load', () => {
    updateTable();
});

function saveExpensesTolocalStorage() {
    localStorage.setItem('expenses', JSON.stringify(expenses));
}


function updateTotalAmount() {
    totalAmount = expenses.reduce((sum, expense) => sum + expense.amount, 0);
    totalAmountCell.textContent = totalAmount;
}

function updateTable() {
    expenseTableBody.innerHTML = '';
    expenses.forEach((expense, index) => {
        const newRow = expenseTableBody.insertRow();
        newRow.innerHTML = `
            <td>${expense.category}</td>
            <td>${expense.amount}</td>
            <td>${expense.date}</td>
            <td>
                <button class="edit-btn" data-index="${index}">Edit</button>
                <button class="delete-btn" data-index="${index}">Delete</button>
            </td>
        `;
    });
    updateTotalAmount();
    updateChart();
}

function updateChart() {
    const categoryData = expenses.reduce((acc, expense) => {
        acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
        return acc;
    }, {});

    const labels = Object.keys(categoryData);
    const data = Object.values(categoryData);

    if (chart) {
        chart.destroy();
    }

    chart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0'],
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
        }
    });
}

addUpdateBtn.addEventListener('click', () => {
    const category = categorySelect.value;
    const amount = parseFloat(amountInput.value);
    const date = dateInput.value;

    if (category === '') {
        alert('Please select a category.');
        return;
    }
    if (isNaN(amount) || amount <= 0) {
        alert('Please enter a valid amount.');
        return;
    }
    if (date === '') {
        alert('Please select a date.');
        return;
    }

    if (editIndex !== null) {
        // Update existing expense
        expenses[editIndex] = { category, amount, date };
        editIndex = null;
        addUpdateBtn.textContent = "Add Expense";
    } else {
        // Add new expense
        expenses.push({ category, amount, date });
    }

    saveExpensesTolocalStorage();
    updateTable();
    amountInput.value = '';
    dateInput.value = '';
});

expenseTableBody.addEventListener('click', (e) => {
    const index = e.target.getAttribute('data-index');

    if (e.target.classList.contains('delete-btn')) {
        // Delete expense
        expenses.splice(index, 1);
        saveExpensesToSessionStorage();
        updateTable();
    } else if (e.target.classList.contains('edit-btn')) {
        // Edit expense
        const expense = expenses[index];
        categorySelect.value = expense.category;
        amountInput.value = expense.amount;
        dateInput.value = expense.date;
        editIndex = index;
        addUpdateBtn.textContent = "Update Expense";
    }
});
