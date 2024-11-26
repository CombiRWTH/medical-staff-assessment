const toggleButtons = document.querySelectorAll('.toggle-btn');
const submitBtn = document.querySelector('.submit-btn');
const generalTableContainer = document.getElementById('general-table-container');
const specialTableContainer = document.getElementById('special-table-container');

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

toggleButtons.forEach((button) => {
    if (!button.dataset.table) {  // Only for cell toggle buttons
        button.addEventListener('click', () => {
            const checkboxesContainer = button.previousElementSibling;
            closeOtherMenus(button);
            checkboxesContainer.style.display = 'block';
            button.style.display = 'none';
        });
    }
});

// Add click event listener to close buttons
const closeButtons = document.querySelectorAll('.close-btn');
closeButtons.forEach((button) => {
    button.addEventListener('click', (event) => {
        const container = event.target.closest('.checkboxes-container');
        container.style.display = 'none';
        // Show the + button when menu is closed
        const toggleBtn = container.nextElementSibling;
        if (toggleBtn) {
            toggleBtn.classList.remove('hidden');
        }
    });
});

// Close menu when clicking outside
document.addEventListener('click', (event) => {
    if (!event.target.closest('.checkboxes-container') &&
        !event.target.classList.contains('toggle-btn')) {
        const allContainers = document.querySelectorAll('.checkboxes-container');
        allContainers.forEach(container => {
            container.style.display = 'none';
            // Show the + button when menu is closed
            const toggleBtn = container.nextElementSibling;
            if (toggleBtn) {
                toggleBtn.classList.remove('hidden');
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
