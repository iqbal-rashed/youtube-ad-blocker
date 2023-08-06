window.onload = () => {
    const targetNode = document.getElementById("movie_player") || document.body;
    selfObserver(targetNode);
};

function selfObserver(documentNode) {
    const observer = new MutationObserver(function () {
        adFunction();
    });

    const config = {
        subtree: true,
        childList: true,
    };

    // Start observing
    observer.observe(documentNode, config);
}

function adFunction() {
    const mainDocument = document.getElementsByClassName(
        "video-ads ytp-ad-module"
    );
    const playerOverlay = document.getElementsByClassName(
        "ytp-ad-player-overlay"
    );
    const imageOverlay = document.getElementsByClassName(
        "ytp-ad-image-overlay"
    );

    const skipBtn = document.getElementsByClassName(
        "ytp-ad-skip-button ytp-button"
    );

    const newSkipBtn = document.getElementsByClassName(
        "ytp-ad-skip-button-modern ytp-button"
    );

    const videoDocument = document.getElementsByClassName(
        "video-stream html5-main-video"
    );

    const textOverlay = document.getElementsByClassName("ytp-ad-text-overlay");

    const playerAds = document.getElementById("player-ads");

    function handleSkipBtn() {
        if (skipBtn.length > 0) {
            skipBtn[0].click();
        }
    }

    function handleNewSkipBtn() {
        if (newSkipBtn.length > 0) {
            newSkipBtn[0].click();
        }
    }

    if (mainDocument.length > 0) {
        handleSkipBtn();
        handleNewSkipBtn();
        if (playerOverlay.length > 0) {
            playerOverlay[0].style.visibility = "hidden";
            for (let i = 0; i < videoDocument.length; i++) {
                if (videoDocument[i] && videoDocument[i].duration) {
                    videoDocument[i].currentTime = videoDocument[i].duration;
                }
            }
            handleSkipBtn();
            handleNewSkipBtn();
        }
        if (imageOverlay.length > 0) {
            imageOverlay[0].style.visibility = "hidden";
        }
    }

    if (playerAds) {
        playerAds.style.display = "none";
    }

    if (textOverlay.length > 0) {
        textOverlay[0].style.display = "none";
    }
}
