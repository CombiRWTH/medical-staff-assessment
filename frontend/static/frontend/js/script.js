
const toggleButtons = document.querySelectorAll('.toggle-btn');
const submitBtn = document.querySelector('.submit-btn');
const generalTableContainer = document.getElementById('general-table-container');
const specialTableContainer = document.getElementById('special-table-container');
const showAllButtons = document.querySelectorAll('.show-all-btn');

const tableStates = {
    'general-table': false,
    'special-table': false
};

    // Function to show all checkboxes for a specific table
function showAllCheckboxes(tableId) {
    const tableContainer = document.getElementById(`${tableId}-container`);
    const containers = tableContainer.querySelectorAll('.checkboxes-container');
    const toggleBtns = tableContainer.querySelectorAll('.toggle-btn:not([data-table])');
    const selectedDisplays = tableContainer.querySelectorAll('.selected-display');

    containers.forEach((container, index) => {
        container.style.display = 'block';
        toggleBtns[index].style.display = 'none';
        selectedDisplays[index].innerHTML = '';
    });
}

// Function to hide all checkboxes for a specific table
function hideAllCheckboxes(tableId) {
    const tableContainer = document.getElementById(`${tableId}-container`);
    const containers = tableContainer.querySelectorAll('.checkboxes-container');
    const toggleBtns = tableContainer.querySelectorAll('.toggle-btn:not([data-table])');

    containers.forEach((container, index) => {
        container.style.display = 'none';
        toggleBtns[index].style.display = 'block';

        // Update selected display
        const selectedDisplay = toggleBtns[index].nextElementSibling;
        if (selectedDisplay) {
            selectedDisplay.innerHTML = '';
        }
        container.querySelectorAll('input[type="checkbox"]').forEach((checkbox) => {
            if (checkbox.checked) {
                const label = checkbox.closest('label');
                selectedDisplay.innerHTML += label.textContent + '\n';
            }
        });
    });
}

// Add event listeners for two modes
showAllButtons.forEach(button => {
    button.addEventListener('click', () => {
        const tableId = button.dataset.table;
        tableStates[tableId] = !tableStates[tableId];

        if (tableStates[tableId]) {
            showAllCheckboxes(tableId);
            button.innerHTML = 'Auswahlansicht';
            button.classList.add('active');
        } else {
            hideAllCheckboxes(tableId);
            button.innerHTML = 'Vollansicht';
            button.classList.remove('active');
        }
    });
});

// Function to show all toggle buttons
function showAllToggleButtons() {
    toggleButtons.forEach(button => {
        if (!button.dataset.table) {
            button.classList.remove('hidden');
        }
    });
}

// Close all other menus and show their toggle buttons
function closeOtherMenus(currentButton) {
    const allContainers = document.querySelectorAll('.checkboxes-container');
    allContainers.forEach(container => {
        if (container !== currentButton.previousElementSibling) {
            container.style.display = 'none';
            // Show the + button for the closed container
            const toggleBtn = container.nextElementSibling;
            if (toggleBtn) {
                toggleBtn.style.display = 'block';
                toggleBtn.classList.remove('hidden');
            }
        }
    });
}

// Modified toggle button click handler
toggleButtons.forEach((button) => {
    if (!button.dataset.table) {
        button.addEventListener('click', () => {
            const tableId = button.closest('.table-container').id.replace('-container', '');

            // Only proceed if not in show all mode
            if (!tableStates[tableId]) {
                const checkboxesContainer = button.previousElementSibling;
                const selectedDisplay = button.nextElementSibling;
                if (selectedDisplay) {
                    selectedDisplay.innerHTML = '';
                }

                closeOtherMenus(button);
                checkboxesContainer.style.display = 'block';
                button.style.display = 'none';
            }
        });
    }
});

// Add click event listener to close buttons
const closeButtons = document.querySelectorAll('.close-btn');
closeButtons.forEach((button) => {
    button.addEventListener('click', (event) => {
        const container = event.target.closest('.checkboxes-container');
        const tableId = container.closest('.table-container').id.replace('-container', '');

        // Only proceed if not in show all mode
        if (!tableStates[tableId]) {
            const toggleBtn = container.nextElementSibling;
            const selectedDisplay = toggleBtn.nextElementSibling;

            container.style.display = 'none';

            selectedDisplay.innerHTML = '';
            container.querySelectorAll('input[type="checkbox"]').forEach((checkbox) => {
                if (checkbox.checked) {
                    const label = checkbox.closest('label');
                    selectedDisplay.innerHTML += label.textContent + '\n';
                }
            });

            if (toggleBtn) {
                toggleBtn.classList.remove('hidden');
            }
        }
    });
});

// Close menu when clicking outside
document.addEventListener('click', (event) => {
    if (!event.target.closest('.checkboxes-container') &&
        !event.target.classList.contains('toggle-btn') &&
        !event.target.classList.contains('show-all-btn')) {

        // Check each table container separately
        ['general-table', 'special-table'].forEach(tableId => {
            // Only proceed if not in show all mode
            if (!tableStates[tableId]) {
                const tableContainer = document.getElementById(`${tableId}-container`);
                const containers = tableContainer.querySelectorAll('.checkboxes-container');

                containers.forEach(container => {
                    const toggleBtn = container.nextElementSibling;
                    const selectedDisplay = toggleBtn.nextElementSibling;

                    container.style.display = 'none';

                    selectedDisplay.innerHTML = '';
                    container.querySelectorAll('input[type="checkbox"]').forEach((checkbox) => {
                        if (checkbox.checked) {
                            const label = checkbox.closest('label');
                            selectedDisplay.innerHTML += label.textContent + '\n';
                        }
                    });

                    if (toggleBtn) {
                        toggleBtn.classList.remove('hidden');
                    }
                });
            }
        });
    }
});

submitBtn.addEventListener('click', () => {
    const checkedValues = [];
    const checkboxes = document.querySelectorAll('.checkboxes-container input[type="checkbox"]');
    checkboxes.forEach((checkbox) => {
        if (checkbox.checked) {
            checkedValues.push(checkbox.value);
        }
    });
    console.log(checkedValues);
    generalTableContainer.classList.remove('unsaved-changes');
    specialTableContainer.classList.remove('unsaved-changes');
});

const checkboxes = document.querySelectorAll('.checkboxes-container input[type="checkbox"]');
checkboxes.forEach((checkbox) => {
    checkbox.addEventListener('change', (event) => {
        const checkboxContainer = event.target.closest('.checkboxes-container');

        checkboxContainer.querySelectorAll('label').forEach(label => {
            label.classList.remove('checkbox-selected');
        });

        if (event.target.checked) {
            const label = event.target.closest('label');
            if (label) {
                label.classList.add('checkbox-selected');
            }
        }
    });
});

toggleButtons.forEach((button) => {
    if (button.dataset.table) {
        button.addEventListener('click', () => {
            const targetTable = button.dataset.table;
            const tableContainer = document.getElementById(`${targetTable}-container`);
            tableContainer.classList.toggle('table-hidden');
        });
    }
});
