document.addEventListener('DOMContentLoaded', () => {
    /**
     * Initializes the simple dropdown mobile menu for static pages.
     */
    const initializeSimpleMobileMenu = () => {
        const menuButton = document.getElementById('mobile-menu-button');
        const mobileMenu = document.getElementById('mobile-menu');

        if (menuButton && mobileMenu) {
            menuButton.addEventListener('click', (event) => {
                event.stopPropagation();
                mobileMenu.classList.toggle('hidden');
            });
        }
    };

    initializeSimpleMobileMenu();
});