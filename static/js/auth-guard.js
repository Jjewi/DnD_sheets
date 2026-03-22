(function() {
    const token = localStorage.getItem('token');
    const protectedPages = ['dashboard.html', 'sheet.html'];
    const currentPage = window.location.pathname.split('/').pop();
    if (protectedPages.includes(currentPage) && !token) {
        window.location.href = '/static/index.html';
    }
})();
if (protectedPages.includes(currentPage) && !token) {
    window.location.href = '/static/index.html';
}