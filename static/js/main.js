// ==========================================
// CAMPUS COGNITION - MAIN JAVASCRIPT
// Interactive Features & Utilities
// ==========================================

// Toast Notification System
function showToast(message, type = 'info') {
    const toastElement = document.getElementById('toast');
    const toastMessage = document.getElementById('toast-message');
    
    toastMessage.textContent = message;
    
    // Remove all type classes
    toastElement.classList.remove('bg-success', 'bg-danger', 'bg-info', 'bg-warning');
    
    // Add appropriate type class
    switch(type) {
        case 'success':
            toastElement.classList.add('bg-success');
            break;
        case 'danger':
            toastElement.classList.add('bg-danger');
            break;
        case 'warning':
            toastElement.classList.add('bg-warning');
            break;
        case 'info':
        default:
            toastElement.classList.add('bg-info');
    }
    
    const toast = new bootstrap.Toast(toastElement);
    toast.show();
}

// Theme Toggle (Dark/Light Mode)
function toggleTheme() {
    const body = document.body;
    const isDark = body.classList.contains('dark-mode');
    
    if (isDark) {
        body.classList.remove('dark-mode');
        localStorage.setItem('theme', 'light');
    } else {
        body.classList.add('dark-mode');
        localStorage.setItem('theme', 'dark');
    }
}

// Load saved theme on page load
function loadTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-mode');
    }
}

// Initialize theme on page load
document.addEventListener('DOMContentLoaded', loadTheme);

// ==========================================
// FORM VALIDATION
// ==========================================

// Bootstrap form validation
(function() {
    'use strict';
    window.addEventListener('load', function() {
        let forms = document.querySelectorAll('.needs-validation');
        Array.prototype.slice.call(forms)
            .forEach(function(form) {
                form.addEventListener('submit', function(event) {
                    if (!form.checkValidity()) {
                        event.preventDefault();
                        event.stopPropagation();
                    }
                    form.classList.add('was-validated');
                }, false);
            });
    }, false);
})();

// ==========================================
// DASHBOARD FEATURES
// ==========================================

// Animate progress bars on page load
function animateProgressBars() {
    const progressBars = document.querySelectorAll('.progress-bar');
    progressBars.forEach(bar => {
        const width = bar.style.width;
        bar.style.width = '0';
        setTimeout(() => {
            bar.style.transition = 'width 1s ease-out';
            bar.style.width = width;
        }, 100);
    });
}

document.addEventListener('DOMContentLoaded', animateProgressBars);

// ==========================================
// STUDY MODULE FEATURES
// ==========================================

// Drag and Drop for file uploads
function setupFileUpload(dropZoneId, inputId) {
    const dropZone = document.getElementById(dropZoneId);
    const fileInput = document.getElementById(inputId);
    
    if (!dropZone || !fileInput) return;

    // Click to upload
    dropZone.addEventListener('click', () => {
        fileInput.click();
    });

    // Drag over
    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('dragover');
    });

    // Drag leave
    dropZone.addEventListener('dragleave', () => {
        dropZone.classList.remove('dragover');
    });

    // Drop
    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('dragover');
        
        const files = e.dataTransfer.files;
        if (files.length) {
            fileInput.files = files;
            updateDropZoneDisplay(dropZone, files[0].name);
        }
    });

    // File input change
    fileInput.addEventListener('change', () => {
        if (fileInput.files[0]) {
            updateDropZoneDisplay(dropZone, fileInput.files[0].name);
        }
    });
}

function updateDropZoneDisplay(dropZone, fileName) {
    dropZone.innerHTML = `
        <i class="bi bi-check-circle" style="color: #38ef7d; font-size: 2.5rem;"></i>
        <p>${fileName}</p>
    `;
}

// ==========================================
// CHART UTILITIES
// ==========================================

// Create a priority chart
function createPriorityChart(containerId, data) {
    const ctx = document.getElementById(containerId);
    if (!ctx) return;

    const chartData = {
        labels: data.map(item => item.topic),
        datasets: [{
            label: 'Priority Score',
            data: data.map(item => item.priority_score),
            backgroundColor: [
                'rgba(102, 126, 234, 0.7)',
                'rgba(118, 75, 162, 0.7)',
                'rgba(17, 153, 142, 0.7)',
                'rgba(56, 239, 125, 0.7)',
                'rgba(255, 193, 7, 0.7)',
            ],
            borderColor: [
                'rgba(102, 126, 234, 1)',
                'rgba(118, 75, 162, 1)',
                'rgba(17, 153, 142, 1)',
                'rgba(56, 239, 125, 1)',
                'rgba(255, 193, 7, 1)',
            ],
            borderWidth: 2,
            borderRadius: 10,
        }]
    };

    new Chart(ctx, {
        type: 'bar',
        data: chartData,
        options: {
            responsive: true,
            plugins: {
                legend: {
                    display: true,
                    labels: {
                        color: '#999'
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    },
                    ticks: {
                        color: '#999'
                    }
                },
                x: {
                    grid: {
                        display: false
                    },
                    ticks: {
                        color: '#999'
                    }
                }
            }
        }
    });
}

// ==========================================
// CODE FORMATTING
// ==========================================

// Sanitize HTML in code analysis
function sanitizeHTML(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return String(text).replace(/[&<>"']/g, m => map[m]);
}

// Highlight code syntax
function highlightCode(element) {
    if (window.Prism) {
        Prism.highlightElement(element);
    }
}

// ==========================================
// SEARCH & FILTER
// ==========================================

// Simple search filter
function filterList(inputId, itemClass) {
    const searchInput = document.getElementById(inputId);
    if (!searchInput) return;

    searchInput.addEventListener('keyup', function() {
        const query = this.value.toLowerCase();
        const items = document.querySelectorAll('.' + itemClass);
        
        items.forEach(item => {
            const text = item.textContent.toLowerCase();
            item.style.display = text.includes(query) ? '' : 'none';
        });
    });
}

// ==========================================
// MODAL UTILITIES
// ==========================================

// Show modal with content
function showModal(modalId, content) {
    const modal = new bootstrap.Modal(document.getElementById(modalId));
    const contentElement = document.getElementById('modalContent');
    if (contentElement) {
        contentElement.innerHTML = content;
    }
    modal.show();
}

// ==========================================
// LOADING STATES
// ==========================================

// Show loading spinner
function showLoading(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
        element.style.display = 'flex';
    }
}

// Hide loading spinner
function hideLoading(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
        element.style.display = 'none';
    }
}

// ==========================================
// DATE UTILITIES
// ==========================================

// Format date
function formatDate(dateString) {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
}

// Get days remaining
function getDaysRemaining(deadlineString) {
    const deadline = new Date(deadlineString);
    const today = new Date();
    const diff = deadline - today;
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

// ==========================================
// API UTILITIES
// ==========================================

// Fetch with error handling
async function fetchAPI(url, options = {}) {
    try {
        const response = await fetch(url, options);
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || `HTTP error! status: ${response.status}`);
        }
        
        return data;
    } catch (error) {
        console.error('Fetch error:', error);
        showToast(error.message, 'danger');
        throw error;
    }
}

// ==========================================
// SCROLLING UTILITIES
// ==========================================

// Smooth scroll to element
function smoothScrollTo(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
    }
}

// Scroll to top
function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

// Show/hide scroll to top button
function handleScrollButton() {
    const scrollBtn = document.querySelector('.scroll-to-top');
    if (!scrollBtn) return;

    window.addEventListener('scroll', () => {
        if (window.pageYOffset > 300) {
            scrollBtn.style.display = 'block';
        } else {
            scrollBtn.style.display = 'none';
        }
    });

    scrollBtn.addEventListener('click', scrollToTop);
}

// ==========================================
// LOCAL STORAGE UTILITIES
// ==========================================

// Save to localStorage
function saveToLocal(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
        console.error('Error saving to localStorage:', error);
    }
}

// Get from localStorage
function getFromLocal(key, defaultValue = null) {
    try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
        console.error('Error reading from localStorage:', error);
        return defaultValue;
    }
}

// ==========================================
// CLIPBOARD UTILITIES
// ==========================================

// Copy to clipboard
async function copyToClipboard(text, feedbackId = null) {
    try {
        await navigator.clipboard.writeText(text);
        showToast('Copied to clipboard!', 'success');
        
        if (feedbackId) {
            const element = document.getElementById(feedbackId);
            if (element) {
                element.classList.add('copied');
                setTimeout(() => element.classList.remove('copied'), 1500);
            }
        }
    } catch (error) {
        showToast('Failed to copy', 'danger');
    }
}

// ==========================================
// RESPONSIVE UTILITIES
// ==========================================

// Check if mobile
function isMobile() {
    return window.innerWidth <= 768;
}

// Handle window resize
function onWindowResize(callback) {
    window.addEventListener('resize', callback);
}

// ==========================================
// ANALYTICS UTILITIES
// ==========================================

// Track event
function trackEvent(eventName, eventData = {}) {
    if (window.gtag) {
        gtag('event', eventName, eventData);
    }
    console.log(`Event: ${eventName}`, eventData);
}

// ==========================================
// KEYBOARD SHORTCUTS
// ==========================================

// Set up keyboard shortcuts
function setupKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
        // Ctrl/Cmd + K for search
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            const searchInput = document.querySelector('input[type="search"]');
            if (searchInput) searchInput.focus();
        }
        
        // Escape to close modals
        if (e.key === 'Escape') {
            const modals = document.querySelectorAll('.modal.show');
            modals.forEach(modal => {
                bootstrap.Modal.getInstance(modal)?.hide();
            });
        }
    });
}

// Initialize all on page load
document.addEventListener('DOMContentLoaded', () => {
    setupKeyboardShortcuts();
    handleScrollButton();
});

// ==========================================
// ANIMATION UTILITIES
// ==========================================

// Fade in animation
function fadeIn(element, duration = 300) {
    element.style.opacity = '0';
    element.style.transition = `opacity ${duration}ms ease-in`;
    
    setTimeout(() => {
        element.style.opacity = '1';
    }, 10);
}

// Fade out animation
function fadeOut(element, duration = 300) {
    element.style.transition = `opacity ${duration}ms ease-out`;
    element.style.opacity = '0';
}

// ==========================================
// EXPORT FOR USE IN TEMPLATES
// ==========================================

// Make functions available globally
window.showToast = showToast;
window.toggleTheme = toggleTheme;
window.copyToClipboard = copyToClipboard;
window.smoothScrollTo = smoothScrollTo;
window.scrollToTop = scrollToTop;
window.isMobile = isMobile;
window.sanitizeHTML = sanitizeHTML;
