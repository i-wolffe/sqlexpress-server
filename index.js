const express =  require("express");
const mysql =  require("mysql2");
const cors =  require("cors");
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

let hashSring = (str) => {
  return str
}

app.use(express.json());
app.use(cors());

app.get("/", (req, res) => {
  res.json("backend response from /");
});

app.get("/badgeCicloSemana", (req, res) => {
  // console.log('-------',req.query)
  let query =
    `SELECT idCiclo as ID, idAutoclave, Fecha, Turno, Hora, TiempoCicloA ` +
    `FROM ciclos `;
  //console.warn(query)
  db.query(query, (error, data) => {
    if (error) {
      console.log("ERR", error);
      return res.json(error);
    }
    return res.json(data);
  });
});

app.post("/login", (req, res) => {
  // hash password
  const query =
    `SELECT * FROM Auth WHERE userMail LIKE '${req.body.email}'`;
  // Test values from the backend
  console.log(req.body)
  db.query(query, (error, data) => {
    console.log('--',data)
    if (error) return res.json(error);
    return res.json(data);
  });
});

app.post("/register", (req, res) => {
  const query =
    "INSERT INTO * FROM Auth";
  // Test values from the backend
  console.log(req.body)
  db.query(query, (error, data) => {
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
