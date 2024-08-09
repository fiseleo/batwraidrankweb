document.addEventListener("DOMContentLoaded", function() {
    const raidSeasonURL = 'Filtered_RaidSeasonManageExcelTable.json';
    const eliminateRaidSeasonURL = 'Filtered_EliminateRaidSeasonManageExcelTable.json';
    const raidBossGroupMapURL = 'raidBossGroupMap.json';
    const mechNamesURL = 'mechNames.json';

    let raidBossGroupMap = {};
    let mechNames = [];

    // 加载映射表 JSON 文件
    fetch(raidBossGroupMapURL)
        .then(response => response.json())
        .then(data => {
            raidBossGroupMap = data;

            return fetch(mechNamesURL);
        })
        .then(response => response.json())
        .then(data => {
            mechNames = data.mechNames;

            // 加载和显示数据
            fetchAndDisplayData(raidSeasonURL, false);  // 处理第一个 JSON 文件
            fetchAndDisplayData(eliminateRaidSeasonURL, true);  // 处理第二个 JSON 文件
        })
        .catch(error => console.error('Error loading JSON files:', error));

    function convertRaidBossGroupName(groupName) {
        const parts = groupName.split('_');
        let environment = '';
        let mech = '';
        let armorType = '';
        let originalMechPart = ''; // 用于保存原始的mech部分

        parts.forEach(part => {
            if (raidBossGroupMap[part]) {
                if (["Outdoor", "Indoor", "Street"].includes(part)) {
                    environment = raidBossGroupMap[part];
                } else if (mechNames.includes(part)) {
                    mech = raidBossGroupMap[part];
                    originalMechPart = part; // 保存原始的mech部分
                } else {
                    armorType = raidBossGroupMap[part];
                    switch (part) {
                        case "LightArmor":
                            armorColor = 'red';
                            break;
                        case "HeavyArmor":
                            armorColor = 'yellow';
                            break;
                        case "Unarmed":
                            armorColor = 'blue';
                            break;
                        case "ElasticArmor":
                            armorColor = 'purple';
                            break;   
                    }
                }
            }
        });

        return {
            displayName: `${environment}${mech}<span style="color: ${armorColor};">${armorType}</span>`,
            mechPart: originalMechPart // 返回原始的mech部分
        };
    }

    function fetchAndDisplayData(url, isEliminate) {
        fetch(url)
            .then(response => response.json())
            .then(data => {
                const closestSeason = data.reduce((closest, current) => {
                    const closestDate = new Date(closest.SeasonStartData);
                    const currentDate = new Date(current.SeasonStartData);
                    return (currentDate > closestDate) ? current : closest;
                });

                const startDate = new Date(closestSeason.SeasonStartData);
                const endDate = new Date(closestSeason.SeasonEndData);
                startDate.setHours(startDate.getHours() - 1);
                endDate.setHours(endDate.getHours() - 1);

                const options = { year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric' };
                const formattedStartDate = startDate.toLocaleString('zh-TW', options);
                const formattedEndDate = endDate.toLocaleString('zh-TW', options);

                let raidBossGroups;
                if (isEliminate) {
                    raidBossGroups = [
                        closestSeason.OpenRaidBossGroup01,
                        closestSeason.OpenRaidBossGroup02,
                        closestSeason.OpenRaidBossGroup03
                    ];
                } else {
                    raidBossGroups = closestSeason.OpenRaidBossGroup;
                }

                const displayDiv = document.getElementById('raid-boss-group');
                displayDiv.innerHTML = `<h2>開始時間: ${formattedStartDate}</h2>`;
                displayDiv.innerHTML += `<h2>結束時間: ${formattedEndDate}</h2>`;
                // 创建“目前開放”行的容器
                const openNowContainer = document.createElement('div');
                openNowContainer.style.display = 'flex';
                openNowContainer.style.alignItems = 'center';
                
                // 添加“目前開放:”文本
                const openNowText = document.createElement('h2');
                openNowText.textContent = '目前開放的是:';
                openNowContainer.appendChild(openNowText);

                // 添加图片
                let imageLoaded = false;
                raidBossGroups.forEach(group => {
                    const { displayName, mechPart } = convertRaidBossGroupName(group);
                    
                    if (!imageLoaded) {
                        const imgFileName = `Raidboss_${mechPart}.png`;  // 使用原始mech部分生成文件名
                        const imgFilePath = `icon/${imgFileName}`;  // 根据实际路径调整

                        const img = document.createElement('img');
                        img.src = imgFilePath;
                        img.alt = `${displayName} Image`;
                        img.style.width = '100px'; // 设定图片宽度
                        img.style.marginLeft = '10px'; // 添加图片和文字之间的间距

                        openNowContainer.appendChild(img);
                        imageLoaded = true;  // 确保只加载一次图片
                    }

                    // 添加每个开放项目的名称
                    const groupContainer = document.createElement('div');
                    groupContainer.style.display = 'flex';
                    groupContainer.style.alignItems = 'center';

                    const textElement = document.createElement('p');
                    textElement.innerHTML = displayName;
                    groupContainer.appendChild(textElement);
                    displayDiv.appendChild(groupContainer);
                });

                // 将“目前開放:”行添加到页面
                displayDiv.prepend(openNowContainer);

                // 添加倒计时
                addCountdown(startDate);
            })
            .catch(error => console.error('Error loading the JSON file:', error));
    }

    function addCountdown(startDate) {
        const countdownDiv = document.createElement('div');
        countdownDiv.id = 'countdown';
        document.getElementById('raid-boss-group').appendChild(countdownDiv);

        function updateCountdown() {
            const now = new Date();
            const timeDifference = startDate - now;

            if (timeDifference > 0) {
                const days = Math.floor(timeDifference / (1000 * 60 * 60 * 24));
                const hours = Math.floor((timeDifference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                const minutes = Math.floor((timeDifference % (1000 * 60 * 60)) / (1000 * 60));
                const seconds = Math.floor((timeDifference % (1000 * 60)) / 1000);

                countdownDiv.innerHTML = `
                倒數計時:
                <span style="color: red;">${days}</span>天 
                <span style="color: red;">${hours}</span>時  
                <span style="color: red;">${minutes}</span>分 
                <span style="color: red;">${seconds}</span>秒
                `;
            } else {
                countdownDiv.innerHTML = "已經開始！";
            }
        }

        updateCountdown();
        setInterval(updateCountdown, 1000);
    }
});
