(function() {
    console.log("[YT Ad Blocker - Main World] Initializing...");

    const originalAddEventListener = EventTarget.prototype.addEventListener;
    const originalRemoveEventListener = EventTarget.prototype.removeEventListener;

    const listenerMap = new WeakMap();

    try {
        EventTarget.prototype.addEventListener = function(type, listener, options) {
            if (!listener) {
                return originalAddEventListener.call(this, type, listener, options);
            }

            let wrappedListener = listener;

            if (typeof listener === "function") {
                wrappedListener = function(event) {
                    if (event && event.__simulatedTrusted === true) {
                        const eventProxy = new Proxy(event, {
                            get(target, prop) {
                                if (prop === "isTrusted") {
                                    return true;
                                }
                                const val = Reflect.get(target, prop);
                                return typeof val === "function" ? val.bind(target) : val;
                            }
                        });
                        return listener.call(this, eventProxy);
                    }
                    return listener.call(this, event);
                };
                listenerMap.set(listener, wrappedListener);
            }
            else if (listener && typeof listener.handleEvent === "function") {
                wrappedListener = {
                    handleEvent(event) {
                        if (event && event.__simulatedTrusted === true) {
                            const eventProxy = new Proxy(event, {
                                get(target, prop) {
                                    if (prop === "isTrusted") {
                                        return true;
                                    }
                                    const val = Reflect.get(target, prop);
                                    return typeof val === "function" ? val.bind(target) : val;
                                }
                            });
                            return listener.handleEvent(eventProxy);
                        }
                        return listener.handleEvent(event);
                    }
                };
                listenerMap.set(listener, wrappedListener);
            }

            return originalAddEventListener.call(this, type, wrappedListener, options);
        };

        EventTarget.prototype.removeEventListener = function(type, listener, options) {
            const wrapped = listenerMap.get(listener) || listener;
            return originalRemoveEventListener.call(this, type, wrapped, options);
        };

        console.log("[YT Ad Blocker - Main World] Event.prototype.isTrusted Proxy Interceptor successfully established!");
    } catch (err) {
        console.error("[YT Ad Blocker - Main World] Failed to register Proxy Interceptor:", err);
    }

    document.addEventListener("ratechange", (e) => {
        const video = e.target;
        if (video && video.tagName === "VIDEO") {
            const player = document.getElementById("movie_player");
            const isAdShowing = player && (
                player.classList.contains("ad-showing") || 
                player.classList.contains("ad-interrupting")
            );

            if (isAdShowing) {
                if (video.playbackRate !== 16) {
                    console.log(`[YT Ad Blocker - Main World] YouTube tried to reset speed to ${video.playbackRate}x. Forcing back to 16x!`);
                    video.playbackRate = 16;
                    video.muted = true;
                }
                
                if (video.duration && isFinite(video.duration) && video.currentTime < video.duration - 0.1) {
                    video.currentTime = video.duration;
                }
            }
        }
    }, true);

    function skipViaPlayerAPI() {
        const player = document.getElementById("movie_player");
        if (player) {
            console.log("[YT Ad Blocker - Main World] Found movie player:", player, "has skipAd method:", typeof player.skipAd);
            if (typeof player.skipAd === "function") {
                try {
                    player.skipAd();
                    console.log("[YT Ad Blocker - Main World] Skipped ad via native movie_player.skipAd() API!");
                    return true;
                } catch (err) {
                    console.warn("[YT Ad Blocker - Main World] skipAd() call failed:", err);
                }
            }
        } else {
            console.log("[YT Ad Blocker - Main World] movie_player element not found.");
        }
        return false;
    }

    function simulateRealTrustedClick(element) {
        const rect = element.getBoundingClientRect();
        if (rect.width === 0 || rect.height === 0) {
            console.log("[YT Ad Blocker - Main World] Skip button is not visible in viewport yet.");
            return;
        }

        const x = rect.left + rect.width / 2;
        const y = rect.top + rect.height / 2;

        const eventOptions = {
            bubbles: true,
            cancelable: true,
            composed: true,
            view: window,
            clientX: x,
            clientY: y,
            screenX: x,
            screenY: y,
            button: 0,
            buttons: 1,
        };

        const eventTypes = [
            { type: "pointerdown", class: PointerEvent },
            { type: "mousedown", class: MouseEvent },
            { type: "pointerup", class: PointerEvent },
            { type: "mouseup", class: MouseEvent },
            { type: "click", class: MouseEvent }
        ];

        console.log(`[YT Ad Blocker - Main World] Dispatching isTrusted:true click chain on skip button at (${x.toFixed(1)}, ${y.toFixed(1)})...`);

        eventTypes.forEach(evtInfo => {
            try {
                const evt = new evtInfo.class(evtInfo.type, eventOptions);
                
                Object.defineProperty(evt, "__simulatedTrusted", {
                    value: true,
                    writable: false,
                    configurable: false
                });

                element.dispatchEvent(evt);
            } catch (err) {
                console.error(`[YT Ad Blocker - Main World] Failed to dispatch event ${evtInfo.type}:`, err);
            }
        });

        try {
            element.click();
            console.log("[YT Ad Blocker - Main World] Standard element.click() executed as final fallback.");
        } catch (err) {
        }
    }

    window.addEventListener("message", (event) => {
        if (event.source !== window) return;

        const message = event.data;
        if (!message || message.type !== "YT_AD_BLOCKER_SKIP") return;

        console.log("[YT Ad Blocker - Main World] Skip command received from isolated world.");

        const apiSuccess = skipViaPlayerAPI();
        if (apiSuccess) {
            window.postMessage({ type: "YT_AD_BLOCKER_COUNT_INCREMENT" }, "*");
            return;
        }

        const selectors = message.selectors || [];
        let clickedAny = false;

        for (const selector of selectors) {
            const btn = document.querySelector(selector);
            if (btn) {
                console.log(`[YT Ad Blocker - Main World] Found skip button via selector "${selector}".`);
                simulateRealTrustedClick(btn);
                clickedAny = true;
                break;
            }
        }

        const surveySkip = document.querySelector(
            ".ytp-ad-skip-ad-slot button, .ytp-ad-survey-player-overlay-skip-or-preview button"
        );
        if (surveySkip) {
            console.log("[YT Ad Blocker - Main World] Found active survey skip button.");
            simulateRealTrustedClick(surveySkip);
            clickedAny = true;
        }

        if (clickedAny) {
            window.postMessage({ type: "YT_AD_BLOCKER_COUNT_INCREMENT" }, "*");
        } else {
            console.log("[YT Ad Blocker - Main World] No skip button elements could be resolved in the DOM.");
        }
    });

    console.log("[YT Ad Blocker - Main World] Initialized successfully.");
})();
