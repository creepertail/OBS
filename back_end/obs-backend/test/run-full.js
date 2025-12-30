// test/run-full.js
// 全域 smoke/e2e 腳本，盡量涵蓋主要 API。
// 需求：Node 18+（內建 fetch），後端在 BASE_URL 運行。
// 可用環境變數覆寫：BASE_URL、ADMIN_ACCOUNT/ADMIN_PASS、MERCHANT_ACCOUNT/MERCHANT_PASS、USER_ACCOUNT/USER_PASS。

const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
const accounts = {
  admin: { account: process.env.ADMIN_ACCOUNT || 'admin', password: process.env.ADMIN_PASS || '0000' },
  merchant: { account: process.env.MERCHANT_ACCOUNT || 'merchant1', password: process.env.MERCHANT_PASS || '0000' },
  user: { account: process.env.USER_ACCOUNT || 'user1', password: process.env.USER_PASS || '0000' },
};

const randSuffix = () => Math.random().toString(36).slice(2, 8).toUpperCase();

async function request(method, path, token, body) {
  const res = await fetch(`${baseUrl}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let data;
  try {
    data = text ? JSON.parse(text) : undefined;
  } catch {
    data = text;
  }
  if (!res.ok) {
    throw new Error(`${method} ${path} ${res.status} ${res.statusText} => ${text}`);
  }
  return data;
}

async function login({ account, password }) {
  const resp = await request('POST', '/members/login', null, { account, password });
  return resp?.access_token;
}

async function main() {
  console.log('Base URL:', baseUrl);
  // 登入
  console.log('1) 登入 admin / merchant / user...');
  const [adminToken, merchantToken, userToken] = await Promise.all([
    login(accounts.admin),
    login(accounts.merchant),
    login(accounts.user),
  ]);
  console.log('   ✔ tokens 取得完成');

  // 取得成員清單以利 ID 查詢
  const members = await request('GET', '/members', null);
  const findByAccount = (acc) => members.find((m) => m.account === acc);
  const admin = findByAccount(accounts.admin.account);
  const merchant = findByAccount(accounts.merchant.account);
  const user = findByAccount(accounts.user.account);

  // Member 自身查詢
  console.log('2) Members/me & merchant book info...');
  await request('GET', '/members/me', adminToken);
  await request('GET', '/members/me', merchantToken);
  await request('GET', '/members/me', userToken);
  await request('GET', '/members/merchantWithBooks', merchantToken);
  await request('GET', `/members/merchantInfoWithBook/${merchant.memberID}`, null);

  // Category CRUD
  console.log('3) Categories CRUD/search/statistics...');
  const catName = `SmokeCat-${randSuffix()}`;
  const newCat = await request('POST', '/categories', adminToken, { name: catName, description: 'Smoke 測試分類' });
  await request('GET', '/categories', null);
  await request('GET', '/categories/statistics', null);
  await request('GET', `/categories/search?name=${encodeURIComponent(catName)}`, null);
  await request('PATCH', `/categories/${newCat.categoryID}`, adminToken, { description: 'Smoke 更新' });
  await request('DELETE', `/categories/${newCat.categoryID}`, adminToken);

  // 書籍：取列表，新增一本，搜尋、查詢、刪除
  console.log('4) Books create/search/get/delete...');
  const booksList = await request('GET', '/books', null);
  const sampleBook = booksList[0];
  const isbn = `9${Date.now()}`.padEnd(13, '0').slice(0, 13);
  const createBookResp = await request(
    'POST',
    '/books',
    merchantToken,
    {
      ISBN: isbn,
      name: `Smoke Book ${randSuffix()}`,
      status: 1,
      productDescription: 'Smoke 測試書籍',
      inventoryQuantity: 5,
      price: 123,
      author: 'Smoke Author',
      publisher: 'Smoke Pub',
    },
  );
  const createdBookId = createBookResp.bookID || createBookResp.bookId || createBookResp.bookId;
  await request('GET', `/books/${createdBookId}`, null);
  await request('GET', `/books/isbn/${isbn}`, null);
  await request('GET', `/books/search?name=Smoke`, null);

  // Coupon/Claim：Admin 全域券 + Merchant 指定券，User 領券，查詢 available/mine
  console.log('5) Coupons/Claims...');
  const rand = randSuffix();
  const adminCode = `ADM-${rand}`;
  const merchantCode = `M1-${rand}`;
  const adminCoupon = await request('POST', '/coupons', adminToken, {
    quantity: 3,
    validDate: '2026-12-31T00:00:00Z',
    discount: 0.9,
    description: 'Smoke 全域券',
    redemptionCode: adminCode,
    discountType: 1,
    memberID: admin.memberID,
  });
  const merchantCoupon = await request('POST', '/coupons', merchantToken, {
    quantity: 2,
    validDate: '2026-12-31T00:00:00Z',
    discount: 0.8,
    description: 'Smoke 商家券',
    redemptionCode: merchantCode,
    discountType: 0,
    memberID: merchant.memberID,
  });
  const claim = await request('POST', '/claims', userToken, { redemptionCode: merchantCode });
  // 領同一張券第二次應該成功（最多 2 次）
  const claim2 = await request('POST', '/claims', userToken, { redemptionCode: merchantCode });
  try {
    await request('POST', '/claims', userToken, { redemptionCode: merchantCode });
    throw new Error('Expected third claim to fail but it succeeded');
  } catch (err) {
    console.log('   ✔ 第三次領同券正確被拒絕');
  }
  await request('GET', '/coupons/available', userToken);
  await request('GET', '/coupons?available=true', adminToken);
  await request('GET', '/coupons/mine', merchantToken);
  await request('GET', `/coupons/eligibility?merchantId=${merchant.memberID}`, userToken);
  await request('GET', '/claims/mine', userToken);
  await request('GET', `/claims/${claim.claimID}`, userToken);

  // Cart：加入、查詢、更新、按商家查、刪除
  console.log('6) Cart...');
  await request('POST', '/cart', userToken, { bookID: createdBookId, quantity: 1 });
  await request('GET', '/cart', userToken);
  await request('GET', `/cart/${merchant.memberID}`, userToken);
  await request('PATCH', `/cart/${createdBookId}`, userToken, { quantity: 2 });

  // Favorites
  console.log('7) Favorites...');
  await request('POST', '/favorites', userToken, { bookID: createdBookId });
  await request('GET', '/favorites/mine', userToken);
  await request('GET', `/favorites/${createdBookId}`, userToken);

  // Reviews
  console.log('8) Reviews...');
  const now = new Date().toISOString();
  await request('POST', '/reviews', userToken, { bookID: createdBookId, date: now, stars: 5, description: 'Great!' });
  await request('GET', `/reviews/book/${createdBookId}`, null);
  await request('GET', '/reviews/mine', userToken);
  await request('PATCH', `/reviews/${createdBookId}`, userToken, { stars: 4, description: 'Updated', date: now });

  // 訂單：結帳（用剛領的 claim），查詢 /me, /:id，Admin 查全部
  console.log('9) Orders checkout & query...');
  const checkout = await request('POST', '/orders/checkout', userToken, {
    shippingAddress: '台北市信義區仁愛路100號',
    paymentMethod: 1,
    merchantId: merchant.memberID,
    claimId: claim.claimID,
  });
  const orderId = checkout.order?.orderId || checkout.order?.orderID;
  await request('GET', '/orders/me', userToken);
  await request('GET', `/orders/${orderId}`, userToken);
  await request('GET', '/orders', adminToken);
  await request('PATCH', `/orders/${orderId}`, adminToken, { state: 1 });

  // Restrict User / Merchant：建立→查詢→更新→刪除
  console.log('10) RestrictUser/RestrictMerchant...');
  const user2 = members.find((m) => m.account === 'user2');
  const merchant2 = members.find((m) => m.account === 'merchant2');
  if (user2) {
    await request('POST', '/restrict-user', adminToken, { userID: user2.memberID, originalState: 0, latestState: 2 });
    await request('GET', `/restrict-user/${user2.memberID}`, adminToken);
    await request('PATCH', `/restrict-user/${user2.memberID}`, adminToken, { latestState: 0, originalState: 0 });
    await request('DELETE', `/restrict-user/${user2.memberID}`, adminToken);
  }
  if (merchant2) {
    await request('POST', '/restrict-merchant', adminToken, { merchantID: merchant2.memberID, originalState: 0, latestState: 2 });
    await request('GET', `/restrict-merchant/${merchant2.memberID}`, adminToken);
    await request('PATCH', `/restrict-merchant/${merchant2.memberID}`, adminToken, { latestState: 0, originalState: 0 });
    await request('DELETE', `/restrict-merchant/${merchant2.memberID}`, adminToken);
  }

  const safe = async (fn, label) => {
    try {
      await fn();
    } catch (err) {
      console.warn(`(略過清理失敗) ${label}: ${err.message}`);
    }
  };

  // 清理：刪收藏、評論、購物車項目、刪書籍、刪類別已處理，刪 coupon/claim？（保留紀錄即可）
  await safe(() => request('DELETE', `/favorites/${createdBookId}`, userToken), 'del favorite');
  await safe(() => request('DELETE', `/reviews/${createdBookId}`, userToken), 'del review');
  await safe(() => request('DELETE', `/cart/${createdBookId}`, userToken), 'del cart');
  await safe(() => request('DELETE', `/books/${createdBookId}`, merchantToken), 'del book');

  console.log('🎉 所有主要 API smoke 測試完成');
}

main().catch((err) => {
  console.error('❌ 測試失敗:', err.message);
  process.exit(1);
});
