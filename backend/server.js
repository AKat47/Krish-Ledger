const express  = require('express');
const mongoose = require('mongoose');
const cors     = require('cors');
require('dotenv').config();

const app = express();

app.use(cors({
  origin: [process.env.FRONTEND_URL || 'http://localhost:3000', /\.vercel\.app$/],
  credentials: true,
}));
app.use(express.json());

app.use('/api/crops',    require('./routes/crops'));
app.use('/api/expenses', require('./routes/expenses'));
app.use('/api/income',   require('./routes/income'));
app.use('/api/inputs',   require('./routes/inputs'));

app.get('/api/health', (req, res) =>
  res.json({ status: 'ok', db: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected' })
);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: err.message || 'Server Error' });
});

const PORT = process.env.PORT || 5000;
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('✅ MongoDB connected');
    app.listen(PORT, () => console.log(`🚀 Running on ${PORT}`));
  })
  .catch(err => { console.error('❌', err.message); process.exit(1); });
