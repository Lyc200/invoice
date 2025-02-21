let invoices = JSON.parse(localStorage.getItem("invoices")) || [];

// Add a new item row
function addItem() {
    const table = document.getElementById("invoiceTable").getElementsByTagName("tbody")[0];
    const row = table.insertRow();
    row.innerHTML = `
        <td><input type="text" class="item-name input-field" placeholder="Item name"></td>
        <td><input type="number" class="item-qty input-field" value="1" min="1" oninput="updateTotal(this)"></td>
        <td><input type="number" class="item-price input-field" value="0" min="0" oninput="updateTotal(this)"></td>
        <td class="item-total">0.00</td>
        <td><button onclick="removeItem(this)" class="remove-btn">Remove</button></td>
    `;
}

// Update the total for an item
function updateTotal(input) {
    const row = input.closest("tr");
    const qty = row.querySelector(".item-qty").value;
    const price = row.querySelector(".item-price").value;
    const total = qty * price;
    row.querySelector(".item-total").textContent = total.toFixed(2);
    updateGrandTotal();
}

// Update the grand total
function updateGrandTotal() {
    const totals = document.querySelectorAll(".item-total");
    let grandTotal = 0;
    totals.forEach(total => {
        grandTotal += parseFloat(total.textContent);
    });
    document.getElementById("grandTotal").textContent = grandTotal.toFixed(2);
}

// Remove an item row
function removeItem(button) {
    const row = button.closest("tr");
    row.remove();
    updateGrandTotal();
}

// Clear the invoice
function clearInvoice() {
    document.getElementById("customerName").value = "";
    document.getElementById("invoiceTable").getElementsByTagName("tbody")[0].innerHTML = "";
    document.getElementById("grandTotal").textContent = "0.00";
}

// Save the invoice
function saveInvoice() {
    const customerName = document.getElementById("customerName").value.trim();
    if (!customerName) {
        alert("Please enter the customer name.");
        return;
    }

    const items = [];
    document.querySelectorAll("#invoiceTable tbody tr").forEach(row => {
        const itemName = row.querySelector(".item-name").value.trim();
        const qty = row.querySelector(".item-qty").value;
        const price = row.querySelector(".item-price").value;
        if (itemName && qty && price) {
            items.push({ itemName, qty, price });
        }
    });

    if (items.length === 0) {
        alert("Please add at least one item.");
        return;
    }

    const invoice = {
        customerName,
        items,
        grandTotal: document.getElementById("grandTotal").textContent
    };

    invoices.push(invoice);
    localStorage.setItem("invoices", JSON.stringify(invoices));
    alert("Invoice saved successfully!");
    clearInvoice();
}

// Display saved customers
function displayCustomers() {
    const customerList = document.getElementById("customerList");
    customerList.innerHTML = "";

    const searchQuery = document.getElementById("searchInput").value.toLowerCase();
    const filteredInvoices = invoices.filter(invoice => 
        invoice.customerName.toLowerCase().includes(searchQuery)
    );

    filteredInvoices.forEach((invoice, index) => {
        const customerItem = document.createElement("div");
        customerItem.className = "record-item";
        customerItem.innerHTML = `
            <span>${invoice.customerName}</span>
            <div>
                <button onclick="editInvoice(${index})">Edit</button>
                <button onclick="deleteInvoice(${index})">Delete</button>
            </div>
        `;
        customerList.appendChild(customerItem);
    });
}

// Edit an invoice
function editInvoice(index) {
    localStorage.setItem("editIndex", index);
    window.location.href = "index.html";
}

// Delete an invoice
function deleteInvoice(index) {
    if (confirm("Are you sure you want to delete this invoice?")) {
        invoices.splice(index, 1);
        localStorage.setItem("invoices", JSON.stringify(invoices));
        displayCustomers();
    }
}

// Load invoice for editing
function loadInvoiceForEditing() {
    const editIndex = localStorage.getItem("editIndex");
    if (editIndex !== null) {
        const invoice = invoices[editIndex];
        document.getElementById("customerName").value = invoice.customerName;
        invoice.items.forEach(item => {
            addItem();
            const row = document.querySelector("#invoiceTable tbody tr:last-child");
            row.querySelector(".item-name").value = item.itemName;
            row.querySelector(".item-qty").value = item.qty;
            row.querySelector(".item-price").value = item.price;
            updateTotal(row.querySelector(".item-qty"));
        });
        localStorage.removeItem("editIndex");
    }
}

// Download as image
function downloadAsImage() {
    const printInvoice = document.getElementById("print-invoice");
    const printCustomerName = document.getElementById("print-customer-name");
    const printInvoiceTable = document.getElementById("print-invoice-table").getElementsByTagName("tbody")[0];
    const printGrandTotal = document.getElementById("print-grand-total");

    printCustomerName.textContent = document.getElementById("customerName").value;
    printInvoiceTable.innerHTML = "";

    document.querySelectorAll("#invoiceTable tbody tr").forEach(row => {
        const itemName = row.querySelector(".item-name").value;
        const qty = row.querySelector(".item-qty").value;
        const price = row.querySelector(".item-price").value;
        const total = row.querySelector(".item-total").textContent;

        const newRow = document.createElement("tr");
        newRow.innerHTML = `
            <td>${itemName}</td>
            <td>${qty}</td>
            <td>${price}</td>
            <td>${total}</td>
        `;
        printInvoiceTable.appendChild(newRow);
    });

    printGrandTotal.textContent = document.getElementById("grandTotal").textContent;
    printInvoice.style.display = "block";

    html2canvas(printInvoice, { scale: 2 })
        .then(canvas => {
            const link = document.createElement("a");
            link.href = canvas.toDataURL("image/png");
            link.download = "invoice.png";
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        })
        .finally(() => {
            printInvoice.style.display = "none";
        });
}

// Initialize on page load
window.onload = () => {
    if (window.location.pathname.endsWith("index.html")) {
        loadInvoiceForEditing();
    } else if (window.location.pathname.endsWith("saved-invoices.html")) {
        displayCustomers();
        document.getElementById("searchInput").addEventListener("input", displayCustomers);
    }
};