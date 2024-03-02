document.addEventListener('DOMContentLoaded', function () {
  const monthHeading = document.getElementById('monthHeading');
  const reportTableBody = document.querySelector('#reportTable tbody');
  const totalSalaryExpenses = document.getElementById('totalSalaryExpenses');
  const totalExpensesWithoutSalary = document.getElementById('totalExpensesWithoutSalary');
  const savings = document.getElementById('savings');
  const downloadExpensesBtn = document.getElementById('downloadThisReportBtn'); // Corrected button ID
  const filesList = document.getElementById('filesList');

  // Fetch and display expenses for the current month
  fetchExpensesForCurrentMonth();

  
  async function fetchExpensesForCurrentMonth() {
      try {
          const token = localStorage.getItem('token');
          const currentDate = new Date();
          const currentMonth = currentDate.toLocaleString('default', { month: 'long' });
          const currentYear = currentDate.getFullYear();

          const response = await axios.get(`http://13.48.85.81:3000/expenses?month=${currentMonth}&year=${currentYear}`, {
              headers: { "Authorization": token }
          });

          if (response.data) {
              // Display the current month in the heading
              monthHeading.textContent = `${currentMonth} ${currentYear}`;

              // Clear existing table content
              reportTableBody.innerHTML = '';

              // Process and display each expense
              response.data.forEach(expense => {
                  const row = document.createElement('tr');

                  const dateCell = document.createElement('td');
                  dateCell.textContent = expense.date;
                  row.appendChild(dateCell);

                  const categoryCell = document.createElement('td');
                  categoryCell.textContent = expense.category;
                  row.appendChild(categoryCell);

                  const descriptionCell = document.createElement('td');
                  descriptionCell.textContent = expense.description;
                  row.appendChild(descriptionCell);

                  const expensesCell = document.createElement('td');
                  expensesCell.textContent = `$${expense.expense}`;
                  row.appendChild(expensesCell);

                  reportTableBody.appendChild(row);
              });

              // Calculate and display total salary expenses, total expenses (without salary), and savings
              const salaryExpenses = response.data.filter(expense => expense.category.toLowerCase() === 'salary');
              const expensesWithoutSalary = response.data.filter(expense => expense.category.toLowerCase() !== 'salary');

              const totalSalary = salaryExpenses.reduce((total, expense) => total + expense.expense, 0);
              const totalWithoutSalary = expensesWithoutSalary.reduce((total, expense) => total + expense.expense, 0);
              const totalSavings = totalSalary - totalWithoutSalary;

              totalSalaryExpenses.textContent = `$${totalSalary}`;
              totalExpensesWithoutSalary.textContent = `$${totalWithoutSalary}`;
              savings.textContent = `$${totalSavings}`;

              // Enable download button for premium users
              const isPremiumUser = true; // Replace with your premium user check logic
              downloadExpensesBtn.disabled = !isPremiumUser;
          }
      } catch (error) {
          console.error('Error fetching expenses for the report:', error);
      }
  }

  // Add event listener for the "Home" button
  document.getElementById('home').addEventListener('click', function () {
      // Redirect to the home page
      window.location.href = 'expenses.html';
  });

  // Add event listener for the "Download This Report" button
  downloadExpensesBtn.addEventListener('click', async function () {
      try {
          const token = localStorage.getItem('token');
          const response = await axios.get('http://13.48.85.81:3000/expenses/download', {
              headers: { "Authorization": token },
          });

          // Assuming downloadResponse.data contains the file URL
          const fileURL = response.data.fileURL;
          console.log('File URL:', fileURL);

          // Add the file URL to the files list
          const listItem = document.createElement('li');
          listItem.textContent = `File: ${fileURL}, Downloaded on: ${new Date().toLocaleString()}`;
          filesList.appendChild(listItem);
      } catch (error) {
          console.error('Error downloading expenses:', error);
      }
  });

  const showDownloadedFilesBtn = document.getElementById('showDownloadedFilesBtn');
showDownloadedFilesBtn.addEventListener('click', async function () {
    console.log('Button clicked');

    try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://13.48.85.81:3000/expenses/download-history', {
            headers: { "Authorization": token },
        });

        console.log('Response:', response);

        // Check if the response contains downloadHistory
        console.log('Download History:', response.data.downloadHistory);

        // Clear existing files list
        filesList.innerHTML = '';

        // Process and display each downloaded file
        response.data.downloadHistory.forEach(download => {
            const listItem = document.createElement('li');
            listItem.textContent = `File: ${download.fileUrl}, Downloaded on: ${new Date(download.downloadDate).toLocaleString()}`;
            filesList.appendChild(listItem);
        });
    } catch (error) {
        console.error('Error fetching downloaded files:', error);
    }
});


});
