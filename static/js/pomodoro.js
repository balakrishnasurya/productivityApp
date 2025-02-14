document.addEventListener('DOMContentLoaded', function() {
    // Constants
    const DEFAULT_WORK_TIME = 25 * 60; // 25 minutes in seconds
    const DEFAULT_SHORT_BREAK = 5 * 60; // 5 minutes
    const DEFAULT_LONG_BREAK = 15 * 60; // 15 minutes
    const POMODOROS_UNTIL_LONG_BREAK = 4;

    // DOM Elements
    const timerMode = document.getElementById('timerMode');
    const timeDisplay = document.getElementById('timeDisplay');
    const progressIndicator = document.getElementById('progressIndicator');
    const completedCount = document.getElementById('completedCount');
    const toggleTimer = document.getElementById('toggleTimer');
    const resetTimer = document.getElementById('resetTimer');
    const skipPhase = document.getElementById('skipPhase');
    
    // Duration controls
    const workDurationSlider = document.getElementById('workDuration');
    const shortBreakDurationSlider = document.getElementById('shortBreakDuration');
    const longBreakDurationSlider = document.getElementById('longBreakDuration');
    const workDurationValue = document.getElementById('workDurationValue');
    const shortBreakValue = document.getElementById('shortBreakValue');
    const longBreakValue = document.getElementById('longBreakValue');

    // Timer state
    let timeLeft = DEFAULT_WORK_TIME;
    let isActive = false;
    let timerId = null;
    let mode = 'work';
    let completedPomodoros = 0;
    let workDuration = DEFAULT_WORK_TIME;
    let shortBreakDuration = DEFAULT_SHORT_BREAK;
    let longBreakDuration = DEFAULT_LONG_BREAK;

    // Update display functions
    function formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }

    function updateDisplay() {
        timeDisplay.textContent = formatTime(timeLeft);
        completedCount.textContent = completedPomodoros;
        
        const total = mode === 'work' ? workDuration : 
                     mode === 'shortBreak' ? shortBreakDuration : longBreakDuration;
        const progress = ((total - timeLeft) / total) * 100;
        progressIndicator.style.width = `${progress}%`;

        timerMode.textContent = mode === 'work' ? 'Focus Time' : 
                              mode === 'shortBreak' ? 'Short Break' : 'Long Break';
        
        toggleTimer.textContent = isActive ? 'Pause' : 'Start';
    }

    function playNotification() {
        const audio = new Audio('/static/notification.mp3');
        audio.play();
        
        // Show browser notification if permitted
        if (Notification.permission === 'granted') {
            new Notification(mode === 'work' ? 'Break time!' : 'Back to work!', {
                body: mode === 'work' ? 'Time for a break' : 'Break is over, let\'s focus!',
                icon: '/static/favicon.ico'
            });
        }
    }

    // Timer control functions
    function startTimer() {
        if (!isActive) {
            isActive = true;
            timerId = setInterval(() => {
                timeLeft--;
                updateDisplay();

                if (timeLeft <= 0) {
                    clearInterval(timerId);
                    playNotification();
                    handlePhaseComplete();
                }
            }, 1000);
        }
    }

    function pauseTimer() {
        isActive = false;
        clearInterval(timerId);
        updateDisplay();
    }

    function handlePhaseComplete() {
        if (mode === 'work') {
            completedPomodoros++;
            if (completedPomodoros % POMODOROS_UNTIL_LONG_BREAK === 0) {
                mode = 'longBreak';
                timeLeft = longBreakDuration;
            } else {
                mode = 'shortBreak';
                timeLeft = shortBreakDuration;
            }
        } else {
            mode = 'work';
            timeLeft = workDuration;
        }
        updateDisplay();
    }

    // Event listeners
    toggleTimer.addEventListener('click', () => {
        if (isActive) {
            pauseTimer();
        } else {
            startTimer();
        }
    });

    resetTimer.addEventListener('click', () => {
        pauseTimer();
        mode = 'work';
        timeLeft = workDuration;
        completedPomodoros = 0;
        updateDisplay();
    });

    skipPhase.addEventListener('click', () => {
        pauseTimer();
        timeLeft = 0;
        handlePhaseComplete();
    });

    // Duration slider handlers
    function updateDurationDisplay(slider, valueElement) {
        valueElement.textContent = slider.value;
    }

    workDurationSlider.addEventListener('input', () => {
        updateDurationDisplay(workDurationSlider, workDurationValue);
        workDuration = workDurationSlider.value * 60;
        if (mode === 'work' && !isActive) {
            timeLeft = workDuration;
            updateDisplay();
        }
    });

    shortBreakDurationSlider.addEventListener('input', () => {
        updateDurationDisplay(shortBreakDurationSlider, shortBreakValue);
        shortBreakDuration = shortBreakDurationSlider.value * 60;
        if (mode === 'shortBreak' && !isActive) {
            timeLeft = shortBreakDuration;
            updateDisplay();
        }
    });

    longBreakDurationSlider.addEventListener('input', () => {
        updateDurationDisplay(longBreakDurationSlider, longBreakValue);
        longBreakDuration = longBreakDurationSlider.value * 60;
        if (mode === 'longBreak' && !isActive) {
            timeLeft = longBreakDuration;
            updateDisplay();
        }
    });

    // Request notification permission
    if (Notification.permission === 'default') {
        Notification.requestPermission();
    }

    // Initial display update
    updateDisplay();
});