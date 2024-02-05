document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('expenseForm');
    const submitButton = document.getElementById('submitBtn');
    const expenseListContainer = document.getElementById('expenseList');
    const editForm = document.getElementById('editExpenseForm');
    const signupForm = document.getElementById('signupForm');
    const signupBtn = document.getElementById('signupBtn');
    const signupPage = document.getElementById('signupPage');
    const expensesPage = document.getElementById('expensesPage');

    function hideForm(form) {
        form.style.display = 'none';
    }

    function showForm(form) {
        form.style.display = 'block';
    }

    function hidePage(page) {
        page.style.display = 'none';
    }

    function showPage(page) {
        page.style.display = 'block';
    }

    function handleSignupSubmit() {
        event.preventDefault();
        const name = document.getElementById('signupName').value;
        const email = document.getElementById('signupEmail').value;
        const password = document.getElementById('signupPassword').value;

        const newUser = {
            name:name,
            email: email,
            password: password,
        };

        axios.post('http://localhost:3000/users/signup', newUser)
            .then(response => response.data)
            .then(data => {
                console.log('User signed up successfully:', data);
                hidePage(signupPage);
                showPage(expensesPage);
                fetchExpenses(); // Fetch expenses upon navigating to the expenses page
            })
            .catch(error => console.error('Error signing up user:', error));
    }

    signupBtn.addEventListener('click', handleSignupSubmit);

    function displayExpenses(expenses) {
        expenseListContainer.innerHTML = '';

        if (!Array.isArray(expenses)) {
            console.error('Invalid expenses response:', expenses);
            return;
        }

        expenses.forEach((expense, index) => {
            const expenseDiv = document.createElement('div');
            expenseDiv.classList.add('expense-details');

            const expenseParagraph = document.createElement('p');
            expenseParagraph.textContent = `Expense: $${expense.expense}`;

            const descriptionParagraph = document.createElement('p');
            descriptionParagraph.textContent = `Description: ${expense.description}`;

            const categoryParagraph = document.createElement('p');
            categoryParagraph.textContent = `Category: ${expense.category}`;

            const editButton = document.createElement('button');
            editButton.textContent = 'Edit';
            editButton.addEventListener('click', () => editExpense(expense));

            const deleteButton = document.createElement('button');
            deleteButton.textContent = 'Delete';
            deleteButton.addEventListener('click', () => deleteExpense(expense.id));

            expenseDiv.appendChild(expenseParagraph);
            expenseDiv.appendChild(descriptionParagraph);
            expenseDiv.appendChild(categoryParagraph);
            expenseDiv.appendChild(editButton);
            expenseDiv.appendChild(deleteButton);

            expenseListContainer.appendChild(expenseDiv);
        });
    }

    function handleFormSubmit() {
        event.preventDefault();
    
        const expenseInput = document.getElementById('expense');
        const descriptionInput = document.getElementById('description');
        const categoryInput = document.getElementById('category');
    
      
        if (!expenseInput || !descriptionInput || !categoryInput) {
            console.error('Form elements not found.');
            return;
        }
    
        const expense = expenseInput.value;
        const description = descriptionInput.value;
        const category = categoryInput.value;
    
        const newExpense = {
            expense: parseFloat(expense),
            description: description,
            category: category,
        };
    
        axios.post('http://localhost:3000/expenses', newExpense)
            .then(response => response.data)
            .then(data => {
                fetchExpenses();
            })
            .catch(error => console.error('Error adding expense:', error));
    }
    
    function fetchExpenses() {
        axios.get('http://localhost:3000/expenses')
            .then(response => {
                if (!response.data) {
                    throw new Error('No data received from the server');
                }
                displayExpenses(response.data);
            })
            .catch(error => {
                console.error(error);
            });
    }

    function deleteExpense(expenseId) {
        axios.delete(`http://localhost:3000/expenses/${expenseId}`)
            .then(response => response.data)
            .then(data => {
                fetchExpenses();
            })
            .catch(error => console.error('Error deleting expense:', error));
    }

    function editExpense(expense) {
        document.getElementById('editExpenseId').value = expense.id;
        document.getElementById('editExpense').value = expense.expense;
        document.getElementById('editDescription').value = expense.description;
        document.getElementById('editCategory').value = expense.category;

        editForm.style.display = 'block';
    }

    document.getElementById('updateBtn').addEventListener('click', function () {
        updateExpense();
    });

    document.getElementById('cancelBtn').addEventListener('click', function () {
        editForm.style.display = 'none';
    });

    submitButton.addEventListener('click', handleFormSubmit);

    fetchExpenses();
});
