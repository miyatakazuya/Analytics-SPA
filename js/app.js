const contentArea = document.getElementById('app-content');
const pageTitle = document.getElementById('page-title');
const topActions = document.getElementById('top-actions');

window.chartInstances = {};

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
        applyRoleRestrictions();

        return data;
    } catch (err) {
        window.location.hash = '#/login';
        document.getElementById('login-status').textContent = 'Signed Out';
        document.getElementById('logout-btn').classList.add('d-none');
        return null;
    }
}

function applyRoleRestrictions() {
    const restrictedRoutes = ['#/overview', '#/demographics', '#/behavior', '#/performance'];
    restrictedRoutes.forEach(route => {
        const link = document.querySelector(`.nav-link[data-route="${route}"]`);
        if (link) {
            if (window.userRole === 'viewer') {
                link.style.pointerEvents = 'none';
                link.style.opacity = '0.7';
                link.classList.add('disabled');
            } else {
                link.style.pointerEvents = 'auto';
                link.style.opacity = '1';
                link.classList.remove('disabled');
            }
        }
    });
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
    updateNavActive('#/overview');
    const data = await checkAuth();
    if (data) {
        setRendercontent('Overview', `
            <div class="row g-4 mb-4">
                <div class="col-md-3">
                    <div class="card border-0 shadow-sm h-100">
                        <div class="card-body">
                            <h6 class="text-muted text-uppercase fw-bold mb-2">Visitors</h6>
                            <h2 class="mb-0 fw-bold" id="ov-visitors">-</h2>
                        </div>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="card border-0 shadow-sm h-100">
                        <div class="card-body">
                            <h6 class="text-muted text-uppercase fw-bold mb-2">Views</h6>
                            <h2 class="mb-0 fw-bold" id="ov-views">-</h2>
                        </div>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="card border-0 shadow-sm h-100">
                        <div class="card-body">
                            <h6 class="text-muted text-uppercase fw-bold mb-2">Bounce Rate</h6>
                            <h2 class="mb-0 fw-bold" id="ov-bounce">-</h2>
                        </div>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="card border-0 shadow-sm h-100">
                        <div class="card-body">
                            <h6 class="text-muted text-uppercase fw-bold mb-2">Visit Duration</h6>
                            <h2 class="mb-0 fw-bold" id="ov-duration">-</h2>
                        </div>
                    </div>
                </div>
            </div>
            <div class="card border-0 shadow-sm">
                <div class="card-body pt-4">
                    <canvas id="overview-chart" class="w-100" style="height: 300px; background: #fff;"></canvas>
                </div>
            </div>
        `, getSaveReportButton('overview', 'currentReportData'));

        try {
            const days = document.getElementById('global-date-filter').value;
            const res = await fetch(`/api/data?category=overview&days=${days}`, { credentials: 'include', cache: 'no-store' });
            if (res.ok) {
                const apiData = await res.json();
                attachSaveVariables(apiData);
                document.getElementById('ov-visitors').textContent = Number(apiData.visitors).toLocaleString();
                document.getElementById('ov-views').textContent = Number(apiData.views).toLocaleString();
                document.getElementById('ov-bounce').textContent = apiData.bounceRate + '%';
                document.getElementById('ov-duration').textContent = apiData.visitDuration + 's';

                renderChart(document.getElementById('overview-chart'), 'line', {
                    labels: apiData.chartData.map(d => d.day),
                    datasets: [
                        {
                            label: 'Views',
                            data: apiData.chartData.map(d => Number(d.views)),
                            borderColor: '#1cc88a',
                            backgroundColor: 'rgba(28, 200, 138, 0.1)',
                            fill: true,
                            tension: 0.4
                        },
                        {
                            label: 'Visitors',
                            data: apiData.chartData.map(d => Number(d.visitors)),
                            borderColor: '#4e73df',
                            backgroundColor: 'rgba(78, 115, 223, 0.1)',
                            fill: true,
                            tension: 0.4
                        }
                    ]
                }, { responsive: true, maintainAspectRatio: false });
            }
        } catch (e) {
            console.error('Failed to load overview data', e);
        }
    }
}

async function performanceView() {
    updateNavActive('#/performance');
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
            const days = document.getElementById('global-date-filter').value;
            const res = await fetch(`/api/data?category=performance&days=${days}`, { credentials: 'include', cache: 'no-store' });
            if (res.ok) {
                const pageData = await res.json();
                attachSaveVariables(pageData);

                renderTable(document.getElementById('top-pages-table'),
                    [{ label: 'URL', key: 'url' }, { label: 'Views', key: 'views' }],
                    pageData.topPages);

                renderTable(document.getElementById('top-errors-table'),
                    [{ label: 'Error Type', key: 'error_type' }, { label: 'Count', key: 'count' }],
                    pageData.topErrors);

                renderChart(document.getElementById('pageviews-chart'), 'line', {
                    labels: pageData.byDay.map(d => d.day),
                    datasets: [{
                        label: 'Pageviews',
                        data: pageData.byDay.map(d => Number(d.views)),
                        borderColor: '#2E86C1',
                        backgroundColor: 'rgba(46, 134, 193, 0.2)',
                        fill: true,
                        tension: 0.4
                    }]
                }, { responsive: true, maintainAspectRatio: false });
            } else {
                document.getElementById('top-pages-table').innerHTML = '<div class="alert alert-danger">Failed to load data (Server Error).</div>';
            }
        } catch (e) {
            document.getElementById('top-pages-table').innerHTML = '<div class="alert alert-danger">Failed to load data (Network Error).</div>';
        }
    }
}

function renderChart(canvas, type, data, options) {
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (window.chartInstances[canvas.id]) {
        window.chartInstances[canvas.id].destroy();
    }

    // Explicitly force legend mounting for robust visibility
    options = options || {};
    options.plugins = options.plugins || {};
    if (type === 'pie' || type === 'doughnut') {
        options.plugins.legend = { display: true, position: 'bottom' };
    } else {
        if (!options.plugins.legend) {
            options.plugins.legend = { display: true, position: 'top' };
        }
    }

    window.chartInstances[canvas.id] = new Chart(ctx, {
        type: type,
        data: data,
        options: options
    });
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
                    <div class="card-body">
                        <canvas id="browser-chart" class="w-100" style="height: 250px;"></canvas>
                    </div>
                </div>
            </div>
            <div class="col-md-6">
                 <div class="card border-0 shadow-sm h-100">
                    <div class="card-header bg-white border-bottom-0 pt-4 pb-0"><h5 class="card-title mb-0">Network Types</h5></div>
                    <div class="card-body">
                        <canvas id="network-chart" class="w-100" style="height: 250px;"></canvas>
                    </div>
                </div>
            </div>
        </div>
    `, getSaveReportButton('demographics', 'currentReportData'));

    try {
        const days = document.getElementById('global-date-filter').value;
        const res = await fetch(`/api/data?category=demographics&days=${days}`, { credentials: 'include', cache: 'no-store' });
        if (res.ok) {
            const apiData = await res.json();
            attachSaveVariables(apiData);

            renderChart(document.getElementById('browser-chart'), 'pie', {
                labels: apiData.browsers.map(b => b.browser),
                datasets: [{
                    data: apiData.browsers.map(b => Number(b.count)),
                    backgroundColor: ['#4e73df', '#1cc88a', '#36b9cc', '#f6c23e', '#e74a3b']
                }]
            }, { responsive: true, maintainAspectRatio: false });

            renderChart(document.getElementById('network-chart'), 'doughnut', {
                labels: apiData.networks.map(n => n.network_type),
                datasets: [{
                    data: apiData.networks.map(n => Number(n.count)),
                    backgroundColor: ['#4e73df', '#1cc88a', '#36b9cc', '#f6c23e', '#e74a3b']
                }]
            }, { responsive: true, maintainAspectRatio: false });
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
                    <div class="card-body">
                        <canvas id="clicks-chart" class="w-100" style="height: 250px;"></canvas>
                    </div>
                </div>
            </div>
        </div>
    `, getSaveReportButton('behavior', 'currentReportData'));

    try {
        const days = document.getElementById('global-date-filter').value;
        const res = await fetch(`/api/data?category=behavior&days=${days}`, { credentials: 'include', cache: 'no-store' });
        if (res.ok) {
            const apiData = await res.json();
            attachSaveVariables(apiData);

            renderChart(document.getElementById('clicks-chart'), 'bar', {
                labels: apiData.topClicks.map(c => c.element_tag),
                datasets: [{
                    label: 'Total Clicks',
                    data: apiData.topClicks.map(c => Number(c.clicks)),
                    backgroundColor: '#1cc88a'
                }]
            }, { responsive: true, maintainAspectRatio: false });

            renderChart(document.getElementById('active-time-chart'), 'line', {
                labels: apiData.activeTime.map(d => d.day),
                datasets: [{
                    label: 'Avg Active Time (s)',
                    data: apiData.activeTime.map(d => Number(d.avg_seconds)),
                    borderColor: '#f6c23e',
                    backgroundColor: 'rgba(246, 194, 62, 0.2)',
                    fill: true,
                    tension: 0.4
                }]
            }, { responsive: true, maintainAspectRatio: false });
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
            <div class="modal-dialog modal-xl">
                <div class="modal-content border-0 shadow-lg">
                    <div class="modal-header border-bottom-0 pb-0">
                        <input type="text" id="vr-title" class="form-control form-control-lg border-0 bg-transparent fw-bold fs-4 px-0" ${window.userRole === 'viewer' ? 'disabled' : ''}>
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
                                <textarea id="vr-comments" class="form-control border-0 bg-transparent text-dark px-0" rows="3" ${window.userRole === 'viewer' ? 'disabled' : ''}></textarea>
                            </div>
                        </div>

                        <h6 class="fw-bold mb-3"><i class="bi bi-database me-2"></i>Data Snapshot</h6>
                        <div class="bg-light p-3 rounded" id="vr-snapshot-container" style="min-height: 300px;">
                        </div>
                    </div>
                    ${window.userRole !== 'viewer' ? `
                    <div class="modal-footer border-top-0 d-flex justify-content-between">
                        <button type="button" class="btn btn-outline-danger" id="vr-delete-btn"><i class="bi bi-trash"></i> Delete Report</button>
                        <div>
                            <button type="button" class="btn btn-outline-secondary export-pdf-btn me-2" data-target="vr-snapshot-container"><i class="bi bi-file-earmark-pdf"></i> Export PDF</button>
                            <button type="button" class="btn btn-primary" id="vr-save-btn"><i class="bi bi-check-circle"></i> Save Changes</button>
                        </div>
                    </div>` : `
                    <div class="modal-footer border-top-0 d-flex justify-content-end">
                        <button type="button" class="btn btn-outline-secondary export-pdf-btn" data-target="vr-snapshot-container"><i class="bi bi-file-earmark-pdf"></i> Export PDF</button>
                    </div>`}
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
                    document.getElementById('vr-title').value = r.title;
                    document.getElementById('vr-author').textContent = r.author_email;
                    document.getElementById('vr-date').textContent = new Date(r.created_at).toLocaleString();
                    document.getElementById('vr-category').textContent = r.category;
                    document.getElementById('vr-comments').value = r.comments || '';

                    // CRUD Handlers
                    const saveBtn = document.getElementById('vr-save-btn');
                    if (saveBtn) {
                        saveBtn.onclick = async () => {
                            saveBtn.disabled = true;
                            saveBtn.textContent = 'Saving...';
                            const updatedTitle = document.getElementById('vr-title').value;
                            const updatedComments = document.getElementById('vr-comments').value;
                            await fetch('/api/reports/' + r.id, {
                                method: 'PUT',
                                headers: { 'Content-Type': 'application/json' },
                                credentials: 'include',
                                body: JSON.stringify({ title: updatedTitle, comments: updatedComments })
                            });
                            document.getElementById('viewReportModal').querySelector('.btn-close').click();
                            reportsView();
                        };
                    }
                    const delBtn = document.getElementById('vr-delete-btn');
                    if (delBtn) {
                        delBtn.onclick = async () => {
                            if (confirm("Are you sure you want to delete this report?")) {
                                delBtn.disabled = true;
                                await fetch('/api/reports/' + r.id, { method: 'DELETE', credentials: 'include' });
                                document.getElementById('viewReportModal').querySelector('.btn-close').click();
                                reportsView();
                            }
                        };
                    }

                    const modalEl = document.getElementById('viewReportModal');
                    modalEl.classList.add('show');
                    modalEl.style.display = 'block';
                    modalEl.style.backgroundColor = 'rgba(0,0,0,0.5)';

                    // Render Snapshot AFTER modal is visible
                    const container = document.getElementById('vr-snapshot-container');
                    container.innerHTML = '';
                    try {
                        const parsed = typeof r.data_snapshot === 'string' ? JSON.parse(r.data_snapshot) : r.data_snapshot;
                        renderSnapshotData(container, r.category, parsed);
                    } catch (err) {
                        container.textContent = 'Invalid Snapshot Data';
                    }

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

function renderSnapshotData(container, category, data) {
    if (!data) { container.textContent = "No data."; return; }
    if (category === 'performance') {
        container.innerHTML = `
            <div style="position: relative; height: 250px;" class="w-100 mb-4">
                <canvas id="snap-pageviews"></canvas>
            </div>
            <div class="row">
                <div class="col-md-7" id="snap-pages"></div>
                <div class="col-md-5" id="snap-errors"></div>
            </div>
        `;
        renderChart(document.getElementById('snap-pageviews'), 'line', {
            labels: data.byDay.map(d => d.day),
            datasets: [{
                label: 'Pageviews',
                data: data.byDay.map(d => Number(d.views)),
                borderColor: '#2E86C1', backgroundColor: 'rgba(46, 134, 193, 0.2)', fill: true, tension: 0.4
            }]
        }, { responsive: true, maintainAspectRatio: false });
        renderTable(document.getElementById('snap-pages'), [{ label: 'URL', key: 'url' }, { label: 'Views', key: 'views' }], data.topPages);
        renderTable(document.getElementById('snap-errors'), [{ label: 'Error Type', key: 'error_type' }, { label: 'Count', key: 'count' }], data.topErrors);

    } else if (category === 'demographics') {
        container.innerHTML = `
            <div class="row">
                <div class="col-md-6">
                    <div style="position: relative; height: 250px;" class="w-100">
                        <canvas id="snap-browser"></canvas>
                    </div>
                </div>
                <div class="col-md-6">
                    <div style="position: relative; height: 250px;" class="w-100">
                        <canvas id="snap-network"></canvas>
                    </div>
                </div>
            </div>
        `;
        renderChart(document.getElementById('snap-browser'), 'pie', {
            labels: data.browsers.map(b => b.browser),
            datasets: [{ data: data.browsers.map(b => Number(b.count)), backgroundColor: ['#4e73df', '#1cc88a', '#36b9cc', '#f6c23e', '#e74a3b'] }]
        }, { responsive: true, maintainAspectRatio: false });
        renderChart(document.getElementById('snap-network'), 'doughnut', {
            labels: data.networks.map(n => n.network_type),
            datasets: [{ data: data.networks.map(n => Number(n.count)), backgroundColor: ['#4e73df', '#1cc88a', '#36b9cc', '#f6c23e', '#e74a3b'] }]
        }, { responsive: true, maintainAspectRatio: false });

    } else if (category === 'behavior') {
        container.innerHTML = `
            <div style="position: relative; height: 250px;" class="w-100 mb-4">
                <canvas id="snap-active"></canvas>
            </div>
            <div style="position: relative; height: 250px;" class="w-100">
                <canvas id="snap-clicks"></canvas>
            </div>
        `;
        renderChart(document.getElementById('snap-active'), 'line', {
            labels: data.activeTime.map(d => d.day),
            datasets: [{ label: 'Avg Active Time (s)', data: data.activeTime.map(d => Number(d.avg_seconds)), borderColor: '#f6c23e', backgroundColor: 'rgba(246,194,62,0.2)', fill: true, tension: 0.4 }]
        }, { responsive: true, maintainAspectRatio: false });
        renderChart(document.getElementById('snap-clicks'), 'bar', {
            labels: data.topClicks.map(c => c.element_tag),
            datasets: [{ label: 'Total Clicks', data: data.topClicks.map(c => Number(c.clicks)), backgroundColor: '#1cc88a' }]
        }, { responsive: true, maintainAspectRatio: false });

    } else if (category === 'overview') {
        container.innerHTML = `
            <div class="row g-2 mb-3">
                <div class="col-3"><div class="card card-body"><h6>Visitors</h6><h4>${data.visitors}</h4></div></div>
                <div class="col-3"><div class="card card-body"><h6>Views</h6><h4>${data.views}</h4></div></div>
                <div class="col-3"><div class="card card-body"><h6>Bounce Rate</h6><h4>${data.bounceRate}%</h4></div></div>
                <div class="col-3"><div class="card card-body"><h6>Avg Duration</h6><h4>${data.visitDuration}s</h4></div></div>
            </div>
            <div style="position: relative; height: 250px;" class="w-100">
                <canvas id="snap-ov-chart"></canvas>
            </div>
        `;
        renderChart(document.getElementById('snap-ov-chart'), 'line', {
            labels: data.chartData.map(d => d.day),
            datasets: [
                { label: 'Views', data: data.chartData.map(d => Number(d.views)), borderColor: '#1cc88a', backgroundColor: 'rgba(28,200,138,0.1)', fill: true, tension: 0.4 },
                { label: 'Visitors', data: data.chartData.map(d => Number(d.visitors)), borderColor: '#4e73df', backgroundColor: 'rgba(78,115,223,0.1)', fill: true, tension: 0.4 }
            ]
        }, { responsive: true, maintainAspectRatio: false });
    } else {
        container.textContent = "Unsupported category visualization.";
    }
}

function errorPageView(code = 404, title = 'Page Not Found', message = 'The requested dashboard or resource does not exist.') {
    setHeader(`Error ${code}`);
    const html = `
        <div class="d-flex flex-column align-items-center justify-content-center h-100 text-center" style="min-height: 50vh;">
            <div class="mb-4">
                <i class="bi bi-exclamation-triangle-fill text-warning" style="font-size: 5rem; opacity: 0.8;"></i>
            </div>
            <h1 class="display-3 fw-bold text-dark mb-2">${code}</h1>
            <h3 class="h4 text-secondary mb-3">${title}</h3>
            <p class="text-muted mb-4" style="max-width: 500px;">${message}</p>
            <a href="#/overview" class="btn btn-primary px-4 py-2 rounded-pill shadow-sm">
                <i class="bi bi-arrow-left me-2"></i>Return to Dashboard
            </a>
        </div>
    `;
    document.getElementById('app-content').innerHTML = html;
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
            if (window.userRole === 'viewer') return errorPageView(403, 'Access Denied', 'Viewer accounts cannot access live data dashboards.');
            overviewView();
            break;
        case '#/performance':
            if (window.userRole === 'viewer') return errorPageView(403, 'Access Denied', 'Viewer accounts cannot access live data dashboards.');
            performanceView();
            break;
        case '#/demographics':
            if (window.userRole === 'viewer') return errorPageView(403, 'Access Denied', 'Viewer accounts cannot access live data dashboards.');
            demographicsView();
            break;
        case '#/behavior':
            if (window.userRole === 'viewer') return errorPageView(403, 'Access Denied', 'Viewer accounts cannot access live data dashboards.');
            behaviorView();
            break;
        case '#/reports':
            reportsView();
            break;
        default:
            errorPageView();
            break;
    }
}

window.addEventListener('hashchange', router);
window.addEventListener('DOMContentLoaded', router);
document.getElementById('global-date-filter').addEventListener('change', router);

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
                if (data.data && data.data.role === 'viewer') {
                    window.location.href = '#/reports';
                } else {
                    window.location.href = '#/overview';
                }
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

// Save Report & PDF Logic
function getSaveReportButton(category, dataName) {
    let html = `<button class="btn btn-sm btn-outline-secondary export-pdf-btn ms-2" data-target="app-content"><i class="bi bi-file-earmark-pdf me-1"></i> Export PDF</button>`;
    if (window.userRole !== 'viewer') {
        html = `<button class="btn btn-sm btn-primary save-report-btn" data-category="${category}" data-var="${dataName}"><i class="bi bi-cloud-arrow-up me-1"></i> Save Snapshot</button>` + html;
    }
    return html;
}

function exportToPDF(elementId, filename, metadata = null) {
    const element = document.getElementById(elementId);
    if (!element) return;

    let header = null;
    if (metadata) {
        header = document.createElement('div');
        header.className = 'pdf-export-header mb-4 p-4 bg-white border rounded shadow-sm';
        header.innerHTML = `
           <h2 class="mb-3 fw-bold text-dark">${metadata.title}</h2>
           <div class="d-flex gap-4 mb-3 text-secondary" style="font-size: 0.95rem;">
               ${metadata.date ? `<div><strong>Date:</strong> ${metadata.date}</div>` : ''}
               ${metadata.author ? `<div><strong>User:</strong> ${metadata.author}</div>` : ''}
               ${metadata.category ? `<div><strong>Tag/Category:</strong> <span class="badge bg-secondary">${metadata.category}</span></div>` : ''}
           </div>
           ${metadata.comments ? `<div class="bg-light p-3 border-start border-4 border-primary text-dark"><strong>Comments:</strong><br/>${metadata.comments}</div>` : ''}
        `;
        element.insertBefore(header, element.firstChild);
    }

    // Configure PDF layout & Canvas scaling to prevent pixelation
    const opt = {
        margin: 0.5,
        filename: filename,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'in', format: 'letter', orientation: 'landscape' }
    };

    html2pdf().set(opt).from(element).save().then(() => {
        if (header) header.remove();
    });
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

    // PDF Export Listener
    if (e.target.closest('.export-pdf-btn')) {
        const btn = e.target.closest('.export-pdf-btn');
        const originalText = btn.innerHTML;
        const targetId = btn.getAttribute('data-target');

        btn.disabled = true;
        btn.innerHTML = '<span class="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span> Generating...';

        let titleName = 'analytics-export.pdf';
        let metadata = null;

        if (targetId === 'vr-snapshot-container') {
            titleName = document.getElementById('vr-title').value.replace(/[^a-z0-9]/gi, '_').toLowerCase() + '.pdf';
            metadata = {
                title: document.getElementById('vr-title').value,
                date: document.getElementById('vr-date').textContent,
                author: document.getElementById('vr-author').textContent,
                category: document.getElementById('vr-category').textContent,
                comments: document.getElementById('vr-comments').value
            };
        } else {
            const hash = window.location.hash.replace('#/', '');
            if (hash) {
                titleName = `${hash}-report-${new Date().toISOString().split('T')[0]}.pdf`;
                const dateSelect = document.getElementById('global-date-filter');
                const dateRange = dateSelect ? dateSelect.options[dateSelect.selectedIndex].text : '';
                metadata = {
                    title: 'Live Dashboard: ' + hash.charAt(0).toUpperCase() + hash.slice(1),
                    date: new Date().toLocaleString() + ' (' + dateRange + ')',
                    author: window.userRole ? window.userRole : 'Live User',
                    category: hash
                };
            }
        }

        // Timeout to allow UI to render spinner before main thread blocks for canvas processing
        setTimeout(() => {
            exportToPDF(targetId, titleName, metadata);
            setTimeout(() => {
                btn.disabled = false;
                btn.innerHTML = originalText;
            }, 1000);
        }, 100);
    }
});