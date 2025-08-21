require('dotenv').config();
const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const subjectRoutes = require('./routes/subjectRoutes');
const variantRoutes = require('./routes/variantRoutes');
const resourceRoutes = require('./routes/resourceRoutes');
const subscriptionRoutes = require('./routes/subscriptionRoutes');
const evaluationRoutes = require('./routes/evaluationRoutes');
const userVariantRoutes = require('./routes/userVariantRoutes');

const app = express();

app.use(cors({
  origin: 'http://localhost:4200'
}));

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});


app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/uploads', express.static('public/uploads'));

app.use('/api/auth', authRoutes);
app.use('/api/subjects', subjectRoutes);
app.use('/api/variants', variantRoutes);
app.use('/api/resources', resourceRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/evaluations', evaluationRoutes);
app.use('/api/userVariants', userVariantRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));