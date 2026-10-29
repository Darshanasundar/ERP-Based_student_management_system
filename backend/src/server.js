require('dotenv').config();
const http = require('http');
const app = require('./app');
const { testConnection } = require('./config/db');
const { connectRedis } = require('./config/redis');
const { connectRabbitMQ } = require('./config/rabbitmq');
const { initSocket } = require('./config/socket');

const authRoutes = require('./routes/auth.routes');
const adminRoutes = require('./routes/admin.routes');
const departmentRoutes = require('./routes/department.routes');
const admissionsRoutes = require('./routes/admissions.routes');
const studentRoutes = require('./routes/student.routes');
const courseRoutes = require('./routes/course.routes');
const attendanceRoutes = require('./routes/attendance.routes');
const invoiceRoutes = require('./routes/invoice.routes');
const paymentRoutes = require('./routes/payment.routes');
const marksRoutes = require('./routes/marks.routes');
const internalRoutes = require('./routes/internal.routes');
const messageRoutes = require('./routes/message.routes');
const apiRoutes = require('./routes/index');

const PORT = process.env.PORT || 3000;

// Mount modular routes under /api
app.use('/api/auth', authRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/admissions', admissionsRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/marks', marksRoutes);
app.use('/api/internal', internalRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api', adminRoutes);
app.use('/api', apiRoutes);

const server = http.createServer(app);

// Initialize Socket.io WebSockets attached to main HTTP server
const io = initSocket(server);

async function startServer() {
  try {
    // 1. Verify PostgreSQL database connectivity
    await testConnection();

    // 2. Connect Redis Caching cluster
    await connectRedis();

    // 3. Connect RabbitMQ Message Broker
    await connectRabbitMQ();

    // 4. Start HTTP & WebSocket Server
    server.listen(PORT, () => {
      console.log(`ERP Backend Service with WebSockets listening on port ${PORT}`);
      console.log(`WebSockets: Active on ws://localhost:${PORT}`);
      console.log(`Redis Cache: Configured with Write-Through caching layer`);
      console.log(`RabbitMQ: risk_assessment_queue publisher ready`);
      console.log(`Health: http://localhost:${PORT}/health`);
      console.log(`Marks API: http://localhost:${PORT}/api/marks`);
      console.log(`Internal Webhook: http://localhost:${PORT}/api/internal/emit-risk-update`);
    });
  } catch (err) {
    console.error('Fatal error starting ERP backend service:', err);
    process.exit(1);
  }
}

startServer();

module.exports = { server, app };
