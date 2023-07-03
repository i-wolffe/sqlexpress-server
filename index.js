const express =  require("express");
const mysql =  require("mysql2");
const cors =  require("cors");
const crypto = require("crypto")
const http =  require("http");
require('dotenv').config();

const app = express();

const { DB_IP,DB_USER,DB_KEY,DB_NAME,DB_TABLE } = process.env;

const db = mysql.createConnection({
  host: DB_IP,
  user: DB_USER,
  password: DB_KEY,
  database: DB_NAME,
})  
console.log('Connected to DB')



let hashStr = (str) => {
  hash = crypto.createHash('sha3-256').update(str).digest('hex');
  console.log(str,' -> ',hash)
  return hash
}

app.use(express.json());
app.use(cors());

app.get("/", (req, res) => {
  res.json("backend response from /");
});


app.post("/login", (req, res) => {
  // hash password
  const query =
    `SELECT userName as name, userMail as email, userAccess as access FROM Auth WHERE userMail LIKE '${req.body[0].email}' `+
    `AND userAccess LIKE '${hashStr(req.body[0].role)}' `+
    `AND userPassword LIKE '${hashStr(req.body[0].password)}'`;
  console.log(req.body)
  db.query(query, (error, data) => {
    let token
    console.log('--',data)
    if (data.length == 0) {
      console.warn('return error')
      return res.json({error: 404})
    } else {
      token = '221912921921921921'
      data[0]['token'] = token
    }
    // If it exists, append a Token
    if (error) return res.json(error);
    return res.json(data);
  });
});

app.post("/register", (req, res) => {
  // Generate an AccessLevelToken
  // console.log(req.body[0].role)
  const role = hashStr(req.body[0].role)
  // Hash the password
  const password = hashStr(req.body[0].password)
  // 
  const query =
    `INSERT INTO ${DB_TABLE} (userName, userMail, userAccess, userPassword, isActive) VALUES `+
    `('${req.body[0].name} ${req.body[0].lastname}'`+
    `,'${req.body[0].email}','${role}','${password}',true) AS myData `+
    `ON DUPLICATE KEY UPDATE userPassword = myData.userPassword`;
  // Test values from the backend
  db.query(query, (error, data) => {
    console.log('!!',data)
    if (error) {return res.json(error)};
    return  res.json(data);
  });
});


const { API_PORT } = process.env;
const port = process.env.PORT || API_PORT;

try {
  http.createServer(app).listen(port, () => {
    console.log("Listening on server...")
  })
} catch (error) {
  console.log("Not Connected to backend:");
  console.error(error);
}
