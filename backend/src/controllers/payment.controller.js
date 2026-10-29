const db = require('../config/db');

/**
 * Process a fee payment securely with atomic transaction and row-level locking
 * POST /api/payments
 * Protected: SUPER_ADMIN, PARENT
 */
async function processPayment(req, res) {
  const { invoice_id, amount_paid } = req.body;

  // Validate inputs
  if (!invoice_id || amount_paid === undefined || amount_paid === null) {
    return res.status(400).json({
      error: 'Validation Error',
      message: 'invoice_id and amount_paid are required fields.',
    });
  }

  const paymentAmount = parseFloat(amount_paid);
  if (isNaN(paymentAmount) || paymentAmount <= 0) {
    return res.status(400).json({
      error: 'Validation Error',
      message: 'amount_paid must be a positive number greater than 0.',
    });
  }

  const client = await db.pool.connect();

  try {
    // 1. Begin atomic transaction
    await client.query('BEGIN');

    // 2. Lock the invoice row using SELECT ... FOR UPDATE
    const invoiceQuery = 'SELECT * FROM invoices WHERE id = $1 FOR UPDATE';
    const invoiceResult = await client.query(invoiceQuery, [invoice_id]);

    if (invoiceResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Invoice not found.',
      });
    }

    const invoice = invoiceResult.rows[0];

    // 3. Check if already paid
    if (invoice.status === 'PAID') {
      await client.query('ROLLBACK');
      return res.status(400).json({
        error: 'Bad Request',
        message: 'This invoice has already been fully paid.',
      });
    }

    // 4. Calculate total paid so far and remaining balance
    const paymentsSumQuery = `
      SELECT COALESCE(SUM(amount_paid), 0) AS total_paid
      FROM payments
      WHERE invoice_id = $1
    `;
    const sumResult = await client.query(paymentsSumQuery, [invoice_id]);
    const currentPaid = parseFloat(sumResult.rows[0].total_paid);
    const invoiceTotal = parseFloat(invoice.amount);
    const remainingBefore = invoiceTotal - currentPaid;

    if (remainingBefore <= 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Invoice has no outstanding balance.',
      });
    }

    // 5. Determine new status based on whether payment covers remaining balance
    const newTotalPaid = currentPaid + paymentAmount;
    let newStatus = 'PARTIAL';
    if (paymentAmount >= remainingBefore || newTotalPaid >= invoiceTotal) {
      newStatus = 'PAID';
    }

    // 6. Insert payment record
    const insertPaymentQuery = `
      INSERT INTO payments (invoice_id, amount_paid, payment_date)
      VALUES ($1, $2, CURRENT_TIMESTAMP)
      RETURNING id, invoice_id, amount_paid, payment_date, created_at
    `;
    const paymentResult = await client.query(insertPaymentQuery, [
      invoice_id,
      paymentAmount.toFixed(2),
    ]);
    const newPayment = paymentResult.rows[0];

    // 7. Update invoices row
    const updateInvoiceQuery = `
      UPDATE invoices
      SET status = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING id, status, updated_at
    `;
    await client.query(updateInvoiceQuery, [newStatus, invoice_id]);

    // 8. Commit atomic transaction
    await client.query('COMMIT');

    // 9. Invalidate Redis Caches
    const { delCache } = require('../config/redis');
    if (invoice.student_id) {
      await delCache(`student:data:${invoice.student_id}`);
    }
    await delCache('admin:metrics');
    console.log(`Payment cache invalidated for student ${invoice.student_id} and admin:metrics.`);

    const remainingAfter = Math.max(0, invoiceTotal - newTotalPaid);

    return res.status(200).json({
      message: 'Payment processed successfully',
      payment: {
        id: newPayment.id,
        invoiceId: newPayment.invoice_id,
        amountPaid: parseFloat(newPayment.amount_paid),
        paymentDate: newPayment.payment_date,
      },
      invoice: {
        id: invoice.id,
        totalAmount: invoiceTotal,
        totalPaid: parseFloat(newTotalPaid.toFixed(2)),
        remainingBalance: parseFloat(remainingAfter.toFixed(2)),
        status: newStatus,
      },
    });
  } catch (err) {
    await client.query('ROLLBACK');
    return res.status(400).json({
      error: 'Bad Request',
      message: err.message || 'Payment processing failed.',
    });
  } finally {
    client.release();
  }
}

module.exports = {
  processPayment,
};
