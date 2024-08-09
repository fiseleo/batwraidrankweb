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

            // 加载机甲名称 JSON 文件
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

    // 转换函数
    function convertRaidBossGroupName(groupName) {
        const parts = groupName.split('_');
        let environment = '';
        let mech = '';
        let armorType = '';

        parts.forEach(part => {
            if (raidBossGroupMap[part]) {
                if (["Outdoor", "Indoor", "Street"].includes(part)) {
                    environment = raidBossGroupMap[part];
                } else if (mechNames.includes(part)) {
                    mech = raidBossGroupMap[part];
                } else {
                    armorType = raidBossGroupMap[part];
                }
            }
        });

        return `${environment}${mech}${armorType}`;
    }

    function fetchAndDisplayData(url, isEliminate) {
        fetch(url)
            .then(response => response.json())
            .then(data => {
                // 获取最近的季节
                const closestSeason = data.reduce((closest, current) => {
                    const closestDate = new Date(closest.SeasonStartData);
                    const currentDate = new Date(current.SeasonStartData);
                    return (currentDate > closestDate) ? current : closest;
                });

                // 将 UTC+9 的时间转换为 UTC+8
                const startDate = new Date(closestSeason.SeasonStartData);
                const endDate = new Date(closestSeason.SeasonEndData);

                // 减少 1 小时以转换为 UTC+8
                startDate.setHours(startDate.getHours() - 1);
                endDate.setHours(endDate.getHours() - 1);

                // 使用toLocaleString来格式化时间，确保输出正确的本地时间格式
                const options = { year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric' };
                const formattedStartDate = startDate.toLocaleString('zh-TW', options);
                const formattedEndDate = endDate.toLocaleString('zh-TW', options);

                // 选择要显示的字段
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

                // 显示结果
                const displayDiv = document.getElementById('raid-boss-group');
                displayDiv.innerHTML = `<h2>Season Start Date: ${formattedStartDate}</h2>`;
                displayDiv.innerHTML += `<h2>Season End Date: ${formattedEndDate}</h2>`;
                
                raidBossGroups.forEach(group => {
                    const convertedName = convertRaidBossGroupName(group);
                    displayDiv.innerHTML += `<p>${convertedName}</p>`;
                });
            })
            .catch(error => console.error('Error loading the JSON file:', error));
    }
});
