document.addEventListener('DOMContentLoaded', function() {
    const calcBtn = document.getElementById('calc-btn');
    const startBtn = document.getElementById('start-btn');
    const timerDisplay = document.getElementById('timer-display');
    const countdownDisplay = document.getElementById('countdown-display');

    let startTime, interval;
    let isRunning = false; // 用于跟踪计时器是否正在运行

    calcBtn.addEventListener('click', () => {
        startTime = Date.now();
        clearInterval(interval);
        interval = setInterval(() => {
            const elapsedTime = Date.now() - startTime;
            timerDisplay.textContent = `用時: ${formatTime(elapsedTime)}`;
        }, 10);
    });

    startBtn.addEventListener('click', () => {
        if (isRunning) {
            // 如果计时器正在运行，暂停计时
            clearInterval(interval);
            isRunning = false;
        } else {
            // 如果计时器没有运行，开始计时
            isRunning = true;
            let countdownTime = parseInt(document.getElementById('countdown').value) * 60000;
            interval = setInterval(() => {
                countdownTime -= 10;
                countdownDisplay.textContent = formatTime(countdownTime);
                if (countdownTime <= 0) {
                    clearInterval(interval);
                    countdownDisplay.textContent = '00:00:00.000';
                    isRunning = false;
                }
            }, 10);
        }
    });

    function formatTime(ms) {
        let milliseconds = parseInt((ms % 1000) / 10);
        let seconds = parseInt((ms / 1000) % 60);
        let minutes = parseInt((ms / (1000 * 60)) % 60);
        let hours = parseInt((ms / (1000 * 60 * 60)) % 24);

        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(3, '0')}`;
    }
});
