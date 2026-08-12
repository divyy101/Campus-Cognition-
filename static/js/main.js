/**
 * Campus Cognition — Main JavaScript
 * Theme toggle, Neural Engine selector, file validation, toast system,
 * processing status polling, and page interactions.
 */

// ==========================================
// THEME MANAGEMENT
// ==========================================
const ThemeManager = {
    init() {
        const saved = localStorage.getItem('cc-theme') || 'light';
        document.documentElement.setAttribute('data-theme', saved);
        const toggle = document.getElementById('themeToggle');
        if (toggle) {
            toggle.addEventListener('click', () => this.toggle());
        }
    },
    toggle() {
        const current = document.documentElement.getAttribute('data-theme');
        const next = current === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', next);
        localStorage.setItem('cc-theme', next);
    },
    get current() {
        return document.documentElement.getAttribute('data-theme') || 'light';
    }
};

// ==========================================
// TOAST NOTIFICATION SYSTEM
// ==========================================
const Toast = {
    show(message, type = 'info', duration = 4000) {
        const container = document.getElementById('toastContainer');
        if (!container) return;

        const colors = {
            success: { bg: 'rgba(16,185,129,0.95)', icon: '✓' },
            error: { bg: 'rgba(239,68,68,0.95)', icon: '✕' },
            warning: { bg: 'rgba(245,158,11,0.95)', icon: '⚠' },
            info: { bg: 'rgba(67,97,238,0.95)', icon: 'ℹ' },
        };

        const config = colors[type] || colors.info;

        const toast = document.createElement('div');
        toast.style.cssText = `
            background:${config.bg}; color:white; padding:12px 20px; border-radius:10px;
            font-family:var(--font-primary); font-size:0.875rem; font-weight:500;
            display:flex; align-items:center; gap:10px; box-shadow:0 8px 24px rgba(0,0,0,0.15);
            animation: slideInUp 0.3s ease-out; max-width:400px; backdrop-filter:blur(10px);
        `;
        toast.innerHTML = `<span style="font-size:1.1rem;">${config.icon}</span><span>${message}</span>`;

        container.appendChild(toast);

        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateY(-10px)';
            toast.style.transition = 'all 0.3s ease';
            setTimeout(() => toast.remove(), 300);
        }, duration);
    }
};

// ==========================================
// NEURAL ENGINE SELECTOR
// ==========================================
const NeuralEngine = {
    current: localStorage.getItem('cc-ai-engine') || 'gemini',

    init() {
        document.querySelectorAll('.neural-engine-option').forEach(btn => {
            btn.addEventListener('click', () => {
                const engine = btn.dataset.engine;
                this.set(engine);
            });
        });
        this.updateUI();
    },

    set(engine) {
        this.current = engine;
        localStorage.setItem('cc-ai-engine', engine);
        this.updateUI();

        // Persist to server
        fetch('/api/settings/provider', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ai_engine: engine })
        }).catch(() => {});

        Toast.show(`Neural Engine switched to ${engine === 'gemini' ? 'Gemini' : 'OpenAI'}`, 'info', 2000);
    },

    updateUI() {
        document.querySelectorAll('.neural-engine-option').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.engine === this.current);
        });
        document.querySelectorAll('.engine-badge').forEach(badge => {
            badge.textContent = this.current === 'gemini' ? 'Gemini' : 'OpenAI';
        });
    }
};

// ==========================================
// FILE VALIDATION (700MB limit)
// ==========================================
const FileValidator = {
    MAX_SIZE: 700 * 1024 * 1024, // 700MB
    ALLOWED: ['.pdf', '.docx', '.txt', '.md', '.pptx'],

    validate(file) {
        if (!file) return { valid: false, error: 'No file selected.' };

        const ext = '.' + file.name.split('.').pop().toLowerCase();
        if (!this.ALLOWED.includes(ext)) {
            return { valid: false, error: `Unsupported file type. Allowed: ${this.ALLOWED.join(', ')}` };
        }

        if (file.size > this.MAX_SIZE) {
            const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
            return { valid: false, error: `File too large (${sizeMB}MB). Maximum: 700MB.` };
        }

        return { valid: true };
    },

    formatSize(bytes) {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    }
};

// ==========================================
// PROCESSING STATUS POLLER
// ==========================================
const StatusPoller = {
    interval: null,

    start(documentId, onUpdate, onComplete, onError) {
        this.stop();
        let attempts = 0;
        const maxAttempts = 120; // 2 minutes max

        this.interval = setInterval(async () => {
            attempts++;
            if (attempts > maxAttempts) {
                this.stop();
                onError('Processing timed out. Please try again.');
                return;
            }

            try {
                const res = await fetch(`/api/document/${documentId}/status`);
                const data = await res.json();

                if (data.status === 'COMPLETED') {
                    this.stop();
                    onComplete(data);
                } else if (data.status === 'FAILED') {
                    this.stop();
                    onError('Processing failed. Please try again.');
                } else {
                    onUpdate(data.status);
                }
            } catch (e) {
                // Network error, keep trying
            }
        }, 1000);
    },

    stop() {
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = null;
        }
    }
};

// ==========================================
// DRAG & DROP FILE UPLOAD
// ==========================================
function initFileUpload(zoneId, inputId, onFileSelected) {
    const zone = document.getElementById(zoneId);
    const input = document.getElementById(inputId);
    if (!zone || !input) return;

    zone.addEventListener('click', () => input.click());

    zone.addEventListener('dragover', (e) => {
        e.preventDefault();
        zone.classList.add('dragover');
    });

    zone.addEventListener('dragleave', () => {
        zone.classList.remove('dragover');
    });

    zone.addEventListener('drop', (e) => {
        e.preventDefault();
        zone.classList.remove('dragover');
        if (e.dataTransfer.files.length) {
            input.files = e.dataTransfer.files;
            handleFileChange(input.files[0], zone, onFileSelected);
        }
    });

    input.addEventListener('change', () => {
        if (input.files.length) {
            handleFileChange(input.files[0], zone, onFileSelected);
        }
    });
}

function handleFileChange(file, zone, callback) {
    const result = FileValidator.validate(file);
    if (!result.valid) {
        Toast.show(result.error, 'error');
        return;
    }

    // Update zone UI
    const textEl = zone.querySelector('.upload-text');
    const hintEl = zone.querySelector('.upload-hint');
    if (textEl) textEl.textContent = file.name;
    if (hintEl) hintEl.textContent = FileValidator.formatSize(file.size);

    zone.style.borderColor = 'var(--accent-success)';
    zone.style.background = 'rgba(16,185,129,0.05)';

    if (callback) callback(file);
}

// ==========================================
// MOBILE SIDEBAR
// ==========================================
function initMobileSidebar() {
    const toggle = document.getElementById('mobileMenuToggle');
    const sidebar = document.getElementById('sidebar');
    if (!toggle || !sidebar) return;

    // Show mobile toggle on small screens
    const mq = window.matchMedia('(max-width: 768px)');
    function handleMQ(e) {
        toggle.style.display = e.matches ? 'flex' : 'none';
        if (!e.matches) sidebar.classList.remove('open');
    }
    mq.addEventListener('change', handleMQ);
    handleMQ(mq);

    toggle.addEventListener('click', () => {
        sidebar.classList.toggle('open');
    });
}

// ==========================================
// FORM HELPERS
// ==========================================
async function submitJSON(url, data, opts = {}) {
    const { method = 'POST', showToast = true } = opts;
    try {
        const res = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...data, ai_engine: NeuralEngine.current }),
        });
        const json = await res.json();

        if (showToast) {
            if (json.success) {
                Toast.show(json.message || 'Success!', 'success');
            } else {
                Toast.show(json.message || 'Something went wrong.', 'error');
            }
        }

        if (json.redirect) {
            setTimeout(() => window.location.href = json.redirect, 500);
        }

        return json;
    } catch (e) {
        if (showToast) Toast.show('Network error. Please try again.', 'error');
        return { success: false, message: 'Network error' };
    }
}

// ==========================================
// INIT ON DOM READY
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    ThemeManager.init();
    NeuralEngine.init();
    initMobileSidebar();

    // Re-init Lucide icons after dynamic content
    if (typeof lucide !== 'undefined') lucide.createIcons();
});
