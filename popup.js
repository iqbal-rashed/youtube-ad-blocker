const enableToggle = document.getElementById("enableToggle");
const statusDot = document.getElementById("statusDot");
const stateText = document.getElementById("stateText");
const adsBlockedCount = document.getElementById("adsBlockedCount");
const timeSavedCount = document.getElementById("timeSavedCount");
const refreshTabBtn = document.getElementById("refreshTabBtn");

function initPopup() {
    chrome.storage.local.get(["enabled", "adsBlocked"], (result) => {
        const isEnabled = result.enabled !== undefined ? result.enabled : true;
        const blocked = result.adsBlocked || 0;

        enableToggle.checked = isEnabled;
        updateStatusUI(isEnabled);
        adsBlockedCount.textContent = formatNumber(blocked);
        updateTimeSaved(blocked);
    });
}

enableToggle.addEventListener("change", () => {
    const isEnabled = enableToggle.checked;
    chrome.storage.local.set({ enabled: isEnabled });
    updateStatusUI(isEnabled);
});

function updateStatusUI(isEnabled) {
    if (isEnabled) {
        statusDot.classList.remove("inactive");
        stateText.textContent = "Active";
    } else {
        statusDot.classList.add("inactive");
        stateText.textContent = "Paused";
    }
}

function formatNumber(num) {
    return new Intl.NumberFormat().format(num);
}

function updateTimeSaved(blockedCount) {
    const secondsSaved = blockedCount * 15;
    if (secondsSaved < 60) {
        timeSavedCount.textContent = `${secondsSaved}s`;
    } else if (secondsSaved < 3600) {
        const minutes = Math.floor(secondsSaved / 60);
        const seconds = secondsSaved % 60;
        timeSavedCount.textContent = `${minutes}m ${seconds}s`;
    } else {
        const hours = Math.floor(secondsSaved / 3600);
        const minutes = Math.floor((secondsSaved % 3600) / 60);
        timeSavedCount.textContent = `${hours}h ${minutes}m`;
    }
}

chrome.storage.onChanged.addListener((changes, area) => {
    if (area !== "local") return;

    if (changes.adsBlocked) {
        const count = changes.adsBlocked.newValue;
        adsBlockedCount.textContent = formatNumber(count);
        updateTimeSaved(count);
    }

    if (changes.enabled) {
        enableToggle.checked = changes.enabled.newValue;
        updateStatusUI(changes.enabled.newValue);
    }
});

refreshTabBtn.addEventListener("click", () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs && tabs[0]) {
            chrome.tabs.reload(tabs[0].id);
        }
    });
});

initPopup();
