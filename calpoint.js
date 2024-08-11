document.addEventListener('DOMContentLoaded', function() {
    const calcBtn = document.getElementById('calc-btn');
    const startBtn = document.getElementById('start-btn');
    const timerDisplay = document.getElementById('timer-display');
    const countdownDisplay = document.getElementById('countdown-display');
    const timeInput = document.getElementById('time');
    const scoreInput = document.getElementById('score');
    const difficultySelect = document.getElementById('difficulty');
    const bossSelect = document.getElementById('boss');

    let isRunning = false;
    let interval;

    calcBtn.addEventListener('click', () => {
        console.log('計算時間按鈕已點擊');

        const difficulty = difficultySelect.value;
        const boss = bossSelect.value;
        const score = parseInt(scoreInput.value);
        console.log('輸入的分數: ', score);

        const scoreMultiplier = getScoreMultiplier(difficulty);
        console.log('難度分數倍率: ', scoreMultiplier);

        const baseHPScore = getBaseHPScore(difficulty); // 根據難度取得對應的基礎 HP 分數
        const baseDifficultyScore = getBaseDifficultyScore(difficulty); // 根據難度取得對應的基礎難度分數

        // 計算目標時間分數
        const targetTimeScore = score - (baseHPScore + baseDifficultyScore);
        console.log('目標時間分數: ', targetTimeScore);

        if (targetTimeScore >= 0) {
            // 計算剩餘時間
            const remainingTime = targetTimeScore / scoreMultiplier;
            console.log('剩餘時間（秒）: ', remainingTime);
            
            const usedTime = 3600 - remainingTime; // 3600 秒是 60 分鐘
            const formattedTime = formatTime(usedTime * 1000); // 转换为毫秒显示
            timerDisplay.textContent = `用時: ${formattedTime}`; // 更新顯示
            console.log('更新後的用時: ', formattedTime);
            timeInput.value = formattedTime;
        } else {
            console.log('目標時間分數無效，請檢查輸入分數');
        }
    });

    startBtn.addEventListener('click', () => {
        if (isRunning) {
            clearInterval(interval);
            isRunning = false;
        } else {
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

    function getScoreMultiplier(difficulty) {
        switch (difficulty) {
            case 'NORMAL': return 120;
            case 'HARD': return 240;
            case 'VERYHARD': return 480;
            case 'HARDCORE': return 960;
            case 'EXTREME': return 1440;
            case 'INSANE': return 1920;
            case 'TORMENT': return 2400;
            default: return 0;
        }
    }

    function getBaseHPScore(difficulty) {
        switch (difficulty) {
            case 'NORMAL': return 227000;
            case 'HARD': return 554000;
            case 'VERYHARD': return 1080000;
            case 'HARDCORE': return 2160000;
            case 'EXTREME': return 5080000;
            case 'INSANE': return 10160000;
            case 'TORMENT': return 19508000;
            default: return 0;
        }
    }

    function getBaseDifficultyScore(difficulty) {
        switch (difficulty) {
            case 'NORMAL': return 250000;
            case 'HARD': return 500000;
            case 'VERYHARD': return 1000000;
            case 'HARDCORE': return 2000000;
            case 'EXTREME': return 4000000;
            case 'INSANE': return 6800000;
            case 'TORMENT': return 12200000;
            default: return 0;
        }
    }

    function parseTime(timeString) {
        const [minutes, rest] = timeString.split(':'); // 分鐘和其餘部分
        const [seconds, milliseconds] = rest.split('.'); // 秒和毫秒
        return (parseInt(minutes) * 60) + parseInt(seconds) + (parseInt(milliseconds) / 1000);
    }
    

    function formatTime(ms) {
        let milliseconds = parseInt(ms % 1000);
        let seconds = parseInt((ms / 1000) % 60);
        let minutes = parseInt((ms / (1000 * 60)) % 60);
        let hours = parseInt((ms / (1000 * 60 * 60)) % 24);

        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(3, '0')}`;
    }
});
