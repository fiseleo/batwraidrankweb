document.addEventListener("DOMContentLoaded", function() {
    const menuBtn = document.getElementById('menu-btn');
    const sideMenu = document.getElementById('side-menu');

    menuBtn.addEventListener('click', function() {
        if (sideMenu.classList.contains('active')) {
            sideMenu.classList.remove('active');
        } else {
            sideMenu.classList.add('active');
        }
    });
});
