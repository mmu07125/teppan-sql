PRAGMA foreign_keys = ON;
CREATE TABLE dining_tables (
 table_id INTEGER PRIMARY KEY,
 table_name TEXT NOT NULL UNIQUE,
 seats INTEGER NOT NULL CHECK(seats > 0),
 zone TEXT NOT NULL
);
CREATE TABLE menu_items (
 item_id INTEGER PRIMARY KEY,
 item_name TEXT NOT NULL,
 category TEXT NOT NULL,
 price INTEGER NOT NULL CHECK(price >= 0)
);
CREATE TABLE orders (
 order_id INTEGER PRIMARY KEY,
 table_id INTEGER NOT NULL REFERENCES dining_tables(table_id),
 ordered_at TEXT NOT NULL,
 closed_at TEXT,
 status TEXT NOT NULL CHECK(status IN ('paid','open','cancelled')),
 guests INTEGER NOT NULL CHECK(guests > 0)
);
CREATE TABLE order_items (
 order_id INTEGER NOT NULL REFERENCES orders(order_id),
 line_no INTEGER NOT NULL CHECK(line_no > 0),
 item_id INTEGER NOT NULL REFERENCES menu_items(item_id),
 quantity INTEGER NOT NULL CHECK(quantity > 0),
 unit_price INTEGER NOT NULL CHECK(unit_price >= 0),
 PRIMARY KEY(order_id, line_no)
);
INSERT INTO dining_tables VALUES
(1,'桌01',2,'吧台'),(2,'桌02',4,'吧台'),(3,'桌03',2,'吧台'),
(4,'桌04',4,'窗邊'),(5,'桌05',4,'窗邊'),(6,'桌06',6,'包廂');
INSERT INTO menu_items VALUES
(1,'香煎牛排','主餐',280),(2,'蒜香雞腿排','主餐',220),
(3,'黑胡椒豬排','主餐',240),(4,'蒜蓉鮮蝦','海鮮',300),
(5,'香煎鮭魚','海鮮',320),(6,'白飯','附餐',30),
(7,'季節時蔬','單點',80),(8,'奶油菇菇','單點',100);
INSERT INTO orders VALUES
(1001,1,'2026-11-01 12:00','2026-11-01 12:50','paid',2),
(1002,2,'2026-11-01 12:10','2026-11-01 13:00','paid',3),
(1003,3,'2026-11-01 18:00','2026-11-01 18:50','paid',2),
(1004,1,'2026-11-02 12:00','2026-11-02 12:45','paid',2),
(1005,4,'2026-11-02 12:20',NULL,'cancelled',1),
(1006,2,'2026-11-02 18:00','2026-11-02 19:00','paid',2),
(1007,5,'2026-11-03 12:00','2026-11-03 13:00','paid',4),
(1008,1,'2026-11-03 12:30','2026-11-03 13:15','paid',1),
(1009,3,'2026-11-03 18:00',NULL,'open',1),
(1010,6,'2026-11-03 18:10','2026-11-03 19:10','paid',2);
INSERT INTO order_items VALUES
(1001,1,1,2,280),(1001,2,6,1,30),
(1002,1,2,2,220),(1002,2,5,1,320),(1002,3,6,3,30),
(1003,1,3,1,240),(1003,2,4,1,300),
(1004,1,1,1,280),(1004,2,2,1,220),(1004,3,6,2,30),
(1005,1,5,1,320),
(1006,1,4,2,300),(1006,2,6,2,30),
(1007,1,1,2,280),(1007,2,3,2,240),(1007,3,6,4,30),
(1008,1,2,1,220),
(1009,1,1,1,280),(1009,2,6,1,30),
(1010,1,5,2,320),(1010,2,6,2,30);
