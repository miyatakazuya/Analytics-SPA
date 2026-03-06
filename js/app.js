const contentArea = document.getElementById('app-content');
const pageTitle = document.getElementById('page-title');
const topActions = document.getElementById('top-actions');

function updateNavActive(hash) {
    document.querySelectorAll('.nav-link').forEach(el => el.classList.remove('active'));
    const activeLink = document.querySelector(`.nav-link[data-route="${hash}"]`);
    if (activeLink) activeLink.classList.add('active');
}

function setHeader(title, actionsHtml = '') {
    pageTitle.textContent = title;
    topActions.innerHTML = actionsHtml;
}

function renderView(title, content) {
    setHeader(title);
    contentArea.innerHTML = `
        <div class="card shadow-sm border-0">
            <div class="card-body">
                <p class="text-muted mb-0">${content}</p>
            </div>
        </div>
    `;
}

function setRendercontent(title, content, actionsHtml = '') {
    setHeader(title, actionsHtml);
    contentArea.innerHTML = content;
}

async function loginView() {
    if (await returnAuth()) {
        window.location.hash = '#/overview';
        return;
    }
    document.getElementById('app-sidebar').classList.add('d-none'); // Hide sidebar on login
    document.querySelector('.top-navbar').classList.add('d-none'); // Hide topbar

    setRendercontent('Login', `
    <div class="d-flex justify-content-center align-items-center vh-100 w-100 bg-light position-absolute top-0 start-0" style="z-index: 1050;">
        <div class="card border-0 shadow-lg" style="width: 100%; max-width: 400px;">
            <div class="card-body p-5">
                <div class="text-center mb-4">
                    <i class="bi bi-bar-chart-fill text-primary" style="font-size: 3rem;"></i>
                    <h2 class="fw-bold mt-2">Analytics Login</h2>
                </div>
                <form id="login-form">
                    <div class="mb-3">
                        <label for="email" class="form-label text-muted">Email address</label>
                        <input type="email" class="form-control form-control-lg" id="email" required autocomplete="email">
                    </div>
                    <div class="mb-4">
                        <label for="password" class="form-label text-muted">Password</label>
                        <input type="password" class="form-control form-control-lg" id="password" required autocomplete="current-password">
                    </div>
                    <div id="error-message" class="alert alert-danger" hidden></div>
                    <button type="submit" class="btn btn-primary btn-lg w-100 shadow-sm">Sign In</button>
                    <div class="text-center mt-3 text-muted small">
                        Use viewer@site.com / password123
                    </div>
                </form>
            </div>
        </div>
    </div>
    `);
}

async function returnAuth() {
    try {
        const res = await fetch('/api/dashboard', {
            credentials: 'include',
            cache: 'no-store'
        });
        if (res.status === 401) {
            return false;
        }
        return true;
    } catch (err) {
        return false;
    }
}

async function checkAuth() {
    try {
        const res = await fetch('/api/dashboard', {
            credentials: 'include',
            cache: 'no-store'
        });
        if (res.status === 401) {
            window.location.hash = '#/login';
            document.getElementById('login-status').textContent = 'Signed Out';
            document.getElementById('logout-btn').classList.add('d-none');
            return null;
        }

        const data = await res.json();

        // Ensure UI elements are visible for logged in users
        document.getElementById('app-sidebar').classList.remove('d-none');
        document.querySelector('.top-navbar').classList.remove('d-none');

        document.getElementById('login-status').textContent = data.user.displayName;
        document.getElementById('logout-btn').classList.remove('d-none');

        // Store role globally to easily toggle "Save Report" button visibility
        window.userRole = data.user.role;

        return data;
    } catch (err) {
        window.location.hash = '#/login';
        document.getElementById('login-status').textContent = 'Signed Out';
        document.getElementById('logout-btn').classList.add('d-none');
        return null;
    }
}

function renderTable(container, keys, rows) {
    container.innerHTML = '';
    const table = document.createElement('table');
    table.className = 'table table-hover table-bordered bg-white shadow-sm mb-0';

    const thead = document.createElement('thead');
    thead.className = 'table-light';

    // Auto generate headers from keys
    let headerRow = '<tr>';
    keys.forEach(k => { headerRow += `<th>${k.label}</th>`; });
    headerRow += '</tr>';
    thead.innerHTML = headerRow;
    table.appendChild(thead);

    const tbody = document.createElement('tbody');
    (rows || []).forEach(row => {
        const tr = document.createElement('tr');
        keys.forEach(k => {
            const td = document.createElement('td');
            let val = row[k.key];
            // Format numbers
            if (!isNaN(val) && val !== '') val = Number(val).toLocaleString();
            td.textContent = val; // XSS safe
            tr.appendChild(td);
        });
        tbody.appendChild(tr);
    });
    table.appendChild(tbody);

    const wrapper = document.createElement('div');
    wrapper.className = 'table-responsive rounded';
    wrapper.appendChild(table);
    container.appendChild(wrapper);
}
