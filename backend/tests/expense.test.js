const request = require('supertest');
const app = require('../src/app');

require('./setup');

describe('Expense Endpoints (/api/expenses & /api/summary)', () => {
  let userAToken;
  let userBToken;

  beforeEach(async () => {
    // Register User A
    const resA = await request(app).post('/api/auth/signup').send({
      name: 'User A',
      email: 'usera@example.com',
      password: 'password123',
      monthlyBudget: 1000,
    });
    userAToken = resA.body.token;

    // Register User B
    const resB = await request(app).post('/api/auth/signup').send({
      name: 'User B',
      email: 'userb@example.com',
      password: 'password123',
      monthlyBudget: 500,
    });
    userBToken = resB.body.token;
  });

  test('POST /api/expenses - creates an expense successfully', async () => {
    const res = await request(app)
      .post('/api/expenses')
      .set('Authorization', `Bearer ${userAToken}`)
      .send({
        amount: 45.5,
        category: 'Food',
        date: '2026-10-06T12:00:00Z',
        note: 'Grocery shopping',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.expense.amount).toBe(45.5);
    expect(res.body.expense.category).toBe('Food');
    expect(res.body.expense.note).toBe('Grocery shopping');
  });

  test('POST /api/expenses - rejects invalid category or negative amount', async () => {
    const resInvalidCat = await request(app)
      .post('/api/expenses')
      .set('Authorization', `Bearer ${userAToken}`)
      .send({
        amount: 20,
        category: 'InvalidCategory',
      });
    expect(resInvalidCat.status).toBe(400);

    const resInvalidAmt = await request(app)
      .post('/api/expenses')
      .set('Authorization', `Bearer ${userAToken}`)
      .send({
        amount: -10,
        category: 'Food',
      });
    expect(resInvalidAmt.status).toBe(400);
  });

  test('GET /api/expenses - filters expenses by category and month', async () => {
    // User A adds 3 expenses
    await request(app)
      .post('/api/expenses')
      .set('Authorization', `Bearer ${userAToken}`)
      .send({ amount: 50, category: 'Food', date: '2026-10-01' });

    await request(app)
      .post('/api/expenses')
      .set('Authorization', `Bearer ${userAToken}`)
      .send({ amount: 100, category: 'Transport', date: '2026-10-05' });

    await request(app)
      .post('/api/expenses')
      .set('Authorization', `Bearer ${userAToken}`)
      .send({ amount: 75, category: 'Food', date: '2026-09-15' });

    // Filter by October 2026
    const resMonth = await request(app)
      .get('/api/expenses?month=2026-10')
      .set('Authorization', `Bearer ${userAToken}`);

    expect(resMonth.status).toBe(200);
    expect(resMonth.body.count).toBe(2);

    // Filter by Food category in October 2026
    const resFoodOct = await request(app)
      .get('/api/expenses?month=2026-10&category=Food')
      .set('Authorization', `Bearer ${userAToken}`);

    expect(resFoodOct.status).toBe(200);
    expect(resFoodOct.body.count).toBe(1);
    expect(resFoodOct.body.expenses[0].amount).toBe(50);
  });

  test('User isolation: User B cannot view or delete User A expenses', async () => {
    const createRes = await request(app)
      .post('/api/expenses')
      .set('Authorization', `Bearer ${userAToken}`)
      .send({ amount: 80, category: 'Bills', note: 'Secret bill' });

    const expenseId = createRes.body.expense._id;

    // User B tries to get User A's expense
    const getRes = await request(app)
      .get(`/api/expenses/${expenseId}`)
      .set('Authorization', `Bearer ${userBToken}`);
    expect(getRes.status).toBe(404);

    // User B tries to delete User A's expense
    const deleteRes = await request(app)
      .delete(`/api/expenses/${expenseId}`)
      .set('Authorization', `Bearer ${userBToken}`);
    expect(deleteRes.status).toBe(404);

    // User A successfully deletes it
    const deleteResA = await request(app)
      .delete(`/api/expenses/${expenseId}`)
      .set('Authorization', `Bearer ${userAToken}`);
    expect(deleteResA.status).toBe(200);
  });

  test('GET /api/summary - correctly calculates totals, budget warning at 80% and 100%', async () => {
    // User A budget is 1000. Add 850 in October 2026 (85% -> warning)
    await request(app)
      .post('/api/expenses')
      .set('Authorization', `Bearer ${userAToken}`)
      .send({ amount: 500, category: 'Rent', date: '2026-10-02' });

    await request(app)
      .post('/api/expenses')
      .set('Authorization', `Bearer ${userAToken}`)
      .send({ amount: 350, category: 'Food', date: '2026-10-04' });

    const summary85 = await request(app)
      .get('/api/summary?month=2026-10')
      .set('Authorization', `Bearer ${userAToken}`);

    expect(summary85.status).toBe(200);
    expect(summary85.body.totalSpent).toBe(850);
    expect(summary85.body.budgetPercentage).toBe(85);
    expect(summary85.body.budgetWarning).toBe('warning');

    // Add another 200 (Total 1050 -> exceeded 105%)
    await request(app)
      .post('/api/expenses')
      .set('Authorization', `Bearer ${userAToken}`)
      .send({ amount: 200, category: 'Shopping', date: '2026-10-05' });

    const summary105 = await request(app)
      .get('/api/summary?month=2026-10')
      .set('Authorization', `Bearer ${userAToken}`);

    expect(summary105.status).toBe(200);
    expect(summary105.body.totalSpent).toBe(1050);
    expect(summary105.body.budgetPercentage).toBe(105);
    expect(summary105.body.budgetWarning).toBe('exceeded');
    expect(summary105.body.byCategory.find((c) => c.category === 'Rent').total).toBe(500);
  });
});
