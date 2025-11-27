require('dotenv').config();
const app = require('./app');
const connectDB = require('./config/database');
const logger = require('./config/logger');
const cronJobs = require('./cronjobs');

const PORT = process.env.PORT || 5000;

connectDB();

app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
  
  cronJobs.start();
});
