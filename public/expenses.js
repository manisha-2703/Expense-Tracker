
document.addEventListener('DOMContentLoaded', function () {
  const submitButton = document.getElementById('submitBtn');
  const expenseTable = document.getElementById('expenseTable');
  const editForm = document.getElementById('editExpenseForm');
  const leaderboardContainer = document.getElementById('leaderboardContainer');
  const showLeaderboardBtn = document.getElementById('showLeaderboardBtn');
  const homeBtn = document.getElementById('home');
  const buyPremiumBtn = document.getElementById('buyPremiumBtn');
  const premiumMessage = document.getElementById('premiumMessage');
  const report = document.getElementById('report');
  const expenseForm=document.getElementById('expenseForm');
  const paginationDiv = document.getElementById('pagination');
  const expensesPerPageSelect = document.getElementById('expensesPerPage');
  expensesPerPageSelect.addEventListener('change', function () {
    // Fetch expenses with the new preferences
    fetchExpenses(1);
  });

  function createPaginationControls(currentPage, totalPages) {
    // Create pagination controls
    paginationDiv.innerHTML = '';

    const prevButton = document.createElement('button');
    prevButton.textContent = 'Previous';
    prevButton.addEventListener('click', () => handlePagination(currentPage - 1));
    paginationDiv.appendChild(prevButton);

    const pageInfo = document.createElement('span');
    pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;
    paginationDiv.appendChild(pageInfo);

    const nextButton = document.createElement('button');
    nextButton.textContent = 'Next';
    nextButton.addEventListener('click', () => handlePagination(currentPage + 1));
    paginationDiv.appendChild(nextButton);

    // Call this function from fetchExpenses
    function handlePagination(pageNumber) {
      fetchExpenses(pageNumber);
    }
  }

  function displayExpenses(expenses, currentPage, totalPages) {
    // Clear existing table content
    expenseTable.innerHTML = '';

    if (!Array.isArray(expenses)) {
      console.error('Invalid expenses response:', expenses);
      return;
    }

    // Create table header
    const tableHeader = document.createElement('thead');
    const headerRow = document.createElement('tr');
    const headerNames = ['Expenses', 'Description', 'Category', 'Action'];

    headerNames.forEach(name => {
      const headerCell = document.createElement('th');
      headerCell.textContent = name;
      headerRow.appendChild(headerCell);
    });

    tableHeader.appendChild(headerRow);
    expenseTable.appendChild(tableHeader);

    // Create table body
    const tableBody = document.createElement('tbody');

    if (expenses.length === 0) {
      const noDataMessage = document.createElement('tr');
      const noDataCell = document.createElement('td');
      noDataCell.colSpan = 4; // Span all columns
      noDataCell.textContent = 'No expenses available.';
      noDataMessage.appendChild(noDataCell);
      tableBody.appendChild(noDataMessage);
    } else {
      expenses.forEach((expense, index) => {
        const row = document.createElement('tr');

        // Populate table cells with expense details
        const expenseCell = document.createElement('td');
        expenseCell.textContent = `$${expense.expense}`;
        row.appendChild(expenseCell);

        const descriptionCell = document.createElement('td');
        descriptionCell.textContent = expense.description;
        row.appendChild(descriptionCell);

        const categoryCell = document.createElement('td');
        categoryCell.textContent = expense.category;
        row.appendChild(categoryCell);

        // Create action cell with edit and delete buttons
        const actionCell = document.createElement('td');

        const editButton = document.createElement('button');
        editButton.textContent = 'Edit';
        editButton.addEventListener('click', () => editExpense(expense));
        actionCell.appendChild(editButton);

        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Delete';
        deleteButton.addEventListener('click', () => deleteExpense(expense.id));
        actionCell.appendChild(deleteButton);

        row.appendChild(actionCell);

        tableBody.appendChild(row);
      });
    }

    expenseTable.appendChild(tableBody);

    // Create pagination controls
    createPaginationControls(currentPage, totalPages);
  }

  function displayLeaderboard(leaderboard) {
    leaderboardContainer.innerHTML = '';

    // Create leaderboard table
    const leaderboardTable = document.createElement('table');
    leaderboardTable.classList.add('leaderboard-table');
    leaderboardTable.style.borderCollapse = 'collapse'; // Add this line to collapse borders

    // Create table header
    const tableHeader = document.createElement('thead');
    const headerRow = document.createElement('tr');
    const headerNames = ['Serial No', 'Name', 'Total Expense'];

    headerNames.forEach(name => {
      const headerCell = document.createElement('th');
      headerCell.textContent = name;
      headerCell.style.border = '1px solid #ddd'; // Add border style
      headerRow.appendChild(headerCell);
    });

    tableHeader.appendChild(headerRow);
    leaderboardTable.appendChild(tableHeader);

    // Create table body
    const tableBody = document.createElement('tbody');

    leaderboard.forEach((user, index) => {
      const row = document.createElement('tr');

      // Populate table cells with user details
      const serialNoCell = document.createElement('td');
      serialNoCell.textContent = index + 1;
      serialNoCell.style.border = '1px solid #ddd'; // Add border style
      row.appendChild(serialNoCell);

      const nameCell = document.createElement('td');
      nameCell.textContent = user.name;
      nameCell.style.border = '1px solid #ddd'; // Add border style
      row.appendChild(nameCell);

      const totalExpenseCell = document.createElement('td');
      totalExpenseCell.textContent = `$${user.totalExpenses}`;
      totalExpenseCell.style.border = '1px solid #ddd'; // Add border style
      row.appendChild(totalExpenseCell);

      tableBody.appendChild(row);
    });

    leaderboardTable.appendChild(tableBody);
    leaderboardContainer.appendChild(leaderboardTable);
  }
  function updateUIForPremiumUser(isPremium) {
  
    if (isPremium) {
      // Hide the Buy Premium button and display the premium message
      buyPremiumBtn.style.display = 'none';
      premiumMessage.style.display = 'block';
      showLeaderboardBtn.style.display = 'block';
      report.style.display = 'block';
    } else {
      buyPremiumBtn.style.display = 'block';
      premiumMessage.style.display = 'none';
      showLeaderboardBtn.style.display = 'none';
      report.style.display = 'none';
    }
  }
  // Function to check and update premium status on page load
  async function checkAndUpdatePremiumStatus() {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:3000/users/profile', { headers: { "Authorization": token } });

      const isPremium = response.data.ispremiumuser || false;
      updateUIForPremiumUser(isPremium);
    } catch (error) {
      console.error('Error checking premium status:', error);
      // Handle the error or provide user feedback
    }
  }

  // Call the function to check and update premium status on page load
  checkAndUpdatePremiumStatus();

  // Handle the form submission and expense addition
  function handleFormSubmit() {
    event.preventDefault();

    const expense = document.getElementById('expense').value;
    const description = document.getElementById('description').value;
    const category = document.getElementById('category').value;

    const newExpense = {
      expense: parseFloat(expense),
      description: description,
      category: category,
    };

    const token = localStorage.getItem('token');

    axios.post('http://localhost:3000/expenses', newExpense, { headers: { "Authorization": token } })
      .then(response => response.data)
      .then(data => {
        fetchExpenses();
      })
      .catch(error => console.error('Error adding expense:', error));
  }  
  function fetchExpenses(pageNumber = 1) {
    const token = localStorage.getItem('token');
    const pageSize = expensesPerPageSelect.value;
  
    axios.get(`http://localhost:3000/expenses?page=${pageNumber}&pageSize=${pageSize}`, { headers: { "Authorization": token } })
      .then(response => {
        console.log('Expense API Response:', response);
  
        if (!response.data || !Array.isArray(response.data)) {
          throw new Error('Invalid data received from the server');
        }
  
        const expenses = response.data;
        const currentPage = pageNumber;
        const totalPages = Math.ceil(expenses.length / pageSize);
  
        displayExpenses(expenses, currentPage, totalPages);
      })
      .catch(error => {
        console.error('Error fetching expenses:', error.message);
        // Handle the error or provide user feedback
      });
  }
  
  

  function deleteExpense(expenseId) {
    const token = localStorage.getItem('token')
    axios.delete(`http://localhost:3000/expenses/${expenseId}`,{ headers: {"Authorization" : token} })
      .then(response => response.data)
      .then(data => {
        fetchExpenses();
      })
      .catch(error => console.error('Error deleting expense:', error));
  }

  function editExpense(expense) {
    // Populate the edit form with expense details
    document.getElementById('editExpenseId').value = expense.id;
    document.getElementById('editExpense').value = expense.expense;
    document.getElementById('editDescription').value = expense.description;
    document.getElementById('editCategory').value = expense.category;

    // Show the edit form
    editForm.style.display = 'block';
  }

  // Add event listener for the "Update Expense" button in the edit form
  document.getElementById('updateBtn').addEventListener('click', function () {
    updateExpense();
  });

  // Add event listener for the "Cancel" button in the edit form
  document.getElementById('cancelBtn').addEventListener('click', function () {
    // Hide the edit form
    editForm.style.display = 'none';
  });

  showLeaderboardBtn.addEventListener('click', function () {
    // Call the function to fetch and display the leaderboard
    fetchLeaderboard();

    // Hide the expenses form and show the leaderboard container
    expenseTable.style.display = 'none';
    editForm.style.display = 'none';
    expenseForm.style.display = 'none';
    leaderboardContainer.style.display = 'block';
  });

  // Event listener for the "Home" button
  homeBtn.addEventListener('click', function () {
    // Show the expenses form and hide the leaderboard container
    expenseForm.style.display = 'block';
    expenseTable.style.display = 'block';
    editForm.style.display = 'none';
    leaderboardContainer.style.display = 'none';
  });
  document.getElementById('report').addEventListener('click', function () {
      // Redirect to the report page
      window.location.href = 'report.html';
    });


  // Function to send a request to update the expense
  function updateExpense() {
    const id = document.getElementById('editExpenseId').value;
    const expense = document.getElementById('editExpense').value;
    const description = document.getElementById('editDescription').value;
    const category = document.getElementById('editCategory').value;

    const updatedExpense = {
      expense: parseFloat(expense),
      description: description,
      category: category,
    };

    axios.put(`http://localhost:3000/expenses/${id}`, updatedExpense)
      .then(response => response.data)
      .then(data => {
        // Hide the edit form
        editForm.style.display = 'none';

        // Fetch updated expenses
        fetchExpenses();
      })
      .catch(error => console.error('Error updating expense:', error));
  }
  submitButton.addEventListener('click', handleFormSubmit);

 
  document.getElementById('buyPremiumBtn').onclick = async function (e) {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:3000/purchase/premiummembership', { headers: { "Authorization": token } });

      var options = {
        "key": response.data.key_id,
        "order_id": response.data.order.id,
        "handler": async function (response) {
          const res = await axios.post('http://localhost:3000/purchase/updatetransactionstatus', {
            order_id: options.order_id,
            payment_id: response.razorpay_payment_id,
          }, { headers: { "Authorization": token } });

          alert('You are a Premium User Now');
          updateUIForPremiumUser(true);
          localStorage.setItem('token', res.data.token);
          // Additional logic if needed
        },
      };

      const rzp1 = new Razorpay(options);
      rzp1.open();
      e.preventDefault();

      rzp1.on('payment.failed', function (response) {
        console.log(response);
        alert('Something went wrong');
      });
    } catch (err) {
      console.log(err);
      res.status(403).json({ message: 'Something went wrong', error: err });
    }
  };

   // Fetch initial expenses on page load
   fetchExpenses();

   async function fetchLeaderboard() {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:3000/premium/showLeaderBoard', { headers: { "Authorization": token } });

      if (response.data) {
        displayLeaderboard(response.data);
      }
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      // Handle the error or provide user feedback
    }
  }
  document.getElementById('showLeaderboardBtn').addEventListener('click', function () {
    // Call the function to fetch and display the leaderboard
    fetchLeaderboard();

    // Show the leaderboard container
    leaderboardContainer.style.display = 'block';
});
});