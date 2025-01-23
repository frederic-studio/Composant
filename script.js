const menu = document.getElementById('contextual-menu');
const container = document.getElementById('contextual-menu-container');
let measurements = null; // Cached measurements

// Function to calculate or retrieve cached measurements
function getMeasurements() {
    if (!measurements) {
        measurements = mesure(container); // Calculate if not already done
    }
    return measurements;
}

// Add event listener for context menu
container.addEventListener('contextmenu', (e) => {
    e.preventDefault();
    menu.showPopover(); // Ensure the menu is shown after positioning
    let submenu = menu.querySelectorAll('*:has(.submenu)')
    submenu.forEach((item) => item.setAttribute('data-position-inline', ''));
    submenu.forEach((item) => item.setAttribute('data-position-block', ''));
    // Get or calculate measurements
    const measurements = getMeasurements();

    // Get the cursor position
    let x = e.clientX;
    let y = e.clientY;

    // Get the container's position and dimensions
    const rect = container.getBoundingClientRect();
    const relativeX = x - rect.left; // Cursor position relative to container
    const relativeY = y - rect.top;  // Cursor position relative to container

    // Check for overflow relative to the container
    if (relativeX + measurements.contextualMenu.width > measurements.container.width) {
        x -= measurements.contextualMenu.width; // Adjust horizontally
        submenu.forEach((item) => item.setAttribute('data-position-inline', 'right'));
    }
    if (relativeY + measurements.contextualMenu.height > measurements.container.height) {
        console.log('Y', y);
        y -= measurements.contextualMenu.height; // Adjust vertically
        submenu.forEach((item) => item.setAttribute('data-position-block', 'bottom'));
    } 

    // Position the menu
    menu.style.left = `${x}px`;
    menu.style.top = `${y}px`;
});

// Update measurements on resize
window.addEventListener('resize', () => {
    measurements = mesure(container); // Recalculate on resize
});

// Function to measure dimensions
function mesure(container) {
    const submenus = Array.from(menu.querySelectorAll('.submenu')).map(submenu => ({
        node: submenu,
        width: submenu.offsetWidth,
        height: submenu.offsetHeight
    }));

    const dimensions = {
        container: {
            width: container.offsetWidth,
            height: container.offsetHeight
        },
        contextualMenu: {
            width: menu.offsetWidth,
            height: menu.offsetHeight
        },
        submenus: submenus
    };

    return dimensions;
}

// Get measurements for a specific node
function getMeasurementsForNode(node) {
    const submenu = measurements?.submenus.find(item => item.node === node);
    return submenu ? { width: submenu.width, height: submenu.height } : null;
}
