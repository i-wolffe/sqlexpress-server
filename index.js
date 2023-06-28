import express from "express";
import mysql from "mysql2";
import cors from "cors";
import http from "http";

const app = express();

const { DB_IP,DB_USER,DB_KEY,DB_NAME,DB_TABLE } = process.env;

const db = mysql.createConnection({
  host: DB_IP,
  user: DB_USER,
  password: DB_KEY,
  database: DB_NAME,
});

app.use(express.json());
app.use(cors());


app.get("/", (req, res) => {
  res.json("backend response from /");
});

app.get("/badgeCicloSemana", (req, res) => {
  // console.log('-------',req.query)
  let date = new Date();
  let queryDate = `${date.getFullYear()}-${monthFormat(
    date.getMonth()
  )}-${date.getDate()}`;
  let dateRanges = getDateRange(date, "week");
  let query =
    `SELECT idCiclo as ID, idAutoclave, Fecha, Turno, Hora, TiempoCicloA ` +
    `FROM ciclos ` +
    `WHERE TiempoCicloA = (SELECT ${
      req.query.minmax == "min" ? `MIN` : `MAX`
    }(TiempoCicloA) FROM ciclos WHERE ${
      req.query.shift == 0 ? `` : `Turno = ${req.query.shift} AND`
    } ` +
    `idAutoclave = ${req.query.id} ` +
    `AND Fecha BETWEEN '${dateRanges.lower}' AND '${dateRanges.upper}') ` +
    `AND idAutoclave = ${req.query.id} AND ` +
    `${
      req.query.shift == 0 ? `` : `Turno = ${req.query.shift} AND`
    } Fecha BETWEEN '${dateRanges.lower}' AND '${dateRanges.upper}' `;
  //console.warn(query)
  db.query(query, (error, data) => {
    if (error) {
      console.log("ERR", error);
      return res.json(error);
    }
    return res.json(data);
  });
});

app.post("/celdas", (req, res) => {
  const query =
    "INSERT INTO Celdas (Nombre,Area,SubArea,ZonaLayout,IsActive)VALUES (?)";
  // Test values from the backend
  const valuesBE = ["LT6", "LT6", "GM", 1, false];
  const valuesCL = [
    req.body.name,
    req.body.area,
    req.body.subarea,
    req.body.layout,
    req.body.isActive,
  ];
  db.query(query, [valuesCL], (error, data) => {
    if (error) return res.json(error);
    return res.json(data);
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
