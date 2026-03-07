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

async function overviewView() {
    updateNavActive(window.location.hash || '#/overview');
    const data = await checkAuth();
    if (data) {
        setRendercontent('Performance Overview', `
            <div class="row g-4">
                <div class="col-12">
                    <div class="card border-0 shadow-sm">
                        <div class="card-header bg-white border-bottom-0 pt-4 pb-0">
                            <h5 class="card-title mb-0">Pageviews Over Time</h5>
                        </div>
                        <div class="card-body">
                            <canvas id="pageviews-chart" class="w-100" style="height: 250px; background: #fff;"></canvas>
                        </div>
                    </div>
                </div>
                <div class="col-md-8">
                    <div class="card border-0 shadow-sm h-100">
                        <div class="card-header bg-white border-bottom-0 pt-4 pb-0">
                            <h5 class="card-title mb-0">Top Pages</h5>
                        </div>
                        <div class="card-body" id="top-pages-table">
                            <div class="spinner-border text-primary" role="status"><span class="visually-hidden">Loading...</span></div>
                        </div>
                    </div>
                </div>
                <div class="col-md-4">
                    <div class="card border-0 shadow-sm h-100">
                        <div class="card-header bg-white border-bottom-0 pt-4 pb-0">
                            <h5 class="card-title mb-0">Top Errors</h5>
                        </div>
                        <div class="card-body" id="top-errors-table">
                            <div class="spinner-border text-primary" role="status"><span class="visually-hidden">Loading...</span></div>
                        </div>
                    </div>
                </div>
            </div>
        `, getSaveReportButton('performance', 'currentReportData'));

        try {
            const res = await fetch('/api/data?category=performance', { credentials: 'include', cache: 'no-store' });
            if (res.ok) {
                const pageData = await res.json();
                attachSaveVariables(pageData);

                renderTable(document.getElementById('top-pages-table'),
                    [{ label: 'URL', key: 'url' }, { label: 'Views', key: 'views' }],
                    pageData.topPages);

                renderTable(document.getElementById('top-errors-table'),
                    [{ label: 'Error Type', key: 'error_type' }, { label: 'Count', key: 'count' }],
                    pageData.topErrors);

                renderLineChart(document.getElementById('pageviews-chart'), pageData.byDay, 'day', 'views');
            } else {
                document.getElementById('top-pages-table').innerHTML = '<div class="alert alert-danger">Failed to load data (Server Error).</div>';
            }
        } catch (e) {
            document.getElementById('top-pages-table').innerHTML = '<div class="alert alert-danger">Failed to load data (Network Error).</div>';
        }
    }
}

function renderLineChart(canvas, dataPoints, labelKey, valueKey) {
    if (!canvas || !dataPoints || dataPoints.length === 0) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width = canvas.offsetWidth;
    const H = canvas.height = 250;
    const pad = { top: 20, right: 20, bottom: 40, left: 60 };
    const plotW = W - pad.left - pad.right;
    const plotH = H - pad.top - pad.bottom;

    ctx.clearRect(0, 0, W, H);

    const values = dataPoints.map(d => Number(d[valueKey]));
    const maxVal = Math.max(...values, 1);

    // Axes
    ctx.strokeStyle = '#ddd';
    ctx.beginPath();
    ctx.moveTo(pad.left, pad.top);
    ctx.lineTo(pad.left, H - pad.bottom);
    ctx.lineTo(W - pad.right, H - pad.bottom);
    ctx.stroke();

    // Line
    ctx.strokeStyle = '#2E86C1';
    ctx.lineWidth = 2;
    ctx.beginPath();
    dataPoints.forEach((d, i) => {
        const x = pad.left + (i / (dataPoints.length - 1 || 1)) * plotW;
        const y = H - pad.bottom - (values[i] / maxVal) * plotH;
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    });
    ctx.stroke();

    // Points
    ctx.fillStyle = '#2E86C1';
    dataPoints.forEach((d, i) => {
        const x = pad.left + (i / (dataPoints.length - 1 || 1)) * plotW;
        const y = H - pad.bottom - (values[i] / maxVal) * plotH;
        ctx.beginPath();
        ctx.arc(x, y, 3, 0, Math.PI * 2);
        ctx.fill();
    });

    // X labels (show first, middle, last)
    ctx.fillStyle = '#666';
    ctx.font = '11px sans-serif';
    ctx.textAlign = 'center';
    [0, Math.floor(dataPoints.length / 2), dataPoints.length - 1].forEach(i => {
        if (!dataPoints[i]) return;
        const x = pad.left + (i / (dataPoints.length - 1 || 1)) * plotW;
        ctx.fillText(dataPoints[i][labelKey], x, H - pad.bottom + 20);
    });

    // Y labels
    ctx.textAlign = 'right';
    ctx.fillText(maxVal.toLocaleString(), pad.left - 8, pad.top + 10);
    ctx.fillText('0', pad.left - 8, H - pad.bottom + 5);
}
async function demographicsView() {
    updateNavActive('#/demographics');
    const data = await checkAuth();
    if (!data) return;

    setRendercontent('Demographics', `
        <div class="row g-4">
            <div class="col-md-6">
                <div class="card border-0 shadow-sm h-100">
                    <div class="card-header bg-white border-bottom-0 pt-4 pb-0"><h5 class="card-title mb-0">Browser Market Share</h5></div>
                    <div class="card-body" id="browser-table">
                        <div class="spinner-border text-primary" role="status"></div>
                    </div>
                </div>
            </div>
            <div class="col-md-6">
                 <div class="card border-0 shadow-sm h-100">
                    <div class="card-header bg-white border-bottom-0 pt-4 pb-0"><h5 class="card-title mb-0">Network Types</h5></div>
                    <div class="card-body" id="network-table">
                        <div class="spinner-border text-primary" role="status"></div>
                    </div>
                </div>
            </div>
        </div>
    `, getSaveReportButton('demographics', 'currentReportData'));

    try {
        const res = await fetch('/api/data?category=demographics', { credentials: 'include', cache: 'no-store' });
        if (res.ok) {
            const apiData = await res.json();
            attachSaveVariables(apiData);
            renderTable(document.getElementById('browser-table'),
                [{ label: 'Browser', key: 'browser' }, { label: 'Users', key: 'count' }], apiData.browsers);
            renderTable(document.getElementById('network-table'),
                [{ label: 'Network', key: 'network_type' }, { label: 'Users', key: 'count' }], apiData.networks);
        }
    } catch (e) { }
}

async function behaviorView() {
    updateNavActive('#/behavior');
    const data = await checkAuth();
    if (!data) return;

    setRendercontent('User Behavior', `
        <div class="row g-4">
            <div class="col-12">
                <div class="card border-0 shadow-sm">
                    <div class="card-header bg-white border-bottom-0 pt-4 pb-0"><h5 class="card-title mb-0">Average Active Time Per Day (Seconds)</h5></div>
                    <div class="card-body">
                        <canvas id="active-time-chart" class="w-100" style="height: 250px; background: #fff;"></canvas>
                    </div>
                </div>
            </div>
            <div class="col-12">
                 <div class="card border-0 shadow-sm h-100">
                    <div class="card-header bg-white border-bottom-0 pt-4 pb-0"><h5 class="card-title mb-0">Most Clicked HTML Tags</h5></div>
                    <div class="card-body" id="clicks-table">
                        <div class="spinner-border text-primary" role="status"></div>
                    </div>
                </div>
            </div>
        </div>
    `, getSaveReportButton('behavior', 'currentReportData'));

    try {
        const res = await fetch('/api/data?category=behavior', { credentials: 'include', cache: 'no-store' });
        if (res.ok) {
            const apiData = await res.json();
            attachSaveVariables(apiData);
            renderTable(document.getElementById('clicks-table'),
                [{ label: 'HTML Node', key: 'element_tag' }, { label: 'Total Clicks', key: 'clicks' }], apiData.topClicks);
            renderLineChart(document.getElementById('active-time-chart'), apiData.activeTime, 'day', 'avg_seconds');
        }
    } catch (e) { }
}

async function reportsView() {
    updateNavActive('#/reports');
    const data = await checkAuth();
    if (!data) return;

    setRendercontent('Saved Reports', `
        <div class="card border-0 shadow-sm">
            <div class="card-body p-0">
                <div class="table-responsive">
                    <table class="table table-hover align-middle mb-0" id="reports-list">
                        <thead class="table-light">
                            <tr>
                                <th class="ps-4">Title</th>
                                <th>Category</th>
                                <th>Author</th>
                                <th>Date</th>
                                <th class="text-end pe-4">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr><td colspan="5" class="text-center py-4"><div class="spinner-border text-primary" role="status"></div></td></tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>

        <!-- View Report Modal -->
        <div class="modal fade" id="viewReportModal" tabindex="-1" aria-hidden="true">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header border-bottom-0 pb-0">
                        <h5 class="modal-title fw-bold" id="vr-title">...</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body pt-2">
                        <div class="d-flex justify-content-between align-items-center mb-4 text-muted small">
                            <span><i class="bi bi-person me-1"></i><span id="vr-author">...</span></span>
                            <span><i class="bi bi-calendar me-1"></i><span id="vr-date">...</span></span>
                            <span class="badge bg-secondary text-uppercase" id="vr-category">...</span>
                        </div>
                        
                        <div class="card border border-primary-subtle bg-primary-subtle shadow-sm mb-4">
                            <div class="card-body">
                                <h6 class="card-subtitle mb-2 text-primary fw-bold"><i class="bi bi-chat-left-text me-2"></i>Analyst Comments</h6>
                                <p class="card-text text-dark" id="vr-comments" style="white-space: pre-wrap;">...</p>
                            </div>
                        </div>

                        <h6 class="fw-bold mb-3"><i class="bi bi-database me-2"></i>Data Snapshot</h6>
                        <div class="bg-light p-3 rounded" style="max-height: 400px; overflow-y: auto;">
                            <pre id="vr-data" class="mb-0" style="font-size: 0.85rem;"></pre>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `);

    try {
        const res = await fetch('/api/reports', { credentials: 'include', cache: 'no-store' });
        if (res.ok) {
            const reports = await res.json();
            const tbody = document.querySelector('#reports-list tbody');
            tbody.innerHTML = '';

            if (reports.length === 0) {
                tbody.innerHTML = '<tr><td colspan="5" class="text-center py-4 text-muted">No reports saved yet.</td></tr>';
                return;
            }

            // Expose for click handler
            window.loadedReports = reports;

            reports.forEach((r, idx) => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td class="ps-4 fw-medium">${r.title}</td>
                    <td><span class="badge bg-info text-dark">${r.category}</span></td>
                    <td class="text-muted small">${r.author_email}</td>
                    <td class="text-muted small">${new Date(r.created_at).toLocaleString()}</td>
                    <td class="text-end pe-4">
                        <button class="btn btn-sm btn-outline-primary view-report-btn" data-idx="${idx}">View Data</button>
                    </td>
                `;
                tbody.appendChild(tr);
            });

            // Re-bind click handlers for the view buttons
            document.querySelectorAll('.view-report-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const r = window.loadedReports[e.target.getAttribute('data-idx')];
                    document.getElementById('vr-title').textContent = r.title;
                    document.getElementById('vr-author').textContent = r.author_email;
                    document.getElementById('vr-date').textContent = new Date(r.created_at).toLocaleString();
                    document.getElementById('vr-category').textContent = r.category;
                    document.getElementById('vr-comments').textContent = r.comments || '(No comments provided)';

                    try {
                        const parsed = typeof r.data_snapshot === 'string' ? JSON.parse(r.data_snapshot) : r.data_snapshot;
                        document.getElementById('vr-data').textContent = JSON.stringify(parsed, null, 2);
                    } catch (e) {
                        document.getElementById('vr-data').textContent = r.data_snapshot;
                    }

                    const modalEl = document.getElementById('viewReportModal');
                    modalEl.classList.add('show');
                    modalEl.style.display = 'block';
                    modalEl.style.backgroundColor = 'rgba(0,0,0,0.5)';
                    modalEl.querySelector('.btn-close').onclick = () => {
                        modalEl.classList.remove('show');
                        modalEl.style.display = 'none';
                    };
                });
            });

        } else {
            document.querySelector('#reports-list tbody').innerHTML = '<tr><td colspan="5" class="text-center text-danger">Failed to load reports.</td></tr>';
        }
    } catch (e) {
        document.querySelector('#reports-list tbody').innerHTML = '<tr><td colspan="5" class="text-center text-danger">Network Error.</td></tr>';
    }
}

function notFoundView() {
    setHeader('404 Not Found');
    renderView('Route missing', 'The requested analytics dashboard does not exist.');
}

// Router
function router() {
    let hash = window.location.hash;

    if (!hash || hash === '') {
        hash = '#/login';
        window.history.replaceState(null, null, document.location.pathname + hash);
    }

    console.log(`Navigating to: ${hash}`);

    switch (hash) {
        case '#/login':
            loginView();
            break;
        case '#/overview':
        case '#/performance':
            overviewView();
            break;
        case '#/demographics':
            demographicsView();
            break;
        case '#/behavior':
            behaviorView();
            break;
        case '#/reports':
            reportsView();
            break;
        default:
            notFoundView();
            break;
    }
}

window.addEventListener('hashchange', router);
window.addEventListener('DOMContentLoaded', router);

document.getElementById('app-content').addEventListener('submit', async (e) => {
    if (e.target.id === 'login-form') {
        e.preventDefault();

        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        try {
            const res = await fetch('/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ email, password })
            });

            const data = await res.json();

            if (res.ok && data.success) {
                window.location.href = '#/overview';
            } else {
                errorDiv.textContent = data.error || 'Login failed';
                errorDiv.hidden = false;
            }
        } catch (err) {
            errorDiv.textContent = 'Network error. Please try again.';
            errorDiv.hidden = false;
        }
    }
});

document.getElementById('logout-btn').addEventListener('click', async (e) => {
    e.preventDefault();
    await fetch('/api/logout', {
        method: 'POST',
        credentials: 'include'
    });

    window.location.hash = '#/login';

    document.getElementById('login-status').textContent = 'Signed Out';
});

// Save Report Logic
function getSaveReportButton(category, dataName) {
    if (window.userRole === 'viewer') return ''; // Viewers cannot save reports
    return `<button class="btn btn-sm btn-primary save-report-btn" data-category="${category}" data-var="${dataName}"><i class="bi bi-cloud-arrow-up me-1"></i> Save Snapshot</button>`;
}

function attachSaveVariables(dataObj) {
    window.currentReportData = dataObj;
}

document.addEventListener('click', async (e) => {
    if (e.target.closest('.save-report-btn')) {
        const btn = e.target.closest('.save-report-btn');
        const category = btn.getAttribute('data-category');

        // Inject Modal if not exists
        if (!document.getElementById('saveReportModal')) {
            const modalHtml = `
            <div class="modal fade" id="saveReportModal" tabindex="-1" aria-hidden="true">
              <div class="modal-dialog">
                <div class="modal-content">
                  <div class="modal-header">
                    <h5 class="modal-title">Save Report Snapshot</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                  </div>
                  <div class="modal-body">
                    <form id="save-report-form">
                        <div class="mb-3">
                            <label class="form-label">Report Title</label>
                            <input type="text" id="report-title" class="form-control" required placeholder="e.g. Weekly Performance">
                        </div>
                        <div class="mb-3">
                            <label class="form-label">Analyst Comments</label>
                            <textarea id="report-comments" class="form-control" rows="4" placeholder="Add your analysis and insights here..."></textarea>
                        </div>
                    </form>
                  </div>
                  <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                    <button type="button" class="btn btn-primary" id="confirm-save-btn">Save Report</button>
                  </div>
                </div>
              </div>
            </div>`;
            document.body.insertAdjacentHTML('beforeend', modalHtml);
        }

        const modalEl = document.getElementById('saveReportModal');
        modalEl.classList.add('show');
        modalEl.style.display = 'block';
        modalEl.style.backgroundColor = 'rgba(0,0,0,0.5)';

        const closeFn = () => {
            modalEl.classList.remove('show');
            modalEl.style.display = 'none';
        };
        modalEl.querySelector('.btn-close').onclick = closeFn;
        modalEl.querySelector('.btn-secondary').onclick = closeFn;

        const confirmBtn = document.getElementById('confirm-save-btn');
        const newBtn = confirmBtn.cloneNode(true);
        confirmBtn.parentNode.replaceChild(newBtn, confirmBtn);

        newBtn.addEventListener('click', async () => {
            const title = document.getElementById('report-title').value;
            const comments = document.getElementById('report-comments').value;
            if (!title) return alert('Title is required');

            newBtn.disabled = true;
            newBtn.textContent = 'Saving...';

            try {
                const res = await fetch('/api/reports', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                    body: JSON.stringify({
                        title: title,
                        category: category,
                        comments: comments,
                        data_snapshot: window.currentReportData
                    })
                });

                if (res.ok) {
                    closeFn();
                    window.location.hash = '#/reports';
                } else {
                    alert('Failed to save report');
                    newBtn.disabled = false;
                    newBtn.textContent = 'Save Report';
                }
            } catch (err) {
                alert('Network error while saving');
                newBtn.disabled = false;
                newBtn.textContent = 'Save Report';
            }
        });
    }
});