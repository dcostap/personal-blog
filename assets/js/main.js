window.onload = function () {
    updateTheme();
}

function updateTheme() {
    // this checks whether system dark mode is set
    let systemInitiatedDark = window.matchMedia("(prefers-color-scheme: dark)");
    // this checks for session storage telling to override
    // the system preferences
    let theme = sessionStorage.getItem('theme');

    console.log("os_setting_dark: " + systemInitiatedDark.matches);

    if ((theme != null && theme == "dark") || (theme == null && systemInitiatedDark.matches)) {
        document.getElementsByTagName("html")[0].setAttribute("data-theme", "dark");
        sessionStorage.setItem('theme', 'dark');
    } else {
        document.getElementsByTagName("html")[0].setAttribute("data-theme", "light");
        sessionStorage.setItem('theme', 'light');
    }
}

function themeSwitcher() {
    let theme = sessionStorage.getItem('theme');
    if (theme == null || theme == "light")
        sessionStorage.setItem('theme', 'dark');
    else
        sessionStorage.setItem('theme', 'light');

    updateTheme();
}