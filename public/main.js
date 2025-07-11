/**
 * Handles toggling the mobile menu, deep dive modal, and concept inspector panel.
 */
document.addEventListener('DOMContentLoaded', () => {
    // --- Mobile Menu Logic ---
    const menuButton = document.getElementById('mobile-menu-button');
    const mobileMenu = document.getElementById('mobile-menu');
    if (menuButton && mobileMenu) {
        menuButton.addEventListener('click', () => mobileMenu.classList.toggle('hidden'));
    }

    // --- Deep Dive Modal Logic ---
    const modal = document.getElementById('deep-dive-modal');
    if (modal) {
        const modalContent = document.getElementById('modal-content');
        const modalTitle = document.getElementById('modal-title');
        const modalBody = document.getElementById('modal-body');
        const closeModalButton = document.getElementById('close-modal-button');
        const deepDiveTriggers = document.querySelectorAll('.deep-dive-trigger');

        const openModal = (title, contentHTML) => {
            if (!modal || !modalContent || !modalTitle || !modalBody) return;
            modalTitle.textContent = title;
            modalBody.innerHTML = contentHTML;
            modal.classList.remove('hidden'); // Fix: Remove hidden class
            setTimeout(() => { // Allow display property to apply before starting transition
                modal.classList.remove('opacity-0');
                modalContent.classList.remove('scale-95');
            }, 10);
        };

        const closeModal = () => {
            if (!modal || !modalContent) return;
            modalContent.classList.add('scale-95');
            modal.classList.add('opacity-0');
            setTimeout(() => modal.classList.add('hidden'), 300); // Match Tailwind's duration-300
        };

        deepDiveTriggers.forEach(trigger => {
            trigger.addEventListener('click', (event) => {
                event.preventDefault();
                const title = trigger.dataset.title;
                const contentId = trigger.dataset.contentId;
                const contentEl = document.getElementById(contentId);
                if (contentEl) openModal(title, contentEl.innerHTML);
            });
        });

        if (closeModalButton) closeModalButton.addEventListener('click', closeModal);
        modal.addEventListener('click', (event) => {
            if (event.target === modal) closeModal();
        });
    }

    // --- Concept Inspector Logic ---
    const inspectorPanel = document.getElementById('inspector-panel');
    if (inspectorPanel) {
        const inspectorTitle = document.getElementById('inspector-title');
        const inspectorBody = document.getElementById('inspector-body');
        const inspectorCloseButton = document.getElementById('inspector-close-button');
        const inspectorTriggers = document.querySelectorAll('.inspector-trigger');
        const mainContent = document.getElementById('main-content');

        const openInspector = (topicId) => {
            const contentEl = document.getElementById(topicId);
            if (!contentEl || !inspectorTitle || !inspectorBody) return;

            // Use the data-inspector-title if it exists, otherwise create one from the trigger text.
            inspectorTitle.textContent = contentEl.dataset.inspectorTitle || trigger.textContent;
            inspectorBody.innerHTML = contentEl.innerHTML;

            inspectorPanel.classList.remove('translate-x-full');
            mainContent.classList.add('md:w-2/3');
            mainContent.classList.add('md:mr-[33.333333%]'); // Push main content to the left
        };
        
        const closeInspector = () => {
            inspectorPanel.classList.add('translate-x-full');
            mainContent.classList.remove('md:w-2/3');
            mainContent.classList.remove('md:mr-[33.333333%]');
        };

        inspectorTriggers.forEach(trigger => {
            trigger.addEventListener('click', (event) => {
                event.preventDefault();
                const topicId = trigger.dataset.inspectorTopic;
                openInspector(topicId);
            });
        });

        if (inspectorCloseButton) inspectorCloseButton.addEventListener('click', closeInspector);
    }
});