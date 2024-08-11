document.addEventListener("DOMContentLoaded", function() {
    const tableDropdown = document.getElementById('table-dropdown');
    const battleContainer = document.getElementById('battle-container');

    if (!tableDropdown || !battleContainer) {
        console.error("Element with id 'table-dropdown' or 'battle-container' not found.");
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

            // 监听下拉菜单的变化事件
            tableDropdown.addEventListener('change', function() {
                loadTableData(tableDropdown.value, db);
            });
        }).catch(err => console.error("Failed to fetch or process database:", err));
    }).catch(err => console.error("Failed to load SQL.js:", err));

    function loadTableData(tableName, db) {
        battleContainer.innerHTML = ''; // 清空之前的数据

        const stmt = db.prepare(`SELECT id, date FROM ${tableName}`);

        // 遍历查询结果并生成 HTML
        let firstBattle;
        let index = 0;

        while (stmt.step()) {
            const row = stmt.getAsObject();
            const battleEntry = document.createElement('div');
            battleEntry.className = 'battle-entry';

            battleEntry.innerHTML = `
                <div class="battle-header">
                    <div class="battle-info">
                        <div class="battle-number">${row.id}</div>
                        <div class="battle-date">${row.date}</div>
                    </div>
                    <div class="battle-action">
                        <button class="enter-button">選擇</button>
                        <span class="drop-arrow">▼</span>
                    </div>
                </div>
            `;

            if (index === 0) {
                firstBattle = battleEntry;
            } else {
                battleEntry.classList.add('additional-entry');
                battleEntry.style.display = 'none'; // 初始状态下隐藏
            }

            battleContainer.appendChild(battleEntry);
            index++;
        }

        // 添加事件监听器
        if (firstBattle) {
            let isExpanded = false;

            firstBattle.querySelector('.drop-arrow').addEventListener('click', function() {
                const additionalEntries = document.querySelectorAll('.additional-entry');

                if (isExpanded) {
                    additionalEntries.forEach(entry => entry.style.display = 'none');
                    this.textContent = '▼';
                    isExpanded = false;
                } else {
                    additionalEntries.forEach(entry => entry.style.display = 'block');
                    this.textContent = '▲';
                    isExpanded = true;
                }
            });
        }
    }
});
