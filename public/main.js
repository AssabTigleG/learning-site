/**
 * Handles toggling the mobile navigation menu and controlling the deep dive modal.
 */
document.addEventListener('DOMContentLoaded', () => {
    // --- Mobile Menu Logic ---
    const menuButton = document.getElementById('mobile-menu-button');
    const mobileMenu = document.getElementById('mobile-menu');

    if (menuButton && mobileMenu) {
        menuButton.addEventListener('click', () => {
            mobileMenu.classList.toggle('hidden');
        });
    }

    // --- Deep Dive Modal Logic ---
    const modal = document.getElementById('deep-dive-modal');
    const modalContent = document.getElementById('modal-content');
    const modalTitle = document.getElementById('modal-title');
    const modalBody = document.getElementById('modal-body');
    const closeModalButton = document.getElementById('close-modal-button');
    const triggers = document.querySelectorAll('.deep-dive-trigger');
    
    const openModal = (title, contentHTML) => {
        if (!modal || !modalContent || !modalTitle || !modalBody) return;
        
        modalTitle.textContent = title;
        modalBody.innerHTML = contentHTML;
        
        modal.classList.remove('invisible', 'opacity-0');
        modalContent.classList.remove('scale-95');
    };

    const closeModal = () => {
        if (!modal || !modalContent) return;
        
        modalContent.classList.add('scale-95');
        modal.classList.add('opacity-0');
        setTimeout(() => {
            modal.classList.add('invisible');
        }, 300); // Match Tailwind's duration-300
    };

    triggers.forEach(trigger => {
        trigger.addEventListener('click', (event) => {
            event.preventDefault();
            const title = trigger.dataset.title;
            const contentId = trigger.dataset.contentId;
            const contentEl = document.getElementById(contentId);

            if (contentEl) {
                openModal(title, contentEl.innerHTML);
            }
        });
    });

    if (closeModalButton) {
        closeModalButton.addEventListener('click', closeModal);
    }
    
    if (modal) {
        modal.addEventListener('click', (event) => {
            if (event.target === modal) {
                closeModal();
            }
        });
    }
});