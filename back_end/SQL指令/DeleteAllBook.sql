USE obs;
SET FOREIGN_KEY_CHECKS = 0;  -- 暫時停用外鍵檢查
TRUNCATE TABLE book;
TRUNCATE TABLE book_images;
SET FOREIGN_KEY_CHECKS = 1;  -- 重新啟用外鍵檢查