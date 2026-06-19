// LOGIN CHECK - must be first
if (localStorage.getItem("loggedIn") !== "true") {
    window.location.href = "login.html";
}

const currentUser = localStorage.getItem("currentUser");
document.getElementById("welcomeUser").innerText = "Hi, " + currentUser;

function logout() {
    localStorage.removeItem("loggedIn");
    localStorage.removeItem("currentUser");
    window.location.href = "login.html";
}

// ... rest of your expense tracker code below this
let categoryData = {
    Food: 0, Travel: 0,
    rent: 0, fuel: 0, recharge: 0, education: 0,
    medical: 0, entertainment: 0, loan: 0, 
    savings: 0, others: 0
};

let totalExpense = 0;
let salary = 0;

// Init chart ONCE, outside the function
const ctx = document.getElementById('expenseChart');
const expenseChart = new Chart(ctx, {
    type: 'pie',
    data: {
        labels: Object.keys(categoryData),
        datasets: [{ data: Object.values(categoryData) }]
    }
});

function addExpense() {
    salary = Number(document.getElementById("salary").value);
    let category = document.getElementById("category").value;
    let amount = Number(document.getElementById("amount").value);
    fetch("http://localhost:3000/addExpense", {
       method: "POST",
       headers: {
         "Content-Type": "application/json"
      },
      body: JSON.stringify({
        category: category,
        amount: amount
     })
   })
   .then(response => response.json())
   .then(data => {
     console.log(data.message);
   })
   .catch(error => {
     console.error(error);
   });
    
    if (categoryData[category]!== undefined && amount > 0) {
        categoryData[category] += amount;
        totalExpense += amount;
        
        // Update chart
        expenseChart.data.datasets[0].data = Object.values(categoryData);
        expenseChart.update();
        
        // Update table
        let table = document.getElementById("expenseList");
        let row = table.insertRow();
        let cell1 = row.insertCell(0);
        let cell2 = row.insertCell(1);
        let cell3 = row.insertCell(2);
        
        cell1.innerHTML = category;
        cell2.innerHTML = amount;
        
        // Delete button
        let deleteButton = document.createElement("button");
        deleteButton.innerHTML = "Delete";
        deleteButton.onclick = function() {
            categoryData[category] -= amount; // Fix: update category too
            totalExpense -= amount;
            
            let balance = salary - totalExpense;
            document.getElementById("balance").innerHTML = balance;
            document.getElementById("totalExpense").innerHTML = totalExpense;
            document.getElementById("balanceCard").innerHTML = "₹" + balance;
            document.getElementById("expenseCard").innerHTML = "₹" + totalExpense;
            let expensePercent = (totalExpense / salary) * 100;
            let savingsPercent = (balance / salary) * 100;
            document.getElementById("budgetAnalysis").innerHTML =
            "Expenses: " + expensePercent.toFixed(2) + "%<br>" +
            "Savings: " + savingsPercent.toFixed(2) + "%";
            
            expenseChart.data.datasets[0].data = Object.values(categoryData);
            expenseChart.update();
            row.remove();
        };
        cell3.appendChild(deleteButton);
        
        // Update totals
        let balance = salary - totalExpense;
        document.getElementById("totalExpense").innerHTML = totalExpense;
        document.getElementById("balance").innerHTML = balance;
        document.getElementById("salaryCard").innerHTML = "₹" + salary;
        document.getElementById("expenseCard").innerHTML = "₹" + totalExpense;
        document.getElementById("balanceCard").innerHTML = "₹" + balance;
        // Budget Analysis
        let expensePercent = (totalExpense / salary) * 100;
        let savingsPercent = (balance / salary) * 100;

        let status = "";
        if(expensePercent < 50){
        status = "🟢 Excellent Saving";
        }
        else if(expensePercent < 80){
    status = "🟡 Good Budget Control";
        }
        else{
        status = "🔴 High Spending";
        }

        document.getElementById("budgetAnalysis").innerHTML =
        expensePercent.toFixed(1) + "%<br>" +
        status;
        document.getElementById("amount").value = "";
    }
}
async function loadExpenses() {
  // 1. Create variables first - this fixes your error
  let categoryData = {};
  let totalExpense = 0;
  
  try {
    // 2. Get data from backend
    const response = await fetch("http://localhost:3000/expenses");
    const expenses = await response.json();
    console.log(expenses);

    // 3. Clear old table rows first
    const tableBody = document.getElementById("expenseTableBody");
    tableBody.innerHTML = "";

    // 4. Loop and display each expense
    expenses.forEach(exp => {
      // Calculate totals
      if (!categoryData[exp.category]) {
        categoryData[exp.category] = 0;
      }
      categoryData[exp.category] += exp.amount;
      totalExpense += exp.amount;

      // Add row to table
      const row = `<tr>
        <td>${exp.category}</td>
        <td>₹${exp.amount}</td>
        <td>${new Date(exp.date).toLocaleDateString()}</td>
      </tr>`;
      tableBody.innerHTML += row;
    });

    // 5. Update total
    document.getElementById("totalExpense").innerText = `Total: ₹${totalExpense}`;

  } catch (error) {
    console.log("Error loading expenses:", error);
  }
}

// Call this when page loads
loadExpenses();
// This makes loadExpenses run automatically when page loads
document.addEventListener("DOMContentLoaded", loadExpenses);
// 1. Your form submit code - keep this on top
document.getElementById("expenseForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  // ...your POST code...
  loadExpenses(); // add this line at end to refresh table
});

// 2. PASTE THE loadExpenses FUNCTION HERE - below the form code
async function loadExpenses() {
  let categoryData = {};
  let totalExpense = 0;
  // ...rest of code I gave you...
}

// 3. PASTE THIS LINE AT VERY BOTTOM - last line of file
document.addEventListener("DOMContentLoaded", loadExpenses);
async function showHistory() {
    document.getElementById("historySection").style.display = "block";

    const response = await fetch("http://localhost:3000/getExpenses");
    const expenses = await response.json();

    let table = document.getElementById("historyTable");

    table.innerHTML = `
        <tr>
            <th>Category</th>
            <th>Amount</th>
            <th>Date</th>
        </tr>
    `;

    expenses.forEach(expense => {
        let row = table.insertRow();

        row.insertCell(0).innerText = expense.category;
        row.insertCell(1).innerText = "₹" + expense.amount;
        row.insertCell(2).innerText =
            new Date(expense.date).toLocaleDateString();
    });
}