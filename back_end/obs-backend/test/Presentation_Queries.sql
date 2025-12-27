-- ==========================================
-- Presentation Queries and Views
-- Online Bookstore System (OBS)
-- ==========================================

-- ==========================================
-- 1. VIEWS - Useful Database Views
-- ==========================================

-- View 1: 商家統計資訊
CREATE OR REPLACE VIEW MerchantView AS
SELECT
    m.memberID,
    m.merchantName,
    m.email,
    m.phoneNumber,
    m.merchantAddress,
    m.merchantState,
    m.merchantSubscriberCount,
    COUNT(DISTINCT b.bookID) AS totalBooks,
    COUNT(DISTINCT o.orderId) AS totalOrders,
    COALESCE(SUM(o.totalPrice), 0) AS totalRevenue,
    m.createdAt AS joinDate
FROM obs.member m
LEFT JOIN obs.book b ON m.memberID = b.merchantId
LEFT JOIN obs.order o ON m.memberID = o.merchantId
WHERE m.type = 'merchant'
GROUP BY m.memberID, m.merchantName, m.email, m.phoneNumber,
         m.merchantAddress, m.merchantState, m.merchantSubscriberCount, m.createdAt
ORDER BY totalRevenue DESC;

-- View 2: 書籍詳細資訊含分類和商家資訊
CREATE OR REPLACE VIEW BookDetailView AS
SELECT
    b.bookID,
    b.ISBN,
    b.name AS bookName,
    b.author,
    b.publisher,
    b.price,
    b.inventoryQuantity,
    b.status,
    b.productDescription,
    m.merchantName,
    m.email AS merchantEmail,
    GROUP_CONCAT(DISTINCT c.name SEPARATOR ', ') AS categories,
    COUNT(DISTINCT bt.categoryID) AS categoryCount
FROM obs.book b
JOIN obs.member m ON b.merchantId = m.memberID
LEFT JOIN obs.belong_to bt ON b.bookID = bt.bookID
LEFT JOIN obs.category c ON bt.categoryID = c.ID
GROUP BY b.bookID, b.ISBN, b.name, b.author, b.publisher,
         b.price, b.inventoryQuantity, b.status, b.productDescription,
         m.merchantName, m.email
ORDER BY b.name;

-- View 3: 訂單摘要含買家和商家資訊
CREATE OR REPLACE VIEW OrderSummaryView AS
SELECT
    o.orderId,
    o.orderDate,
    o.totalPrice,
    o.totalQuantity,
    o.state,
    o.paymentMethod,
    o.shippingAddress,
    u.userName AS buyerName,
    u.email AS buyerEmail,
    u.phoneNumber AS buyerPhone,
    m.merchantName,
    m.email AS merchantEmail,
    CASE
        WHEN o.couponId IS NOT NULL THEN 'Yes'
        ELSE 'No'
    END AS usedCoupon
FROM obs.order o
JOIN obs.member u ON o.userId = u.memberID
JOIN obs.member m ON o.merchantId = m.memberID
ORDER BY o.orderDate DESC;

-- View 4: 用戶活動摘要(訂單、消費、購物車等)
CREATE OR REPLACE VIEW UserActivityView AS
SELECT
    m.memberID,
    m.userName,
    m.email,
    m.userLevel,
    m.userState,
    COUNT(DISTINCT o.orderId) AS totalOrders,
    COALESCE(SUM(o.totalPrice), 0) AS totalSpent,
    COUNT(DISTINCT ac.bookID) AS cartItems,
    COUNT(DISTINCT s.merchantID) AS subscriptions
FROM obs.member m
LEFT JOIN obs.order o ON m.memberID = o.userId
LEFT JOIN obs.add_to_cart ac ON m.memberID = ac.memberID
LEFT JOIN obs.subscribes s ON m.memberID = s.subscriberID
WHERE m.type = 'user'
GROUP BY m.memberID, m.userName, m.email, m.userLevel, m.userState
ORDER BY totalSpent DESC;

-- View 5: 優惠券使用統計
CREATE OR REPLACE VIEW CouponStatsView AS
SELECT
    c.couponID,
    c.redemptionCode,
    c.description,
    c.discount,
    c.quantity,
    c.validDate,
    m.merchantName AS issuer,
    COUNT(DISTINCT o.orderId) AS timesUsed,
    COALESCE(SUM(o.totalPrice), 0) AS totalOrderValue,
    CASE
        WHEN c.validDate IS NULL THEN 'No Expiry'
        WHEN c.validDate < NOW() THEN 'Expired'
        ELSE 'Active'
    END AS status
FROM obs.coupon c
JOIN obs.member m ON c.memberID = m.memberID
LEFT JOIN obs.order o ON c.couponID = o.couponId
GROUP BY c.couponID, c.redemptionCode, c.description, c.discount,
         c.quantity, c.validDate, m.merchantName
ORDER BY timesUsed DESC;

-- View 6: 各分類的書籍統計
CREATE OR REPLACE VIEW CategoryBooksView AS
SELECT
    c.ID AS categoryID,
    c.name AS categoryName,
    c.description AS categoryDescription,
    COUNT(DISTINCT bt.bookID) AS totalBooks,
    COUNT(DISTINCT b.merchantId) AS merchantCount,
    AVG(b.price) AS avgPrice,
    MIN(b.price) AS minPrice,
    MAX(b.price) AS maxPrice,
    SUM(b.inventoryQuantity) AS totalInventory,
    GROUP_CONCAT(DISTINCT b.name ORDER BY b.name SEPARATOR ' | ') AS bookList
FROM obs.category c
LEFT JOIN obs.belong_to bt ON c.ID = bt.categoryID
LEFT JOIN obs.book b ON bt.bookID = b.bookID
GROUP BY c.ID, c.name, c.description
ORDER BY totalBooks DESC;


-- ==========================================
-- 2. USEFUL QUERIES FOR PRESENTATION
-- ==========================================

-- Query 1: 前 5 名暢銷書籍
SELECT
    b.name AS bookName,
    b.author,
    b.price,
    m.merchantName,
    COUNT(ct.orderID) AS orderCount,
    SUM(ct.quantity) AS totalSold,
    SUM(ct.quantity * b.price) AS totalRevenue
FROM obs.book b
JOIN obs.member m ON b.merchantId = m.memberID
JOIN obs.contain ct ON b.bookID = ct.bookID
JOIN obs.order o ON ct.orderID = o.orderId
WHERE o.state != 0  -- Exclude cancelled orders
GROUP BY b.bookID, b.name, b.author, b.price, m.merchantName
ORDER BY totalSold DESC
LIMIT 5;

-- Query 2: 月度營收報告
SELECT
    DATE_FORMAT(orderDate, '%Y-%m') AS month,
    COUNT(orderId) AS totalOrders,
    SUM(totalPrice) AS revenue,
    AVG(totalPrice) AS avgOrderValue,
    SUM(totalQuantity) AS totalItemsSold
FROM obs.order
WHERE state != 0  -- Exclude cancelled orders
GROUP BY DATE_FORMAT(orderDate, '%Y-%m')
ORDER BY month DESC;

-- Query 3: 商家業績比較
SELECT
    m.merchantName,
    COUNT(DISTINCT b.bookID) AS booksListed,
    COUNT(DISTINCT o.orderId) AS totalOrders,
    SUM(o.totalPrice) AS revenue,
    AVG(o.totalPrice) AS avgOrderValue,
    m.merchantSubscriberCount AS subscribers
FROM obs.member m
LEFT JOIN obs.book b ON m.memberID = b.merchantId
LEFT JOIN obs.order o ON m.memberID = o.merchantId AND o.state != 0
WHERE m.type = 'merchant'
GROUP BY m.memberID, m.merchantName, m.merchantSubscriberCount
HAVING COUNT(DISTINCT b.bookID) > 0
ORDER BY revenue DESC;

-- Query 4: 分類熱門度分析
SELECT
    c.name AS categoryName,
    COUNT(DISTINCT b.bookID) AS totalBooks,
    SUM(b.inventoryQuantity) AS totalInventory,
    AVG(b.price) AS avgPrice,
    COUNT(DISTINCT bt.bookID) AS uniqueBooks
FROM obs.category c
LEFT JOIN obs.belong_to bt ON c.ID = bt.categoryID
LEFT JOIN obs.book b ON bt.bookID = b.bookID
GROUP BY c.ID, c.name
ORDER BY totalBooks DESC;

-- Query 5: 最近 30 天活躍用戶
SELECT
    m.userName,
    m.email,
    m.userLevel,
    COUNT(o.orderId) AS recentOrders,
    SUM(o.totalPrice) AS recentSpending,
    MAX(o.orderDate) AS lastOrderDate
FROM obs.member m
JOIN obs.order o ON m.memberID = o.userId
WHERE o.orderDate >= DATE_SUB(NOW(), INTERVAL 30 DAY)
    AND m.type = 'user'
    AND o.state != 0
GROUP BY m.memberID, m.userName, m.email, m.userLevel
ORDER BY recentSpending DESC
LIMIT 10;

-- Query 6: 庫存警報(低庫存書籍)
SELECT
    b.name AS bookName,
    b.ISBN,
    b.inventoryQuantity,
    b.price,
    m.merchantName,
    m.email AS merchantContact
FROM obs.book b
JOIN obs.member m ON b.merchantId = m.memberID
WHERE b.inventoryQuantity < 10 AND b.status = 1  -- Active books with low stock
ORDER BY b.inventoryQuantity ASC;

-- Query 7: 購物車分析
SELECT
    m.userName,
    COUNT(ac.bookID) AS itemsInCart,
    SUM(b.price * ac.quantity) AS cartValue,
    MAX(ac.dateAdded) AS lastAddedDate
FROM obs.add_to_cart ac
JOIN obs.member m ON ac.memberID = m.memberID
JOIN obs.book b ON ac.bookID = b.bookID
GROUP BY m.memberID, m.userName
HAVING COUNT(ac.bookID) > 0
ORDER BY cartValue DESC;

-- Query 8: 優惠券效益分析
SELECT
    c.redemptionCode,
    c.discount,
    c.description,
    m.merchantName AS issuer,
    COUNT(o.orderId) AS timesUsed,
    AVG(o.totalPrice) AS avgOrderValue,
    SUM(o.totalPrice * (1 - c.discount)) AS totalDiscountGiven
FROM obs.coupon c
JOIN obs.member m ON c.memberID = m.memberID
LEFT JOIN obs.order o ON c.couponID = o.couponId
WHERE o.state != 0
GROUP BY c.couponID, c.redemptionCode, c.discount, c.description, m.merchantName
ORDER BY timesUsed DESC;

-- Query 9: 用戶訂閱趨勢
SELECT
    mer.merchantName,
    COUNT(s.subscriberID) AS subscriberCount,
    mer.merchantSubscriberCount AS recordedCount,
    COUNT(DISTINCT o.orderId) AS ordersFromSubscribers,
    SUM(o.totalPrice) AS revenueFromSubscribers
FROM obs.member mer
LEFT JOIN obs.subscribes s ON mer.memberID = s.merchantID
LEFT JOIN obs.order o ON s.subscriberID = o.userId AND mer.memberID = o.merchantId
WHERE mer.type = 'merchant'
GROUP BY mer.memberID, mer.merchantName, mer.merchantSubscriberCount
ORDER BY subscriberCount DESC;

-- Query 10: 訂單狀態分佈
SELECT
    CASE
        WHEN state = 0 THEN 'Cancelled'
        WHEN state = 1 THEN 'Processing'
        WHEN state = 2 THEN 'Shipped'
        WHEN state = 3 THEN 'Delivered'
        ELSE 'Unknown'
    END AS orderStatus,
    COUNT(*) AS orderCount,
    SUM(totalPrice) AS totalValue,
    AVG(totalPrice) AS avgValue,
    SUM(totalQuantity) AS totalItems
FROM obs.order
GROUP BY state
ORDER BY state;

-- ==========================================
-- 3. PERFORMANCE QUERIES
-- ==========================================

-- Query 11: 從未被訂購的書籍
SELECT
    b.name AS bookName,
    b.author,
    b.price,
    b.inventoryQuantity,
    m.merchantName,
    DATEDIFF(NOW(), b.createdAt) AS daysListed
FROM obs.book b
JOIN obs.member m ON b.merchantId = m.memberID
LEFT JOIN obs.contain ct ON b.bookID = ct.bookID
WHERE ct.bookID IS NULL AND b.status = 1
ORDER BY daysListed DESC;

-- Query 12: 本月最活躍客戶
SELECT
    m.userName,
    m.email,
    COUNT(DISTINCT o.orderId) AS ordersThisMonth,
    SUM(o.totalPrice) AS spentThisMonth,
    AVG(o.totalQuantity) AS avgItemsPerOrder
FROM obs.member m
JOIN obs.order o ON m.memberID = o.userId
WHERE MONTH(o.orderDate) = MONTH(NOW())
    AND YEAR(o.orderDate) = YEAR(NOW())
    AND o.state != 0
GROUP BY m.memberID, m.userName, m.email
ORDER BY ordersThisMonth DESC, spentThisMonth DESC
LIMIT 10;

-- ==========================================
-- END OF QUERIES
-- ==========================================
