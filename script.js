const menu = document.getElementById('contextual-menu');
const container = document.getElementById('contextual-menu-container');
let measurements = null; // Cached measurements
let relativeX = 0;
let relativeY = 0;

// Function to calculate or retrieve cached measurements
function getMeasurements() {
    if (!measurements) measurements = measure(container);
    return measurements;
}

// When opening the context menu
container.addEventListener('contextmenu', (e) => {
    e.preventDefault();
    menu.showPopover();

    let x = e.clientX;
    let y = e.clientY;
    const measurements = getMeasurements();
    const rect = container.getBoundingClientRect();
     relativeX = x - rect.left;
     relativeY = y - rect.top;

    // Adjust to avoid overflow in the container
    if (relativeX + measurements.contextualMenu.width > measurements.container.width) {
      x -=  measurements.contextualMenu.width;
    }
    if (relativeY + measurements.contextualMenu.height > measurements.container.height) {
      y -= measurements.contextualMenu.height;
    }
    menu.style.left = `${x}px`;
    menu.style.top = `${y}px`;

    // Reset any open submenus
    closeAllSubmenus();

    // Disable submenu buttons initially
    menu.querySelectorAll('.submenu button, .submenu input').forEach(btn => btn.setAttribute('tabindex', '-1'));
    menu.querySelectorAll('button').forEach((button) => {
      button.addEventListener('mouseenter', () => {
        if (!button.closest(`.submenu`)) openSubmenu(button, relativeX, relativeY);
      });
  });
    // Add keydown event listener for keyboard navigation
    document.addEventListener('keydown', keyGestion);

    // Set focus to the first main menu item
    const mainButtons = Array.from(menu.querySelectorAll(':scope > button'));
    if (mainButtons.length) {
        mainButtons[0].focus();
    }
});

// Close all open submenus
function closeAllSubmenus() {
    menu.querySelectorAll('[aria-expanded="true"]').forEach(button => {
        button.setAttribute('aria-expanded', 'false');
        const submenu = button.nextElementSibling;
        if (submenu && submenu.classList.contains('submenu')) {
          console.log(submenu.querySelectorAll('button, input'));
            submenu.querySelectorAll('button, input').forEach(btn => btn.setAttribute('tabindex', '-1'));
        }
    });
}

// Open the submenu and position it relative to the parent button,
// ensuring alignment with your design.
function openSubmenu(parentButton) {
    // Close any sibling submenus in the same level
    closeAllSubmenus();

    const submenu = parentButton.nextElementSibling;
    if (!submenu || !submenu.classList.contains('submenu')) return;

    parentButton.setAttribute('aria-expanded', 'true');

    // Position submenu: align to the right edge and top edge of the parent button.
    // (This fixed positioning can be enhanced with additional logic to avoid overflow.)
    console.log(getMeasurementsForNode(submenu), getMeasurements().container.width);
    if (relativeX + getMeasurementsForNode(submenu).width > getMeasurements().container.width) {
        submenu.style.left = 'auto';
        submenu.style.right = '100%';
    } else {
        submenu.style.left = '100%';
        submenu.style.right = 'auto';
    }

    // Enable submenu buttons for keyboard navigation.
    submenu.querySelectorAll('button, input').forEach(btn => btn.setAttribute('tabindex', '0'));
}

// Close sibling submenus in the same menu level
function closeSiblingSubmenus(currentButton) {
    const parent = currentButton.parentElement;
    if (!parent) return;
    Array.from(parent.children).forEach(child => {
        if (child !== currentButton && child.tagName === 'BUTTON' && child.getAttribute('aria-expanded') === 'true') {
            closeSubmenu(child);
        }
    });
}

// Close the submenu for the given parent button
function closeSubmenu(parentButton) {
    const submenu = parentButton.nextElementSibling;
    if (!submenu || !submenu.classList.contains('submenu')) return;
    submenu.style.display = 'none';
    parentButton.setAttribute('aria-expanded', 'false');
    submenu.querySelectorAll('button, input').forEach(btn => btn.setAttribute('tabindex', '-1'));
}

// Gestion des touches pour la navigation du menu
function keyGestion(e) {
  let active = document.activeElement;
  let currentMenu = active.closest('.submenu') || menu;
  const menuItems = Array.from(currentMenu.querySelectorAll('button:not([disabled]):not([tabindex="-1"]), input:not([disabled]):not([tabindex="-1"])'));


  const currentIndex = menuItems.indexOf(active);
  if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      let nextIndex = e.key === 'ArrowDown' ? currentIndex + 1 : currentIndex - 1;
      if (nextIndex >= menuItems.length) nextIndex = 0; // Boucle vers le premier
      if (nextIndex < 0) nextIndex = menuItems.length - 1; // Boucle vers le dernier
      menuItems[nextIndex].focus();
  } 
  else if (e.key === 'ArrowRight') {
      const submenu = active.nextElementSibling?.classList.contains('submenu') ? active.nextElementSibling : null;
      if (submenu) {
          e.preventDefault();
          openSubmenu(active);
          if (submenu.querySelector("div")) {submenu.querySelector("input")?.focus()}
          else {submenu.querySelector('button:not([disabled])')?.focus()}
      }
  } 
  else if (e.key === 'ArrowLeft') {
      const parentSubmenu = active.closest('.submenu');
      if (parentSubmenu) {
          e.preventDefault();
          const parentButton = parentSubmenu.previousElementSibling;
          closeAllSubmenus();
          parentButton.focus();
      } else {
          menu.hidePopover && menu.hidePopover();
          document.removeEventListener('keydown', keyGestion);
      }
  }
}


// Function to measure dimensions
function measure(container) {
    const submenus = Array.from(menu.querySelectorAll('.submenu')).map(submenu => ({
        node: submenu,
        width: submenu.offsetWidth,
        height: submenu.offsetHeight
    }));

    return {
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
}

function getMeasurementsForNode(node) {
    const submenu = measurements?.submenus.find(item => item.node === node);
    return submenu ? { width: submenu.width, height: submenu.height } : null;
}

document.addEventListener('ondomcontentloaded', () => {
    measurements = measure(container);
    closeAllSubmenus();
});