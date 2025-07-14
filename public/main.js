document.addEventListener('DOMContentLoaded', () => {
    /**
     * Dynamically loads HTML partials into elements with `data-include` attributes.
     * @returns {Promise<void>} A promise that resolves when all partials are loaded.
     */
    const loadPartials = async () => {
        const includeElements = document.querySelectorAll('[data-include]');
        const fetchPromises = [];

        includeElements.forEach(el => {
            const filePath = el.getAttribute('data-include');
            const fetchPromise = fetch(filePath)
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`Could not load partial: ${filePath}`);
                    }
                    return response.text();
                })
                .then(html => {
                    el.innerHTML = html;
                })
                .catch(error => {
                    el.innerHTML = `<p class="text-red-400">Error loading content: ${error.message}</p>`;
                    console.error(error);
                });
            fetchPromises.push(fetchPromise);
        });

        await Promise.all(fetchPromises);
    };

    /**
     * Toggles the visibility of the mobile progress navigator.
     */
    const initializeMobileMenu = () => {
        const menuButton = document.getElementById('mobile-menu-button');
        const navigator = document.getElementById('progress-navigator');
        const overlay = document.getElementById('mobile-navigator-overlay');
        
        if (!menuButton || !navigator || !overlay) return;

        const openMobileNavigator = () => {
            navigator.classList.remove('-translate-x-full');
            overlay.classList.remove('hidden');
        };

        const closeMobileNavigator = () => {
            navigator.classList.add('-translate-x-full');
            overlay.classList.add('hidden');
        };

        menuButton.addEventListener('click', openMobileNavigator);
        overlay.addEventListener('click', closeMobileNavigator);

        // Make the close function globally accessible for other parts of the script
        window.closeMobileNavigator = closeMobileNavigator;
    };

    /**
     * Handles the functionality for the deep-dive explanation modal.
     */
    const initializeDeepDiveModal = () => {
        const modal = document.getElementById('deep-dive-modal');
        if (!modal) return;

        const modalContent = document.getElementById('modal-content');
        const modalTitle = document.getElementById('modal-title');
        const modalBody = document.getElementById('modal-body');
        const closeModalButton = document.getElementById('close-modal-button');
        
        const openModal = (title, contentHTML) => {
            if (!modalContent || !modalTitle || !modalBody) return;
            modalTitle.textContent = title;
            modalBody.innerHTML = contentHTML;
            modal.classList.remove('hidden');
            setTimeout(() => {
                modal.classList.remove('opacity-0');
                modalContent.classList.remove('scale-95');
            }, 10);
        };

        const closeModal = () => {
            if (!modal || !modalContent) return;
            modalContent.classList.add('scale-95');
            modal.classList.add('opacity-0');
            setTimeout(() => modal.classList.add('hidden'), 300);
        };

        // Use event delegation on a parent container
        const mainContent = document.getElementById('main-content');
        if (mainContent) {
            mainContent.addEventListener('click', (event) => {
                const trigger = event.target.closest('.deep-dive-trigger');
                if (trigger) {
                    event.preventDefault();
                    const title = trigger.dataset.title;
                    const contentId = trigger.dataset.contentId;
                    const contentEl = document.getElementById(contentId);
                    if (contentEl) openModal(title, contentEl.innerHTML);
                }
            });
        }
        
        if (closeModalButton) closeModalButton.addEventListener('click', closeModal);
        modal.addEventListener('click', (event) => {
            if (event.target === modal) closeModal();
        });
    };

    /**
     * Manages the slide-in concept inspector panel.
     */
    const initializeInspectorPanel = () => {
        const inspectorPanel = document.getElementById('inspector-panel');
        if (!inspectorPanel) return;

        const inspectorTitle = document.getElementById('inspector-title');
        const inspectorBody = document.getElementById('inspector-body');
        const inspectorCloseButton = document.getElementById('inspector-close-button');
        const mainContent = document.getElementById('main-content');

        const openInspector = (topicId) => {
            const contentEl = document.getElementById(topicId);
            if (!contentEl || !inspectorTitle || !inspectorBody) return;

            inspectorTitle.textContent = contentEl.dataset.inspectorTitle || 'Details';
            inspectorBody.innerHTML = contentEl.innerHTML;

            inspectorPanel.classList.remove('translate-x-full');
            mainContent.classList.add('md:w-2/3', 'md:mr-[33.333333%]');
        };

        const closeInspector = () => {
            inspectorPanel.classList.add('translate-x-full');
            mainContent.classList.remove('md:w-2/3', 'md:mr-[33.333333%]');
        };

        if (mainContent) {
            mainContent.addEventListener('click', (event) => {
                const trigger = event.target.closest('.inspector-trigger');
                if(trigger) {
                    event.preventDefault();
                    const topicId = trigger.dataset.inspectorTopic;
                    openInspector(topicId);
                }
            });
        }

        if (inspectorCloseButton) inspectorCloseButton.addEventListener('click', closeInspector);
    };

    /**
     * Powers the interactive progress navigator sidebar on project pages.
     */
    const initializeProgressNavigator = () => {
        const navigator = document.getElementById('progress-navigator');
        if (!navigator) return;

        const PROJECT_ID = 'habit_tracker_progress';
        const allLessonItems = Array.from(navigator.querySelectorAll('.lesson-item'));
        const allLessonIds = allLessonItems.map(item => item.dataset.lessonId);
        
        const chapterItems = navigator.querySelectorAll('.chapter-item');
        const overallProgressBar = document.getElementById('overall-progress-bar');
        const resetButton = document.getElementById('reset-progress-button');
        
        // --- Icon Definitions ---
        const statusIcons = {
            completed: `<path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke-width="1.5" stroke="currentColor"/>`,
            active: `<path stroke-linecap="round" stroke-linejoin="round" d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke-width="1.5" stroke="currentColor" />`,
            upcoming: `<path stroke-linecap="round" stroke-linejoin="round" d="M15 12H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" stroke-width="1.5" stroke="currentColor"/>`
        };

        // --- Local Storage Management ---
        const getCompletedLessons = () => {
            const data = localStorage.getItem(PROJECT_ID);
            return data ? new Set(JSON.parse(data)) : new Set();
        };

        const setCompletedLessons = (completedSet) => {
            localStorage.setItem(PROJECT_ID, JSON.stringify(Array.from(completedSet)));
        };

        // --- Core UI Update Function ---
        const updateProgress = () => {
            const completedLessons = getCompletedLessons();
            const activeLessonId = window.location.hash.substring(1);
            let totalCompletedCount = 0;

            chapterItems.forEach(chapter => {
                const lessonsInChapter = chapter.querySelectorAll('.lesson-item');
                let completedInChapter = 0;
                
                lessonsInChapter.forEach(lessonItem => {
                    const lessonId = lessonItem.dataset.lessonId;
                    lessonItem.classList.remove('is-active', 'is-completed', 'is-upcoming');
                    const iconSvg = lessonItem.querySelector('.lesson-status-icon');

                    if (lessonId === activeLessonId) {
                        lessonItem.classList.add('is-active');
                        if (!chapter.classList.contains('is-expanded')) {
                           chapter.classList.add('is-expanded');
                        }
                        iconSvg.innerHTML = statusIcons.active;
                    } else if (completedLessons.has(lessonId)) {
                        lessonItem.classList.add('is-completed');
                        completedInChapter++;
                        iconSvg.innerHTML = statusIcons.completed;
                    } else {
                        lessonItem.classList.add('is-upcoming');
                        iconSvg.innerHTML = statusIcons.upcoming;
                    }
                });

                totalCompletedCount += completedInChapter;

                const progressRing = chapter.querySelector('.progress-ring-fg');
                const circumference = progressRing.r.baseVal.value * 2 * Math.PI;
                const percentage = lessonsInChapter.length > 0 ? (completedInChapter / lessonsInChapter.length) : 0;
                const offset = circumference - percentage * circumference;
                progressRing.style.strokeDashoffset = offset;
            });

            const overallPercentage = allLessonIds.length > 0 ? (totalCompletedCount / allLessonIds.length) * 100 : 0;
            if(overallProgressBar) overallProgressBar.style.width = `${overallPercentage}%`;
        };
        
        // --- Event Handlers & Observers ---
        const handleLessonClick = (event) => {
            const lessonLink = event.target.closest('a');
            if (!lessonLink) return;

            const lessonId = lessonLink.parentElement.dataset.lessonId;
            const completedLessons = getCompletedLessons();
            completedLessons.add(lessonId);
            setCompletedLessons(completedLessons);
            
            // Close mobile nav if it's open
            if (window.closeMobileNavigator) window.closeMobileNavigator();
            
            setTimeout(updateProgress, 50);
        };
        
        const handleResetClick = () => {
            const isConfirmed = window.confirm("Are you sure you want to reset all your progress for this project? This cannot be undone.");
            if (isConfirmed) {
                localStorage.removeItem(PROJECT_ID);
                window.location.hash = ''; // Go to top of page
                // We don't need to call updateProgress() here because the hashchange event will fire and call it.
                // If the hash is already empty, we call it manually.
                if (window.location.hash === '') {
                    updateProgress();
                }
            }
        };

        const intersectionCallback = (entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const lessonId = entry.target.id;
                    const lessonIndex = allLessonIds.indexOf(lessonId);
                    if (lessonIndex === -1) return;

                    const completedLessons = getCompletedLessons();
                    for (let i = 0; i <= lessonIndex; i++) {
                        completedLessons.add(allLessonIds[i]);
                    }
                    setCompletedLessons(completedLessons);
                    
                    history.replaceState(null, '', `#${lessonId}`);
                    updateProgress();
                }
            });
        };

        const observer = new IntersectionObserver(intersectionCallback, {
            rootMargin: '-45% 0px -45% 0px',
            threshold: 0
        });

        document.querySelectorAll('main .lesson-heading').forEach(heading => {
            observer.observe(heading);
        });

        navigator.addEventListener('click', handleLessonClick);
        if (resetButton) resetButton.addEventListener('click', handleResetClick);
        
        chapterItems.forEach(chapter => {
            const header = chapter.querySelector('.chapter-header');
            header.addEventListener('click', () => {
                chapter.classList.toggle('is-expanded');
            });
        });
        
        window.addEventListener('hashchange', updateProgress);
        
        // Initial load
        updateProgress();
    };

    /**
     * Main script execution flow.
     */
    const main = async () => {
        // Load partials first, since other scripts depend on the full DOM.
        await loadPartials();
    
        // Now that the DOM is complete, initialize all other components.
        initializeMobileMenu();
        initializeDeepDiveModal();
        initializeInspectorPanel();
        initializeProgressNavigator();
    };

    // Run the main async function.
    main();
});