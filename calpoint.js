document.addEventListener('DOMContentLoaded', function() {
    fetch("menu.html")
        .then(response => response.text())
        .then(data => {
            document.getElementById("menu-placeholder").innerHTML = data;

            const menuBtn = document.getElementById('menu-btn');
            const sideMenu = document.getElementById('side-menu');
            const mainContent = document.querySelector('.main-content');
            console.log('calcTimeBtn Display:', calcTimeBtn.style.display);

            menuBtn.addEventListener('click', function() {
                sideMenu.classList.toggle('active');
                mainContent.classList.toggle('active');
            });
        });
    
    
    const calcTimeRadio = document.getElementById('calc-time');
    const calcUsedTimeRadio = document.getElementById('calc-used-time');
    const scoreGroup = document.getElementById('score-group');
    const timeGroup = document.getElementById('time-group');
    const timeInput = document.getElementById('time');
    const calcBtn = document.getElementById('calc-btn');
    const timerDisplay = document.getElementById('timer-display');
    const addTimeBtn = document.getElementById('add-time-btn');
    const startBtn = document.getElementById('start-btn');
    const countdownDisplay = document.getElementById('countdown-display');
    const difficultySelect = document.getElementById('difficulty');
    const bossSelect = document.getElementById('boss');
    const scoreInput = document.getElementById('score');
    const calcTimeBtn = document.getElementById('calc-time-btn');


    let isRunning = false;
    let interval;
    if (calcTimeRadio.checked) {
        scoreGroup.style.display = 'block';
        timeGroup.style.display = 'none';
        calcTimeBtn.style.display = 'block';
        addTimeBtn.style.display = 'none';
        timerDisplay.textContent = "用時: 00:00.000";
        calcBtn.textContent = "計算時間";
    } else if (calcUsedTimeRadio.checked) {
        scoreGroup.style.display = 'none';
        timeGroup.style.display = 'block';
        calcTimeBtn.style.display = 'none';
        addTimeBtn.style.display = 'block';
        timerDisplay.textContent = "分數: 00000000";
        calcBtn.textContent = "計算分數";
    }

    calcTimeRadio.addEventListener('change', function() {
        if (this.checked) {
            scoreGroup.style.display = 'block';
            timeGroup.style.display = 'none';
            calcTimeBtn.style.display = 'block';
            addTimeBtn.style.display = 'none';
            timerDisplay.textContent = "用時: 00:00.000";
            calcBtn.textContent = "計算時間";
        }
    });

    calcUsedTimeRadio.addEventListener('change', function() {
        if (this.checked) {
            scoreGroup.style.display = 'none';
            timeGroup.style.display = 'block';
            calcTimeBtn.style.display = 'none';
            addTimeBtn.style.display = 'block';
            calcBtn.textContent = "計算分數";
            timerDisplay.textContent = "分數: 00000000";
        }
    });

    calcTimeBtn.addEventListener('click', function() {
        calculateTimeFromScore();
    });

    calcBtn.addEventListener('click', () => {
        const calcMethod = document.querySelector('input[name="calc-method"]:checked').id;

        if (calcMethod === 'calc-used-time') {
            calculateScoreFromTime(); 
        } else {
            calculateTimeFromScore(); 
        }
    });

    function calculateTimeFromScore() {
        console.log('計算時間按鈕已點擊');

        const difficulty = difficultySelect.value;
        const score = parseInt(scoreInput.value);
        console.log('輸入的分數: ', score);

        const scoreMultiplier = getScoreMultiplier(difficulty);
        console.log('難度分數倍率: ', scoreMultiplier);

        const baseHPScore = getBaseHPScore(difficulty);
        const baseDifficultyScore = getBaseDifficultyScore(difficulty);

        const targetTimeScore = score - (baseHPScore + baseDifficultyScore);
        console.log('目標時間分數: ', targetTimeScore);

        if (targetTimeScore >= 0) {
            const remainingTime = targetTimeScore / scoreMultiplier;
            console.log('剩餘時間（秒）: ', remainingTime);
            
            const usedTime = 3600 - remainingTime;
            const formattedTime = formatTime(usedTime * 1000);
            timerDisplay.textContent = `用時: ${formattedTime}`;
            console.log('更新後的用時: ', formattedTime);
        } else {
            console.log('目標時間分數無效，請檢查輸入分數');
        }
    }

    function calculateScoreFromTime() {
        console.log('計算分數按鈕已點擊');

        const difficulty = difficultySelect.value;
        const time = calculateTotalTime();
        console.log('解析的用時: ', time);

        const scoreMultiplier = getScoreMultiplier(difficulty);
        console.log('難度分數倍率: ', scoreMultiplier);

        const baseHPScore = getBaseHPScore(difficulty);
        const baseDifficultyScore = getBaseDifficultyScore(difficulty);

        const timeScore = (3600 - time) * scoreMultiplier;
        const totalScore = timeScore + baseHPScore + baseDifficultyScore;
        console.log('總分數: ', totalScore);

        if (totalScore >= 0) {
            scoreInput.value = totalScore;
            timerDisplay.textContent = `分數: ${totalScore.toLocaleString()}`;
        } else {
            console.log('無效的用時，請檢查輸入');
            scoreInput.value = '非數值';
        }
    }

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
        const boss = bossSelect.value;
        if (boss == '薇娜' || boss == 'KAITEN FX Mk.0') {
            switch (difficulty) {
                case 'NORMAL': return 229000;
                case 'HARD': return 458000;
                case 'VERYHARD': return 916000;
                case 'HARDCORE': return 1832000;
                case 'EXTREME': return 5392000;
                case 'INSANE': return 12449600;
                case 'TORMENT': return 18876000;
                default: return 0;
            }
        }
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
        const [minutes, rest] = timeString.split(':');
        const [seconds, milliseconds] = rest.split('.');
        return (parseInt(minutes) * 60) + parseInt(seconds) + (parseInt(milliseconds) / 1000);
    }

    function formatTime(ms) {
        let milliseconds = parseInt(ms % 1000);
        let seconds = parseInt((ms / 1000) % 60);
        let minutes = parseInt((ms / (1000 * 60)) % 60);
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(3, '0')}`;
    }

    const timeInputs = document.getElementById('time-inputs');

    addTimeBtn.addEventListener('click', function() {
        const newTimeInput = document.createElement('div');
        newTimeInput.classList.add('time-input-wrapper');
        newTimeInput.innerHTML = `
            <input type="text" class="time-input" placeholder="例如 5:30.300">
            <button class="remove-time-btn btn-primary">刪除</button>
        `;
        timeInputs.appendChild(newTimeInput);

        newTimeInput.querySelector('.remove-time-btn').addEventListener('click', function() {
            timeInputs.removeChild(newTimeInput);
        });
    });

    function calculateTotalTime() {
        const timeInputs = document.querySelectorAll('.time-input');
        let totalMilliseconds = 0;
    
        timeInputs.forEach(input => {
            const timeInSeconds = parseTime(input.value);
            console.log(`Parsed time: ${input.value} -> ${timeInSeconds} seconds`);
            totalMilliseconds += timeInSeconds * 1000; // 转回毫秒累加
        });
    
        const totalTimeInSeconds = totalMilliseconds / 1000;
        console.log(`Total time in seconds: ${totalTimeInSeconds}`);
        return totalTimeInSeconds;
    }
});
