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
SELECT *
FROM OrderSummaryView;