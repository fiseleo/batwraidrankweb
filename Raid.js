document.addEventListener("DOMContentLoaded", function() {
    const raidSeasonURL = 'Filtered_RaidSeasonManageExcelTable.json';
    const eliminateRaidSeasonURL = 'Filtered_EliminateRaidSeasonManageExcelTable.json';
    const raidBossGroupMapURL = 'raidBossGroupMap.json';
    const mechNamesURL = 'mechNames.json';

    let raidBossGroupMap = {};
    let mechNames = [];

    // 使用 Promise.all 并行加载所有 JSON 文件
    Promise.all([
        fetch(raidBossGroupMapURL).then(response => response.json()),
        fetch(mechNamesURL).then(response => response.json()),
        fetch(raidSeasonURL).then(response => response.json()),
        fetch(eliminateRaidSeasonURL).then(response => response.json())
    ])
    .then(([raidBossGroupMapData, mechNamesData, raidSeasonData, eliminateRaidSeasonData]) => {
        raidBossGroupMap = raidBossGroupMapData;
        mechNames = mechNamesData.mechNames;

        // 比较两个数据集，选择最接近当前日期的那个
        const closestRaidData = getClosestRaidData(raidSeasonData, eliminateRaidSeasonData);

        // 处理并显示最近的 RAID 数据
        processRaidData(closestRaidData);
    })
    .catch(error => console.error('Error loading JSON files:', error));

    function getClosestRaidData(raidSeasonData, eliminateRaidSeasonData) {
        const now = new Date();

        const closestRaidSeason = raidSeasonData.reduce((closest, current) => {
            const closestDate = new Date(closest.SeasonStartData);
            const currentDate = new Date(current.SeasonStartData);
            return Math.abs(currentDate - now) < Math.abs(closestDate - now) ? current : closest;
        });

        const closestEliminateRaidSeason = eliminateRaidSeasonData.reduce((closest, current) => {
            const closestDate = new Date(closest.SeasonStartData);
            const currentDate = new Date(current.SeasonStartData);
            return Math.abs(currentDate - now) < Math.abs(closestDate - now) ? current : closest;
        });

        const closestRaidSeasonDate = new Date(closestRaidSeason.SeasonStartData);
        const closestEliminateRaidSeasonDate = new Date(closestEliminateRaidSeason.SeasonStartData);

        // 比较两个最近的时间，返回最接近当前时间的那个
        return Math.abs(closestRaidSeasonDate - now) < Math.abs(closestEliminateRaidSeasonDate - now)
            ? closestRaidSeason
            : closestEliminateRaidSeason;
    }

    function convertRaidBossGroupName(groupName) {
        const parts = groupName.split('_');
        let environment = '';
        let mech = '';
        let armorType = '';
        let originalMechPart = '';

        parts.forEach(part => {
            if (raidBossGroupMap[part]) {
                if (["Outdoor", "Indoor", "Street"].includes(part)) {
                    environment = raidBossGroupMap[part];
                } else if (mechNames.includes(part)) {
                    mech = raidBossGroupMap[part];
                    originalMechPart = part;
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
            mechPart: originalMechPart
        };
    }

    function processRaidData(closestSeason) {
        const startDate = new Date(closestSeason.SeasonStartData);
        const endDate = new Date(closestSeason.SeasonEndData);
        startDate.setHours(startDate.getHours() - 1);
        endDate.setHours(endDate.getHours() - 1);

        const options = { year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric' };
        const formattedStartDate = startDate.toLocaleString('zh-TW', options);
        const formattedEndDate = endDate.toLocaleString('zh-TW', options);

        let raidBossGroups;
        if (closestSeason.OpenRaidBossGroup01) {
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

        const openNowContainer = document.createElement('div');
        openNowContainer.style.display = 'flex';
        openNowContainer.style.alignItems = 'center';
        
        const openNowText = document.createElement('h2');
        openNowText.textContent = '目前開放的是:';
        openNowContainer.appendChild(openNowText);

        let imageLoaded = false;
        raidBossGroups.forEach(group => {
            const { displayName, mechPart } = convertRaidBossGroupName(group);
            
            if (!imageLoaded) {
                const imgFileName = `Raidboss_${mechPart}.png`;
                const imgFilePath = `icon/${imgFileName}`;

                const img = document.createElement('img');
                img.src = imgFilePath;
                img.alt = `${displayName} Image`;
                img.style.width = '100px';
                img.style.marginLeft = '10px';

                openNowContainer.appendChild(img);
                imageLoaded = true;
            }

            const groupContainer = document.createElement('div');
            groupContainer.style.display = 'flex';
            groupContainer.style.alignItems = 'center';

            const textElement = document.createElement('p');
            textElement.innerHTML = displayName;
            groupContainer.appendChild(textElement);
            displayDiv.appendChild(groupContainer);
        });

        displayDiv.prepend(openNowContainer);

        addCountdown(startDate);
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
