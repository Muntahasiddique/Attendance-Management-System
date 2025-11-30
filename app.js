const express = require('express');
const path = require('path');

const app = express();
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');


app.get("/", (req, res) => {
    res.render("dashboard");
})



app.listen(3000, () => {
  console.log('Server is running on port 3000');
  console.log('Visit http://localhost:3000 to view the dashboard');
});