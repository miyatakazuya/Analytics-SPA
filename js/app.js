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

function loginView() {
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

function overviewView() {
    renderView('Overview Dashboard', 'show overview charts');
}

function adminView() {
    renderView('Admin Panel', 'show admin stuff');
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