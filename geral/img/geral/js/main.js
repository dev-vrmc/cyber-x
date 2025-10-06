import { authManager } from './auth.js';
import { updateCartBadge } from './ui.js';

/*=============== FUNÇÃO DE LOGIN / ADMIN ===============*/
const renderLoginContainer = async () => {
    const loginContainer = document.getElementById('login-container');
    if (!loginContainer) return;

    const user = await authManager.getCurrentUser();

    // Limpa o container
    loginContainer.innerHTML = '';

    if (user) {
        const profile = await authManager.fetchUserProfile();
        const isAdmin = profile?.role === 'admin';

        // Ícone do usuário (leva pra conta/admin)
        const userIconLink = document.createElement('a');
        userIconLink.href = isAdmin ? 'account.html' : 'account.html';
        userIconLink.style.display = 'flex';
        userIconLink.style.alignItems = 'center';
        userIconLink.style.textDecoration = 'none';
        userIconLink.style.color = 'inherit';
        userIconLink.innerHTML = `
            <i class="ri-user-line login__btn"></i>
        `;

        loginContainer.appendChild(userIconLink);

        // Painel Admin (apenas se for admin)
        if (isAdmin) {
            const adminLink = document.createElement('a');
            adminLink.href = 'admin.html';
            adminLink.style.display = 'flex';
            adminLink.style.alignItems = 'center';
            adminLink.style.textDecoration = 'none';
            adminLink.style.color = 'inherit';
            adminLink.style.marginLeft = '10px';
            adminLink.innerHTML = `
                <i class="ri-dashboard-line login__btn"></i>
            `;
            loginContainer.appendChild(adminLink);
        }

        // Botão de logout
        const logoutBtn = document.createElement('button');
        logoutBtn.id = 'logout-btn';
        logoutBtn.title = 'Sair';
        logoutBtn.style.background = 'none';
        logoutBtn.style.border = 'none';
        logoutBtn.style.color = 'inherit';
        logoutBtn.style.cursor = 'pointer';
        logoutBtn.style.marginLeft = '10px';
        logoutBtn.style.fontSize = '1.2rem';
        logoutBtn.innerHTML = '<i class="ri-logout-box-line login__btn"></i>';
        logoutBtn.addEventListener('click', () => authManager.logout());

        loginContainer.appendChild(logoutBtn);

    } else {
        // Usuário deslogado
        const link = document.createElement('a');
        link.href = 'login.html';
        link.style.display = 'flex';
        link.style.alignItems = 'center';
        link.style.textDecoration = 'none';
        link.style.color = 'inherit';
        link.innerHTML = `
            <i id="login-icon" class="ri-user-line login__btn"></i>
        `;
        loginContainer.appendChild(link);
    }
};



/*=============== LÓGICA DE BUSCA ===============*/
const initSearchBar = () => {
    const searchInput = document.getElementById('input-search');
    if (!searchInput) return;

    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && searchInput.value.trim()) {
            window.location.href = `search.html?q=${encodeURIComponent(searchInput.value.trim())}`;
        }
    });
};

/*=============== MENU MOBILE ===============*/
const initMobileMenu = () => {
    const navMenu = document.getElementById("nav-menu");
    const navToggle = document.getElementById("nav-toggle");
    const navClose = document.getElementById("nav-close");

    navToggle?.addEventListener("click", () => navMenu.classList.add("show-menu"));
    navClose?.addEventListener("click", () => navMenu.classList.remove("show-menu"));
};

/*=============== TEMA ESCURO ===============*/
const initThemeToggle = () => {
    const themeButton = document.getElementById("theme-button");
    const darkTheme = "dark-theme";
    const iconTheme = "ri-sun-line";

    const selectedTheme = localStorage.getItem("selected-theme");
    const selectedIcon = localStorage.getItem("selected-icon");

    const getCurrentTheme = () => document.body.classList.contains(darkTheme) ? "dark" : "light";
    const getCurrentIcon = () => themeButton.classList.contains(iconTheme) ? "ri-sun-line" : "ri-moon-line";

    if (selectedTheme) {
        document.body.classList[selectedTheme === "dark" ? "add" : "remove"](darkTheme);
        themeButton?.classList[selectedIcon === "ri-sun-line" ? "add" : "remove"](iconTheme);
    }

    themeButton?.addEventListener("click", () => {
        document.body.classList.toggle(darkTheme);
        themeButton.classList.toggle(iconTheme);
        localStorage.setItem("selected-theme", getCurrentTheme());
        localStorage.setItem("selected-icon", getCurrentIcon());
    });
};

/*=============== BARRA DE PROGRESSO ===============*/
const initProgressBar = () => {
    const progressBar = document.querySelector(".progress-bar");
    if (!progressBar) return;

    window.addEventListener("scroll", () => {
        const scrollTop = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const scrollPercent = (scrollTop / docHeight) * 100;
        progressBar.style.width = `${scrollPercent}%`;
    });
};

/*=============== SCROLL UP ===============*/
const initScrollUp = () => {
    const scrollUpEl = document.getElementById('scroll-up');
    if (!scrollUpEl) return;

    window.addEventListener('scroll', () => {
        scrollY >= 350 ? scrollUpEl.classList.add('show-scroll') : scrollUpEl.classList.remove('show-scroll');
    });
};

/*=============== INICIALIZAÇÃO ===============*/
document.addEventListener('DOMContentLoaded', () => {
    renderLoginContainer();
    initSearchBar();
    initMobileMenu();
    initThemeToggle();
    initProgressBar();
    initScrollUp();
    updateCartBadge();
});
