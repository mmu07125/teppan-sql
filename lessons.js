const revenueSQL = `SELECT SUM(i.quantity * i.unit_price) AS revenue
FROM orders AS o
JOIN order_items AS i ON i.order_id = o.order_id
WHERE o.status = 'paid';`;
const rankSQL = `SELECT m.item_name, SUM(i.quantity) AS qty,
       SUM(i.quantity * i.unit_price) AS revenue
FROM orders AS o
JOIN order_items AS i ON i.order_id = o.order_id
JOIN menu_items AS m ON m.item_id = i.item_id
WHERE o.status = 'paid'
GROUP BY m.item_id, m.item_name
ORDER BY qty DESC, m.item_id ASC
LIMIT 3;`;
const tableSQL = `SELECT t.table_name, COUNT(o.order_id) AS order_count
FROM dining_tables AS t
LEFT JOIN orders AS o
  ON o.table_id = t.table_id AND o.status = 'paid'
GROUP BY t.table_id, t.table_name
ORDER BY t.table_id;`;
const havingSQL = `SELECT t.table_name,
       SUM(i.quantity * i.unit_price) AS revenue
FROM dining_tables AS t
JOIN orders AS o ON o.table_id = t.table_id
JOIN order_items AS i ON i.order_id = o.order_id
WHERE o.status = 'paid'
GROUP BY t.table_id, t.table_name
HAVING SUM(i.quantity * i.unit_price) >= 1000
ORDER BY t.table_id;`;
const nullSQL = `SELECT order_id, status, closed_at
FROM orders
WHERE closed_at IS NULL
ORDER BY order_id;`;
const unsoldSQL = `SELECT m.item_id, m.item_name
FROM menu_items AS m
WHERE NOT EXISTS (
  SELECT 1 FROM order_items AS i
  JOIN orders AS o ON o.order_id = i.order_id
  WHERE i.item_id = m.item_id AND o.status = 'paid'
)
ORDER BY m.item_id;`;
const dailySQL = `SELECT DATE(o.ordered_at) AS sale_date,
       COUNT(DISTINCT o.order_id) AS order_count,
       SUM(i.quantity * i.unit_price) AS revenue
FROM orders AS o
JOIN order_items AS i ON i.order_id = o.order_id
WHERE o.status = 'paid'
GROUP BY DATE(o.ordered_at)
ORDER BY sale_date;`;
const LESSONS = [
{title:'篩選符合預算的餐點',tag:'WHERE · 邊界',question:'列出單價至少 280 元的餐點，依價格由低到高排序。',sql:`SELECT item_name, price\nFROM menu_items\nWHERE price >= 280\nORDER BY price, item_id;`,variant:`SELECT item_name, price\nFROM menu_items\nWHERE price > 280\nORDER BY price, item_id;`,change:'將 >= 280 改成 > 280',reason:'「至少」包含等於 280。改成嚴格大於後，280 元的香煎牛排被排除，只剩蒜蓉鮮蝦與香煎鮭魚。',expected:{columns:['item_name','price'],values:[['香煎牛排',280],['蒜蓉鮮蝦',300],['香煎鮭魚',320]]},variantExpected:{columns:['item_name','price'],values:[['蒜蓉鮮蝦',300],['香煎鮭魚',320]]},tip:'WHERE 先篩選資料列；ORDER BY 才決定顯示順序。'},
{title:'計算實際已收營收',tag:'JOIN · SUM',question:'統計所有已結帳訂單的餐點金額。營收定義為已結帳明細的數量 × 成交單價，不含服務費、折扣及稅額。',sql:revenueSQL,variant:revenueSQL.replace("\nWHERE o.status = 'paid'",''),change:'移除已結帳狀態條件',reason:'基準營收是 5,280 元。移除 WHERE 後，取消訂單 1005 的 320 元及未結帳訂單 1009 的 310 元也被加總，變成 5,910 元，虛增 630 元。',expected:{columns:['revenue'],values:[[5280]]},variantExpected:{columns:['revenue'],values:[[5910]]},tip:'用 order_items.unit_price 保存成交價格；menu_items.price 只代表目前菜單定價。'},
{title:'找出前三名熱門餐點',tag:'GROUP BY · ORDER BY',question:'只看已結帳訂單，找出銷量最高的前三項餐點，同時顯示銷量與營收。銷量相同時按餐點編號排序。',sql:rankSQL,variant:rankSQL.replace('ORDER BY qty DESC','ORDER BY revenue DESC'),change:'將銷量排名改為營收排名',reason:'按銷量排序是白飯 14 份、香煎牛排 5 份、蒜香雞腿排 4 份；按營收排序則是香煎牛排 1,400 元、香煎鮭魚 960 元、蒜蓉鮮蝦 900 元。「賣最多」與「收入最高」回答的是不同問題。',expected:{columns:['item_name','qty','revenue'],values:[['白飯',14,420],['香煎牛排',5,1400],['蒜香雞腿排',4,880]]},variantExpected:{columns:['item_name','qty','revenue'],values:[['香煎牛排',5,1400],['香煎鮭魚',3,960],['蒜蓉鮮蝦',3,900]]},tip:'GROUP BY 將同一餐點的明細合併後，SUM 計算各組數量。'},
{title:'保留沒有消費的餐桌',tag:'LEFT JOIN · COUNT',question:'列出每張餐桌的已結帳訂單數，即使沒有已結帳紀錄，也要顯示 0。',sql:tableSQL,variant:tableSQL.replace('LEFT JOIN','INNER JOIN'),change:'將 LEFT JOIN 改成 INNER JOIN',reason:'LEFT JOIN 保留全部 6 張餐桌，桌04 的已結帳訂單數是 0。INNER JOIN 只保留成功配對的餐桌，因此桌04 消失，只剩 5 列。COUNT(o.order_id) 不計 NULL；若換成 COUNT(*)，桌04 會被誤算成 1。',expected:{columns:['table_name','order_count'],values:[['桌01',3],['桌02',2],['桌03',1],['桌04',0],['桌05',1],['桌06',1]]},variantExpected:{columns:['table_name','order_count'],values:[['桌01',3],['桌02',2],['桌03',1],['桌05',1],['桌06',1]]},tip:'把狀態條件放在 ON 裡，才能保留沒有已結帳訂單的餐桌。'},
{title:'篩選高營收餐桌',tag:'HAVING · 聚合',question:'找出累計已結帳營收至少 1,000 元的餐桌。',sql:havingSQL,variant:havingSQL.replace('>= 1000','> 1500'),change:'將門檻由 >= 1000 改為 > 1500',reason:'原本有桌01（1,370 元）、桌02（1,510 元）、桌05（1,160 元）。提高門檻後只剩桌02。WHERE 篩選分組前的訂單狀態；HAVING 篩選分組後的營收合計。',expected:{columns:['table_name','revenue'],values:[['桌01',1370],['桌02',1510],['桌05',1160]]},variantExpected:{columns:['table_name','revenue'],values:[['桌02',1510]]},tip:'不能把 SUM(...) >= 1000 直接放進同一層的 WHERE。'},
{title:'正確處理缺值 NULL',tag:'IS NULL · 三值邏輯',question:'找出未記錄結束時間的訂單。注意：沒有結束時間，並不一定代表尚未結帳。',sql:nullSQL,variant:nullSQL.replace('IS NULL','= NULL'),change:'將 IS NULL 改成 = NULL',reason:'正確查詢得到取消訂單 1005 與未結帳訂單 1009。NULL 表示未記錄的值，= NULL 的結果是 UNKNOWN，無法通過 WHERE，因此回傳 0 列。若只找未結帳，應再加入 status = \'open\'。',expected:{columns:['order_id','status','closed_at'],values:[[1005,'cancelled',null],[1009,'open',null]]},variantExpected:{columns:['order_id','status','closed_at'],values:[]},tip:'NULL 不等於空字串，也不等於 0；查缺值請用 IS NULL。'},
{title:'找出尚未售出的餐點',tag:'NOT EXISTS · 子查詢',question:'找出沒有任何已結帳銷售紀錄的菜單餐點，協助店長檢查菜單。',sql:unsoldSQL,variant:unsoldSQL.replace('NOT EXISTS','EXISTS'),change:'將 NOT EXISTS 改成 EXISTS',reason:'NOT EXISTS 找到季節時蔬與奶油菇菇，共 2 項。改成 EXISTS 則得到有已結帳銷售紀錄的 6 項餐點，兩者在這份 8 項菜單中互補。',expected:{columns:['item_id','item_name'],values:[[7,'季節時蔬'],[8,'奶油菇菇']]},variantExpected:{columns:['item_id','item_name'],values:[[1,'香煎牛排'],[2,'蒜香雞腿排'],[3,'黑胡椒豬排'],[4,'蒜蓉鮮蝦'],[5,'香煎鮭魚'],[6,'白飯']]},tip:'關聯子查詢用 i.item_id = m.item_id 判斷「這一道餐點」有沒有賣出。'},
{title:'每日訂單數與營收',tag:'DISTINCT · 重複列',question:'依日期統計已結帳訂單數及營收；一張訂單可能包含多筆明細。',sql:dailySQL,variant:dailySQL.replace('COUNT(DISTINCT o.order_id)','COUNT(o.order_id)'),change:'移除 COUNT 裡的 DISTINCT',reason:'正確的每日訂單數是 3、2、3。移除 DISTINCT 後變成 7、5、6，因為 JOIN 讓同一訂單隨明細重複出現。這其實數到明細列數，營收仍為 1,980、1,220、2,080 元。',expected:{columns:['sale_date','order_count','revenue'],values:[['2026-11-01',3,1980],['2026-11-02',2,1220],['2026-11-03',3,2080]]},variantExpected:{columns:['sale_date','order_count','revenue'],values:[['2026-11-01',7,1980],['2026-11-02',5,1220],['2026-11-03',6,2080]]},tip:'先確認 JOIN 後每一列代表什麼，再決定 COUNT 的對象。'}
];
