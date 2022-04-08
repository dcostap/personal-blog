window.onload = function () {
    updateTheme();
}

function updateTheme() {
    // check for the OS theme setting
    let systemInitiatedDark = window.matchMedia("(prefers-color-scheme: dark)");

    // setting that overrides OS theme, so user can change it
    let theme = sessionStorage.getItem('theme');

    if ((theme != null && theme == "dark") || (theme == null && systemInitiatedDark.matches)) {
        document.getElementsByTagName("html")[0].setAttribute("data-theme", "dark");
        sessionStorage.setItem('theme', 'dark');
    } else {
        document.getElementsByTagName("html")[0].setAttribute("data-theme", "light");
        sessionStorage.setItem('theme', 'light');
    }

    // if the OS changes theme, we override any configuration to match it
    systemInitiatedDark.addListener(function() {
        sessionStorage.clear();
        updateTheme();
    });
}

function themeSwitcher() {
    let theme = sessionStorage.getItem('theme');
    if (theme == null || theme == "light")
        sessionStorage.setItem('theme', 'dark');
    else
        sessionStorage.setItem('theme', 'light');

    updateTheme();
}