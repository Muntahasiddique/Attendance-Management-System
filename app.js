const express = require('express');
const path = require('path');

const baseRoutes = require('./routes/base.routes');
const { default: mongoose } = require('mongoose');

const app = express();
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use('/', baseRoutes);

mongoose.connect('mongodb://localhost:27017/ams-ai')
  .then(() => app.listen(3000, () => {
  console.log('Server is running on port 3000');
  console.log('Visit http://localhost:3000 to view the dashboard');
})).catch(err => console.log(err));

