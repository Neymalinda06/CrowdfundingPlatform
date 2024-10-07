const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const port = 3000;

app.use(cors());
app.use(bodyParser.json());

const connection = mysql.createConnection({
  host: 'localhost',        
  user: 'root',             
  password: 'Malindatha@619',     
  database: 'crowdfunding_db' 
});

connection.connect(err => {
  if (err) throw err;
  console.log('Connected to MySQL');
});

app.get('/fundraisers', (req, res) => {
  const query = `SELECT F.*, C.NAME as CATEGORY_NAME
                 FROM FUNDRAISER F
                 JOIN CATEGORY C ON F.CATEGORY_ID = C.CATEGORY_ID
                 WHERE ACTIVE = TRUE`;

  connection.query(query, (err, results) => {
    if (err) throw err;
    res.json(results);
  });
});

app.get('/fundraiser/:id', (req, res) => {
  const fundraiserQuery = `SELECT F.*, C.NAME as CATEGORY_NAME
                           FROM FUNDRAISER F
                           JOIN CATEGORY C ON F.CATEGORY_ID = C.CATEGORY_ID
                           WHERE F.FUNDRAISER_ID = ?`;

  const donationQuery = `SELECT D.AMOUNT, D.GIVER, D.DATE 
                         FROM DONATION D
                         WHERE D.FUNDRAISER_ID = ? ORDER BY D.DATE DESC`;

  connection.query(fundraiserQuery, [req.params.id], (err, fundraiserResult) => {
    if (err) throw err;

    connection.query(donationQuery, [req.params.id], (donationErr, donationResult) => {
      if (donationErr) throw donationErr;

      const result = {
        ...fundraiserResult[0],
        donations: donationResult
      };

      res.json(result);
    });
  });
});

app.get('/fundraisers/search', (req, res) => {
  const { organizer, city, category } = req.query;

  let query = `SELECT F.*, C.NAME as CATEGORY_NAME
               FROM FUNDRAISER F
               JOIN CATEGORY C ON F.CATEGORY_ID = C.CATEGORY_ID
               WHERE ACTIVE = TRUE`;

  const filters = [];
  if (organizer) filters.push(`F.ORGANIZER LIKE '%${organizer}%'`);
  if (city) filters.push(`F.CITY LIKE '%${city}%'`);
  if (category) filters.push(`C.NAME LIKE '%${category}%'`);
  
  if (filters.length > 0) {
    query += ' AND ' + filters.join(' AND ');
  }

  connection.query(query, (err, results) => {
    if (err) throw err;
    res.json(results);
  });
});

app.post('/donation', (req, res) => {
  const { amount, giver, fundraiserId } = req.body;

  if (amount < 5) {
    return res.status(400).json({ message: 'Minimum donation is 5 AUD' });
  }

  const query = `INSERT INTO DONATION (AMOUNT, GIVER, FUNDRAISER_ID) VALUES (?, ?, ?)`;

  connection.query(query, [amount, giver, fundraiserId], (err, result) => {
    if (err) throw err;
    res.json({ message: 'Donation added successfully' });
  });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
