// Alternância de Tema (Dark / Light Mode)
const ThemeManager = {
  init() {
    const savedTheme = localStorage.getItem('techpanca_theme') || 'dark';
    this.setTheme(savedTheme);

    document.addEventListener('click', (e) => {
      const btn = e.target.closest('.theme-toggle-btn');
      if (btn) {
        e.preventDefault();
        this.toggle();
      }
    });
  },

  toggle() {
    const current = document.documentElement.classList.contains('dark') ? 'dark' : 'light';
    const next = current === 'dark' ? 'light' : 'dark';
    this.setTheme(next);
  },

  setTheme(theme) {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
      localStorage.setItem('techpanca_theme', 'dark');
      this.updateIcons('dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
      localStorage.setItem('techpanca_theme', 'light');
      this.updateIcons('light');
    }
  },

  updateIcons(theme) {
    const icons = document.querySelectorAll('.theme-icon');
    icons.forEach(icon => {
      icon.textContent = theme === 'dark' ? 'light_mode' : 'dark_mode';
    });
    const labels = document.querySelectorAll('.theme-label');
    labels.forEach(label => {
      label.textContent = theme === 'dark' ? 'Modo Claro' : 'Modo Escuro';
    });
  }
};

document.addEventListener('DOMContentLoaded', () => {
  ThemeManager.init();
});
