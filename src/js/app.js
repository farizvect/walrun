function app() {
    return {
        mode: localStorage.getItem("walrun_selected_mode") || "normal",
        status: "idle",
        phase: "RUN",
        runTime: 60,
        walkTime: 60,
        timeLeft: 60,
        totalTime: 0,
        recordedRuns: [],
        recordedWalks: [],
        phaseSeconds: 0,
        gallowayPace: 7,
        showHistory: false,
        showRecordModal: false,
        showStatsModal: false,
        lastSession: null,
        showToast: false,
        toastMessage: "",
        selectedRecord: null,
        isPaused: false,
        isStandalone: window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone || false,
        deferredPrompt: null,
        isOnboarded: localStorage.getItem("walkrun_onboarded") === "true",
        darkMode: localStorage.getItem("walrun_dark_mode") === "true" || 
                 (localStorage.getItem("walrun_dark_mode") === null && window.matchMedia('(prefers-color-scheme: dark)').matches),
        notificationSound: new Audio('assets/faaah.mp3'),
        history: JSON.parse(
            localStorage.getItem("run_history") || "[]",
        ),
        interval: null,

        init() {
            this.notificationSound.load();
            
            // Re-apply settings for restored mode
            this.setMode(this.mode, false);
            
            // Listen for install prompt
            window.addEventListener('beforeinstallprompt', (e) => {
                e.preventDefault();
                this.deferredPrompt = e;
            });

            window.addEventListener('appinstalled', () => {
                this.isStandalone = true;
                this.deferredPrompt = null;
            });

            // Re-check standalone mode periodically
            setInterval(() => {
                this.isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;
            }, 1000);
        },

        toggleDarkMode() {
            this.darkMode = !this.darkMode;
            localStorage.setItem("walrun_dark_mode", this.darkMode);
        },

        playNotification(times = 1) {
            const playSound = () => {
                const soundClone = this.notificationSound.cloneNode();
                soundClone.play().catch(e => {});
            };

            if (times === 1) {
                playSound();
            } else {
                playSound();
                setTimeout(() => {
                    playSound();
                }, 400);
            }
        },

        finishOnboarding() {
            this.isOnboarded = true;
            localStorage.setItem("walkrun_onboarded", "true");
            this.playNotification();
        },

        async installPWA() {
            if (!this.deferredPrompt) {
                alert("Installation prompt not yet ready. Please try interacting with the page first or use the browser's menu to install.");
                return;
            }
            this.deferredPrompt.prompt();
            const { outcome } = await this.deferredPrompt.userChoice;
            if (outcome === 'accepted') {
                this.deferredPrompt = null;
            }
        },

        setMode(m, save = true) {
            this.mode = m;
            if (save) {
                localStorage.setItem("walrun_selected_mode", m);
            }
            if (m === "normal") {
                this.runTime = 60;
                this.walkTime = 60;
            }
            if (m === "galloway") {
                this.updateGalloway();
            }
            
            if (m === "record") {
                this.timeLeft = 0;
                this.recordedRuns = [];
                this.recordedWalks = [];
                this.phaseSeconds = 0;
            } else {
                this.timeLeft = this.runTime;
            }
        },

        openRecordModal(h) {
            this.selectedRecord = h;
            this.showRecordModal = true;
        },

        useRecord() {
            this.runTime = this.selectedRecord.medianRun || this.selectedRecord.runTime;
            this.walkTime = this.selectedRecord.medianWalk || this.selectedRecord.walkTime;
            this.timeLeft = this.runTime;
            this.mode = 'custom';
            this.showRecordModal = false;
        },

        deleteRecord() {
            this.history = this.history.filter(h => h !== this.selectedRecord);
            localStorage.setItem("run_history", JSON.stringify(this.history));
            this.showRecordModal = false;
            this.triggerToast("Record deleted successfully");
        },

        updateGalloway() {
            const p = parseInt(this.gallowayPace);
            if (p <= 5) {
                this.runTime = 240;
                this.walkTime = 30;
            } else if (p <= 6) {
                this.runTime = 180;
                this.walkTime = 30;
            } else if (p <= 7) {
                this.runTime = 120;
                this.walkTime = 30;
            } else if (p <= 8) {
                this.runTime = 60;
                this.walkTime = 30;
            } else {
                this.runTime = 30;
                this.walkTime = 30;
            }
            this.timeLeft = this.runTime;
        },

        togglePhase() {
            if (this.mode === "record") {
                if (this.phase === "RUN") {
                    this.recordedRuns.push(this.phaseSeconds);
                } else {
                    this.recordedWalks.push(this.phaseSeconds);
                }
                this.phaseSeconds = 0;
                this.timeLeft = 0;
            }

            this.phase = this.phase === "RUN" ? "WALK" : "RUN";
            this.playNotification(this.phase === "RUN" ? 2 : 1);
            
            if (this.mode !== "record") {
                this.timeLeft =
                    this.phase === "RUN"
                        ? this.runTime
                        : this.walkTime;
            }
        },

        formatTime(seconds) {
            const m = Math.floor(seconds / 60);
            const s = seconds % 60;
            return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
        },

        startTimer() {
            this.status = "running";
            this.isPaused = false;
            this.interval = setInterval(() => {
                if (!this.isPaused) {
                    this.totalTime++;
                    if (this.mode === "record") {
                        this.phaseSeconds++;
                        this.timeLeft++;
                    } else {
                        if (this.timeLeft > 0) {
                            this.timeLeft--;
                        } else {
                            this.togglePhase();
                        }
                    }
                }
            }, 1000);
        },

        pauseTimer() {
            this.isPaused = !this.isPaused;
        },

        calculateMedian(arr) {
            if (arr.length === 0) return 60;
            const sorted = [...arr].sort((a, b) => a - b);
            const mid = Math.floor(sorted.length / 2);
            return sorted.length % 2 !== 0 
                ? sorted[mid] 
                : Math.round((sorted[mid - 1] + sorted[mid]) / 2);
        },

        finishSession() {
            let mRun = null;
            let mWalk = null;

            if (this.mode === "record") {
                if (this.phase === "RUN") {
                    this.recordedRuns.push(this.phaseSeconds);
                } else {
                    this.recordedWalks.push(this.phaseSeconds);
                }

                mRun = this.calculateMedian(this.recordedRuns);
                mWalk = this.calculateMedian(this.recordedWalks);
                this.runTime = mRun;
                this.walkTime = mWalk;
            }

            const session = {
                mode: this.mode.toUpperCase(),
                total: this.formatTime(this.totalTime),
                date: new Date().toLocaleDateString("en-US", {
                    day: "2-digit",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                }),
                medianRun: mRun,
                medianWalk: mWalk,
                runTime: this.runTime,
                walkTime: this.walkTime
            };
            this.history.unshift(session);
            this.lastSession = session;
            localStorage.setItem(
                "run_history",
                JSON.stringify(this.history),
            );

            clearInterval(this.interval);
            this.status = "idle";
            this.totalTime = 0;
            this.phase = "RUN";
            this.timeLeft = this.runTime;
            this.phaseSeconds = 0;
            this.showStatsModal = true;
        },

        clearHistory() {
            this.history = [];
            localStorage.removeItem("run_history");
            this.triggerToast("All logs cleared");
        },

        triggerToast(msg) {
            this.toastMessage = msg;
            this.showToast = true;
            setTimeout(() => {
                this.showToast = false;
            }, 3000);
        },
    };
}
