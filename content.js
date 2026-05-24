let isEnabled = true;
let adsBlockedCount = 0;
let debounceTimer = null;
const DEBOUNCE_DELAY = 50;

function initialize() {
    chrome.storage.local.get(["enabled", "adsBlocked"], (result) => {
        isEnabled = result.enabled !== undefined ? result.enabled : true;
        adsBlockedCount = result.adsBlocked || 0;

        if (isEnabled) {
            startObserver();
            handleAds();
        }
    });

    chrome.storage.onChanged.addListener((changes, area) => {
        if (area === "local" && changes.enabled) {
            isEnabled = changes.enabled.newValue;

            if (isEnabled) {
                startObserver();
                handleAds();
            } else {
                stopObserver();
            }
        }
    });

    window.addEventListener("message", (event) => {
        if (event.source !== window) return;
        if (event.data && event.data.type === "YT_AD_BLOCKER_COUNT_INCREMENT") {
            incrementBlockCount();
        }
    });
}

let observer = null;

function startObserver() {
    if (observer) return;

    const targetNode = document.getElementById("movie_player") || document.body;

    observer = new MutationObserver((mutations) => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
            handleAds();
        }, DEBOUNCE_DELAY);
    });

    observer.observe(targetNode, {
        childList: true,
        subtree: true,
    });
}

function stopObserver() {
    if (observer) {
        observer.disconnect();
        observer = null;
    }
    clearTimeout(debounceTimer);
}

function handleAds() {
    if (!isEnabled) return;

    try {
        skipVideoAd();
        hideOverlayAds();
        hideCompanionAds();
        dismissAdDialogs();
    } catch (error) {
        console.debug("[YT Ad Blocker] Error in handleAds:", error.message);
    }
}

function skipVideoAd() {
    const moviePlayer = document.getElementById("movie_player");
    const isAdActive = moviePlayer && (
        moviePlayer.classList.contains("ad-showing") || 
        moviePlayer.classList.contains("ad-interrupting")
    );
    
    const adModule = document.querySelector(".video-ads.ytp-ad-module");
    const hasAdModuleContent = adModule && adModule.children.length > 0;
    
    const skipSelectors = [
        "button.ytp-ad-skip-button-modern.ytp-button",
        ".ytp-ad-skip-button-slot button",
        ".ytp-ad-skip-button-container button",
        ".ytp-ad-skip-button-container",
        ".ytp-ad-skip-button",
        ".ytp-ad-skip-button-modern",
        ".ytp-skip-ad-button",
    ];

    let hasSkipButton = false;
    for (const selector of skipSelectors) {
        if (document.querySelector(selector) !== null) {
            hasSkipButton = true;
            break;
        }
    }

    const hasSurveySkip = document.querySelector(
        ".ytp-ad-skip-ad-slot button, .ytp-ad-survey-player-overlay-skip-or-preview button"
    ) !== null;

    if (!isAdActive && !hasAdModuleContent && !hasSkipButton && !hasSurveySkip) {
        return;
    }

    console.log("[YT Ad Blocker] Ad detected!", {
        isAdActive,
        hasAdModuleContent,
        hasSkipButton,
        hasSurveySkip
    });

    const adVideo = document.querySelector("video.html5-main-video");

    if (adVideo) {
        adVideo.playbackRate = 16;
        adVideo.muted = true;
    }

    if (adVideo && adVideo.duration && isFinite(adVideo.duration)) {
        adVideo.currentTime = adVideo.duration;
    }

    console.log("[YT Ad Blocker] Dispatching skip signal to MAIN world...");
    window.postMessage({
        type: "YT_AD_BLOCKER_SKIP",
        selectors: skipSelectors
    }, "*");
}

function simulateRealClick(element) {
    console.debug("[YT Ad Blocker] simulateRealClick has been migrated to MAIN world context.");
}

function hideOverlayAds() {
    const overlaySelectors = [
        ".ytp-ad-overlay-container",
        ".ytp-ad-text-overlay",
        ".ytp-ad-image-overlay",
    ];

    for (const selector of overlaySelectors) {
        const overlays = document.querySelectorAll(selector);
        overlays.forEach((overlay) => {
            overlay.remove();
            incrementBlockCount();
        });
    }
}

// Hide companion ads (sidebar, masthead, in-feed suggested ads)
function hideCompanionAds() {
    const companionSelectors = [
        "#player-ads",
        "ytd-companion-slot-renderer",
        "ytd-promoted-sparkles-web-renderer",
        "ytd-display-ad-renderer",
        "ytd-ad-slot-renderer",
        "ytd-in-feed-ad-layout-renderer",
        "#masthead-ad",
        "ytd-banner-promo-renderer",
    ];

    for (const selector of companionSelectors) {
        const companions = document.querySelectorAll(selector);
        companions.forEach((companion) => {
            companion.style.setProperty("display", "none", "important");
        });
    }
}

function dismissAdDialogs() {
    const dismissSelectors = [
        "button.ytp-ad-overlay-close-button",
        ".ytp-ad-feedback-dialog-close-button",
        'tp-yt-paper-dialog #dismiss-button',
        ".ytp-ad-survey-player-overlay-close-button",
        ".ytp-ad-action-interstitial-close-button",
    ];

    for (const selector of dismissSelectors) {
        const btn = document.querySelector(selector);
        if (btn) {
            simulateRealClick(btn);
        }
    }
}

let persistTimer = null;

function incrementBlockCount() {
    adsBlockedCount++;

    clearTimeout(persistTimer);
    persistTimer = setTimeout(() => {
        chrome.storage.local.set({ adsBlocked: adsBlockedCount });
    }, 2000);
}

initialize();
