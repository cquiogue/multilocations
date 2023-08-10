function generateTable() {
  const inputText = document.getElementById('input-text').value;

  // Split the input text into lines
  const lines = inputText.trim().split('\n');

  // Initialize variables to store the table data
  const tableData = [];
  const rearrangedTableData = [];

  // Initialize variables to store the SET_ID and column 7 values
  let currentSetId = '';
  let currentColumn7 = '';

  // Iterate through the lines
  for (const line of lines) {
    // Split the line by tabs
    const columns = line.split('\t');

    // Check if it is a SET_ID line
    if (columns[0] === 'SET_ID') {
      // Update the current SET_ID and column 7 values
      currentSetId = columns[5];
      currentColumn7 = columns[6];
      tableData.push(columns);
    } else if (
      !columns[0].startsWith('SET_ID') &&
      !columns[0].startsWith('ASSET_ID')
    ) {
      // Line doesn't start with SET_ID or ASSET_ID, apply rearrangement logic
      rearrangedTableData.push([
        currentColumn7,
        columns[6],
        '\u00A0',
        '\u00A0',
        columns[0],
        '\u00A0',
        columns[1],
      ]);
      tableData.push(columns);
    }
  }

  // Create an HTML table element for the original table
  const originalTable = createTable('Original Table', tableData);

  // Perform the combination and tallying logic
  const combinedAndTalliedData = combineAndTallyRows(rearrangedTableData);

  // Create an HTML table element for the rearranged table with combined and tallied data
  const rearrangedTable = createTable('Add New Line', combinedAndTalliedData);

  // Perform the combination and tallying logic for the third table
  const thirdTableData = createThirdTableData(tableData); // Create the third table data
  const combinedAndTalliedThirdTableData =
    combineAndTallyThirdTableData(thirdTableData);

  // Create an HTML table element for the third table with combined and tallied data
  const thirdTable = createTable(
    'Back to Bill',
    combinedAndTalliedThirdTableData
  );

  // Clear existing tables and append the new tables to the container element
  const container = document.getElementById('table-container');
  container.innerHTML = '';
  container.appendChild(originalTable);
  container.appendChild(document.createElement('br'));
  container.appendChild(rearrangedTable);
  container.appendChild(document.createElement('br'));
  container.appendChild(thirdTable);
}

function createTable(headerText, tableData) {
  const table = document.createElement('table');

  // Create a table header row
  const tableHeader = document.createElement('tr');
  const tableHeaderCell = document.createElement('th');
  tableHeaderCell.textContent = headerText;
  tableHeaderCell.colSpan = 10;
  tableHeader.appendChild(tableHeaderCell);

  // Create a copy button for the table
  const copyButton = createCopyButton(table);
  tableHeaderCell.appendChild(copyButton);

  table.appendChild(tableHeader);

  // Create and add table rows
  for (let i = 0; i < tableData.length; i++) {
    const rowData = tableData[i];
    const row = document.createElement('tr');
    for (const cellData of rowData) {
      const cell = document.createElement('td');
      cell.textContent = cellData;
      row.appendChild(cell);
    }
    table.appendChild(row);
  }

  return table;
}

function combineAndTallyRows(tableData) {
  const combinedRows = {};

  for (const rowData of tableData) {
    if (
      rowData[0] !== '\u00A0' &&
      rowData[1] !== '\u00A0' &&
      rowData[4] !== '\u00A0'
    ) {
      const key = rowData[0] + rowData[1] + rowData[4]; // Create a key using columns 1, 2, and 5
      if (!combinedRows[key]) {
        combinedRows[key] = [...rowData];
      } else {
        combinedRows[key][6] =
          parseInt(combinedRows[key][6]) + parseInt(rowData[6]); // Tally column 7 values
      }
    }
  }

  return Object.values(combinedRows);
}

function createCopyButton(table) {
  const copyButton = document.createElement('button');
  copyButton.textContent = 'Copy';
  copyButton.className = 'copy-button';
  copyButton.onclick = () => copyTableToClipboard(table, copyButton);
  return copyButton;
}

function copyTableToClipboard(table, copyButton) {
  const tableRows = table.querySelectorAll('tr');

  const range = document.createRange();
  range.selectNodeContents(table);
  for (let i = 0; i < tableRows.length; i++) {
    if (i === 0) {
      range.setStartAfter(tableRows[i]); // Exclude the header row
    }
  }

  const selection = window.getSelection();
  selection.removeAllRanges();
  selection.addRange(range);

  // Copy the selected text to the clipboard
  document.execCommand('copy');

  // Change the copy button text and disable it temporarily
  copyButton.textContent = 'Copied';
  copyButton.disabled = true;

  // Reset the copy button state after a delay
  setTimeout(() => {
    copyButton.textContent = 'Copy';
    copyButton.disabled = false;
    selection.removeAllRanges(); // Clear the selection
  }, 2000); // Adjust the delay as needed (in milliseconds)
}

function createThirdTableData(tableData) {
  const thirdTableData = [];
  const storage = document.getElementById('storage-input').value;

  for (const rowData of tableData) {
    if (
      !rowData[0].startsWith('SET_ID') &&
      !rowData[0].startsWith('ASSET_ID')
    ) {
      const thirdTableRowData = [
        rowData[0], // Column 1
        rowData[1], // Column 2
        '\u00A0', // Column 3 (empty for now)
        '\u00A0', // Column 4 (empty for now)
        '\u00A0', // Column 5 (empty for now)
        storage, // Column 6 (storage location)
        '\u00A0', // Column 7 (empty for now)
        '\u00A0', // Column 8 (empty for now)
        '\u00A0', // Column 9 (empty for now)
        rowData[9],
      ];

      thirdTableData.push(thirdTableRowData);
    }
  }

  return thirdTableData;
}

function combineAndTallyThirdTableData(tableData) {
  const combinedData = {};

  for (const rowData of tableData) {
    const key = rowData[0]; // Using the first column as the key
    if (!combinedData[key]) {
      combinedData[key] = [...rowData];
    } else {
      combinedData[key][1] =
        (parseInt(combinedData[key][1]) || 0) + (parseInt(rowData[1]) || 0); // Tally second column values

      // Set column 10 to an empty string for the combined row
      combinedData[key][9] = '';
    }
  }

  return Object.values(combinedData);
}

function clearInputs() {
  document.getElementById('input-text').value = '';

  // Clear the tables from the table-container element
  document.getElementById('table-container').innerHTML = '';

  // Scroll back to the top when Clear button is clicked
  document.body.scrollIntoView({ behavior: 'smooth' });
}
