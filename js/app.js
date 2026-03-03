const contentArea = document.getElementById('app-content');

function renderView(title, content) {
    contentArea.innerHTML = `
        <div style="border: 2px dashed #ccc; padding: 2rem; border-radius: 8px;">
            <h1>${title}</h1>
            <p>${content}</p>
        </div>
    `;
}

function setRendercontent(content) {
    contentArea.innerHTML = content;
}

async function loginView() {
    if (await returnAuth()) {
        renderView('Logged In!', '');
        return;
    }
    setRendercontent(`
    <div style="border: 2px dashed #ccc; padding: 2rem; border-radius: 8px;">
        <form id="login-form">
            <h1>Analytics Dashboard</h1>
            <div class="form-group">
                <label for="email">Email</label>
                <input type="email" id="email" name="email" required autocomplete="email">
            </div>
            <div class="form-group">
                <label for="password">Password</label>
                <input type="password" id="password" name="password" required autocomplete="current-password">
            </div>
            <div id="error-message" class="error" hidden></div>
            <button type="submit">Sign In</button>
        </form>
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
            return null;
        }

        const data = await res.json();
        document.getElementById('login-status').textContent = `Signed in as ${data.user.displayName}`;
        return data;
    } catch (err) {
        window.location.hash = '#/login';
        document.getElementById('login-status').textContent = 'Signed Out';
        return null;
    }
}

function renderTable(container, pages) {
    container.innerHTML = '';
    const table = document.createElement('table');
    table.style.width = '100%';
    table.style.borderCollapse = 'collapse';
    table.style.marginTop = '1rem';

    table.innerHTML = `
        <style>
            th, td { border: 1px solid #ccc; padding: 0.5rem; text-align: left; }
            th { background: #eee; }
        </style>
    `;

    const thead = document.createElement('thead');
    thead.innerHTML = '<tr><th>URL</th><th>Views</th></tr>';
    table.appendChild(thead);

    const tbody = document.createElement('tbody');
    (pages || []).forEach(p => {
        const tr = document.createElement('tr');

        const tdUrl = document.createElement('td');
        tdUrl.textContent = p.url; // XSS Safe

        const tdViews = document.createElement('td');
        tdViews.textContent = Number(p.views).toLocaleString();

        tr.appendChild(tdUrl);
        tr.appendChild(tdViews);
        tbody.appendChild(tr);
    });
    table.appendChild(tbody);
    container.appendChild(table);
}

async function overviewView() {
    const data = await checkAuth();
    if (data) {
        setRendercontent(`
            <div style="border: 2px dashed #ccc; padding: 2rem; border-radius: 8px;">
                <h1>Overview Dashboard</h1>
                <p>Protected Analytics Area</p>
                
                <h2>Pageviews Over Time</h2>
                <canvas id="pageviews-chart" width="800" height="300" style="display: block; width: 100%; max-width: 800px; background: #fff;"></canvas>

                <h2>Top Pages</h2>
                <div id="top-pages-table">Loading data...</div>
            </div>
        `);

        try {
            const res = await fetch('/api/pageviews', { credentials: 'include', cache: 'no-store' });
            if (res.ok) {
                const pageData = await res.json();
                renderTable(document.getElementById('top-pages-table'), pageData.topPages);
                renderLineChart(document.getElementById('pageviews-chart'), pageData.byDay, 'day', 'views');
            } else {
                document.getElementById('top-pages-table').textContent = 'Failed to load data (Server Error).';
            }
        } catch (e) {
            document.getElementById('top-pages-table').textContent = 'Failed to load data (Network Error).';
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
async function adminView() {
    const data = await checkAuth();
    if (data) {
        renderView('Admin Panel', '#TODO: do this ltr');
    }
}

function notFoundView() {
    renderView('404 Not Found', 'requested route does not exist');
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
            overviewView();
            break;
        case '#/admin':
            adminView();
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