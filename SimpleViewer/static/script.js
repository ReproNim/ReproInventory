document.addEventListener('DOMContentLoaded', function () {
    let allData = [];

    fetch('/api/data')
        .then(response => response.json())
        .then(data => {
            allData = data;
            renderTable(data);
        });

    document.getElementById('levelFilter').addEventListener('change', applyFilters);
    document.getElementById('searchBox').addEventListener('input', applyFilters);

    function applyFilters() {
        const selectedLevel = document.getElementById('levelFilter').value.toLowerCase();
        const searchTerm = document.getElementById('searchBox').value.toLowerCase();

        const filteredData = allData.filter(row => {
            const levelMatch = selectedLevel ? row.Level.toLowerCase().includes(selectedLevel) : true;
            const nameMatch = row["Course Name"].toLowerCase().includes(searchTerm);
            return levelMatch && nameMatch;
        });

        renderTable(filteredData);
    }

	function renderTable(data) {
	    const table = document.getElementById('data-table');
	    const thead = table.querySelector('thead tr');
	    const tbody = table.querySelector('tbody');

	    thead.innerHTML = '';
	    tbody.innerHTML = '';

	    if (data.length === 0) return;

	    // Define the desired column order
	    const headers = ['ID', 'Course Name', 'Level', 'Keywords'];

	    // Create table headers
	    headers.forEach(header => {
	        const th = document.createElement('th');
	        th.textContent = header;
	        thead.appendChild(th);
	    });

	    // Create table rows
	    data.forEach(row => {
	        const tr = document.createElement('tr');
	        headers.forEach(header => {
	            const td = document.createElement('td');
	            td.textContent = row[header];
	            tr.appendChild(td);
	        });
	        tbody.appendChild(tr);
	    });
	}
});

