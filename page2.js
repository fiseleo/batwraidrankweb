document.addEventListener("DOMContentLoaded", function() {
    const tableDropdown = document.getElementById('table-dropdown');
    const battleContainer = document.getElementById('battle-container');
    const rowsPerPageDropdown = document.getElementById('rows-per-page');
    
    let chartInstance;
    let currentLimit = parseInt(rowsPerPageDropdown.value); // 默认值为下拉菜单的初始值
    let currentOffset = 0;
    let allRows = []; // 存储所有的行数据，用于分页
    let uniqueRows = []; // 存储去重后的数据

    if (!tableDropdown || !battleContainer || !rowsPerPageDropdown) {
        console.error("Element with id 'table-dropdown', 'battle-container', or 'rows-per-page' not found.");
        return;
    }

    // 加载 SQL.js
    initSqlJs({ locateFile: file => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.5.0/sql-wasm.wasm` }).then(SQL => {
        // 读取数据库文件
        fetch("SQL/dataeraid.db").then(res => res.arrayBuffer()).then(buffer => {
            const db = new SQL.Database(new Uint8Array(buffer));

            // 获取数据库中的所有表名，排除 sqlite_sequence
            const tableNames = db.exec("SELECT name FROM sqlite_master WHERE type='table' AND name != 'sqlite_sequence';");
            console.log("Tables in database:", tableNames);

            // 为每个表名生成一个下拉菜单选项
            tableNames[0].values.forEach((table) => {
                const option = document.createElement('option');
                option.value = table[0];
                option.textContent = table[0];
                tableDropdown.appendChild(option);
            });

            // 监听下拉菜单和每页条目的变化事件
            tableDropdown.addEventListener('change', function() {
                currentOffset = 0; // 重置偏移量
                allRows = []; // 重置所有行数据
                loadAllData(tableDropdown.value, db);
                renderChart(db, tableDropdown.value); // 渲染图表
                loadRanks(); // 加载特定名次的分数
            });

            rowsPerPageDropdown.addEventListener('change', function() {
                currentLimit = parseInt(this.value); // 更新每页条目数
                currentOffset = 0; // 重置偏移量
                loadTableData(currentLimit, currentOffset);
            });
        }).catch(err => console.error("Failed to fetch or process database:", err));
    }).catch(err => console.error("Failed to load SQL.js:", err));

    function loadAllData(tableName, db) {
        const stmt = db.prepare(`SELECT id, BestRankingPoint, Rank FROM "${tableName}" ORDER BY BestRankingPoint DESC`);
        
        // 遍历查询结果并将数据插入表格
        while (stmt.step()) {
            const row = stmt.getAsObject();
            allRows.push(row);
        }

        const filteredRows = allRows.filter(row => {
            const rank = parseInt(row.Rank);
            // 仅保留特定排名的数据
            return [1, 5, 10, 30, 50, 100, 500, 1000, 2000, 3000, 4000, 5000, 6000, 7000, 8000, 9000, 10000, 20000, 30000, 40000].includes(rank) ||
                   (rank >= 50000 && rank % 10000 === 0);  // 50000以后，每5000显示一次
        });

        allRows = filteredRows;
        uniqueRows = [];
        const seenRanks = new Set();
        allRows.forEach(row => {
            if (!seenRanks.has(row.Rank)) {
                seenRanks.add(row.Rank);
                uniqueRows.push(row);
            }
        });
        
        loadTableData(currentLimit, currentOffset); // 加载当前页的数据
    }

    function loadTableData(limit = 8, offset = 0) {
        const rankingTableBody = document.querySelector('.ranking-table tbody');
        rankingTableBody.innerHTML = ''; // 清空表格内容
        
        const rowsToDisplay = uniqueRows.slice(offset, offset + limit); // 获取当前页的数据

        // 插入数据到表格
        rowsToDisplay.forEach((row, index) => {
            const displayRank = `${row.Rank}位`; // 正确显示排名格式
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${displayRank}</td>
                <td>${row.BestRankingPoint}</td>
            `;
            rankingTableBody.appendChild(tr);
        });

        updatePaginationControls(offset, limit);
    }

    function updatePaginationControls(offset, limit) {
        const paginationContainer = document.querySelector('.pagination');
        const paginationInfo = document.querySelector('.pagination-info'); // 获取分页信息元素
        paginationContainer.innerHTML = ''; // 清空分页控件
    
        const totalPages = Math.ceil(uniqueRows.length / limit);
        const currentPage = Math.floor(offset / limit) + 1;
    
        // 更新分页信息
        paginationInfo.textContent = `第 ${currentPage} 頁，共 ${totalPages} 頁`;
        
        // 创建 "上一頁" 按钮
        if (currentPage > 1) {
            const prevButton = document.createElement('button');
            prevButton.textContent = "上一頁";
            prevButton.className = 'enter-button';
            prevButton.addEventListener('click', function() {
                loadTableData(limit, offset - limit);
            });
            paginationContainer.appendChild(prevButton);
        }
    
        // 创建 "下一頁" 按钮
        if (currentPage < totalPages) {
            const nextButton = document.createElement('button');
            nextButton.textContent = "下一頁";
            nextButton.className = 'enter-button';
            nextButton.addEventListener('click', function() {
                loadTableData(limit, offset + limit);
            });
            paginationContainer.appendChild(nextButton);
        }
    }

    function renderChart(db, tableName) {
        const stmt = db.prepare(`SELECT BestRankingPoint FROM "${tableName}" ORDER BY BestRankingPoint DESC LIMIT 10000`);
        const scoreCounts = {};

        while (stmt.step()) {
            const row = stmt.getAsObject();
            if (scoreCounts[row.BestRankingPoint]) {
                scoreCounts[row.BestRankingPoint]++;
            } else {
                scoreCounts[row.BestRankingPoint] = 1;
            }
        }

        const sortedScores = Object.keys(scoreCounts).sort((a, b) => b - a);
        const sortedCounts = sortedScores.map(score => scoreCounts[score]);
        const cumulativeCounts = [];
        let cumulativeSum = 0;
        for (let count of sortedCounts) {
            cumulativeSum += count;
            cumulativeCounts.push(cumulativeSum);
        }

        const ctx = document.getElementById('scoreChart').getContext('2d');

        // 在创建新图表之前，销毁旧图表实例
        if (chartInstance) {
            chartInstance.destroy();
        }

        chartInstance = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: sortedScores,
                datasets: [{
                    label: '累積人数',
                    data: cumulativeCounts,
                    backgroundColor: 'rgba(54, 162, 235, 0.6)',
                    borderColor: 'rgba(54, 162, 235, 1)',
                    borderWidth: 0.8,
                    barThickness: 10
                }]
            },
            options: {
                animation: false,
                indexAxis: 'y',
                aspectRatio: 4,
                scales: {
                    x: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: '累積人數',
                            font: {
                                size: 14
                            },
                            color: '#FFFFFF'
                        }
                    },
                    y: {
                        beginAtZero: false,
                        title: {
                            display: true,
                            text: '分數',
                            font: {
                                size: 14
                            },
                            color: '#FFFFFF'
                        },
                        ticks: {
                            maxTicksLimit: 8,  // 将Y轴分成最多8段
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    }
                }
            }
        });
    }    
    
    function loadRanks() {
        // 从 uniqueRows 中获取第10000名的分数
        const platinumRank = uniqueRows.find(row => row.Rank == 10000);
        const platinumScore = platinumRank ? platinumRank.BestRankingPoint : 'N/A';
    
        // 获取第50000名的分数
        const goldRank = uniqueRows.find(row => row.Rank == 50000);
        const goldScore = goldRank ? goldRank.BestRankingPoint : 'N/A';
    
        // 获取第100000名的分数
        const silverRank = uniqueRows.find(row => row.Rank == 100000);
        const silverScore = silverRank ? silverRank.BestRankingPoint : 'N/A';
    
        // 调用函数来更新页面上的显示
        updateRankDisplay(platinumScore, goldScore, silverScore);
    }
    

    function updateRankDisplay(platinumScore, goldScore, silverScore) {
        document.getElementById('platinum-score').textContent = platinumScore;
        document.getElementById('gold-score').textContent = goldScore;
        document.getElementById('silver-score').textContent = silverScore;
    }
});
