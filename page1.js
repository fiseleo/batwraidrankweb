document.addEventListener("DOMContentLoaded", function() {
    const tableDropdown = document.getElementById('table-dropdown');
    const battleContainer = document.getElementById('battle-container');
    const rowsPerPageDropdown = document.getElementById('rows-per-page');

    let currentLimit = parseInt(rowsPerPageDropdown.value); // 默认值为下拉菜单的初始值
    let currentOffset = 0;
    let allRows = []; // 存储所有的行数据，用于分页

    if (!tableDropdown || !battleContainer || !rowsPerPageDropdown) {
        console.error("Element with id 'table-dropdown', 'battle-container', or 'rows-per-page' not found.");
        return;
    }

    // 加载 SQL.js
    initSqlJs({ locateFile: file => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.5.0/sql-wasm.wasm` }).then(SQL => {
        // 读取数据库文件
        fetch("SQL/dataraid.db").then(res => res.arrayBuffer()).then(buffer => {
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
        
        // 只保留特定名次
        const filteredRows = allRows.filter(row => {
            const rank = parseInt(row.Rank);
            return [1, 5, 10, 30, 50, 100, 500, 1000].includes(rank) || 
                   (rank >= 1000 && rank % 1000 === 0) || 
                   (rank >= 5000 && rank % 5000 === 0) ||
                   (rank >= 10000 && rank % 10000 === 0) ||
                   (rank >= 35000 && rank % 5000 === 0);
        });
        allRows = filteredRows;
        
        // 清除重复的行
        const uniqueRows = [];
        const seenRanks = new Set();
        allRows.forEach(row => {
            if (!seenRanks.has(row.Rank)) {
                seenRanks.add(row.Rank);
                uniqueRows.push(row);
            }
        });
        allRows = uniqueRows;
        
        loadTableData(currentLimit, currentOffset); // 加载当前页的数据
    }

    function loadTableData(limit = 8, offset = 0) {
        const rankingTableBody = document.querySelector('.ranking-table tbody');
        rankingTableBody.innerHTML = ''; // 清空表格内容
        
        const rowsToDisplay = allRows.slice(offset, offset + limit); // 获取当前页的数据

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
    
        const totalPages = Math.ceil(allRows.length / limit);
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
    
});
