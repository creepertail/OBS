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
SELECT *
FROM CategoryBooksView;