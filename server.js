const mysql =  require("mysql2");
const jwt =  require("jsonwebtoken");
const express =  require("express");
const cors =  require("cors");
const crypto = require("crypto")
const http =  require("http");
require('dotenv').config();

const app = express();

const { DB_IP,DB_USER,DB_KEY,DB_NAME,DB_TABLE } = process.env;
const { TOKEN_KEY } = process.env;

const db = mysql.createConnection({
  host: DB_IP,
  user: DB_USER,
  password: DB_KEY,
  database: DB_NAME,
})
console.log('Connected to DB')

const roles = {
  developerez:[
    'element.add',
    'element.read',
    'element.delete',
    'element.update',
    'element.chart',
    'element.plot',
    'element.metrics',
  ],
  admin:[
    'element.read',
    'element.chart',
    'element.plot',
    'element.metrics',
  ],
  auto:[
    'element.read',
    'element.update',
    'element.chart',
  ],
  proc:[
    'element.read',
    'element.plot',
  ],
}
let assignPermissions = (role) => {
  let permissionList = roles[role]
  console.log(permissionList)
  return permissionList || []
}

let hashStr = (str) => {
  hash = crypto.createHash('sha3-256').update(str).digest('hex');
  console.log(str,' -> ',hash)
  return hash
}

let generateToken = (payload,secret) => {
  const token = jwt.sign(payload,`${TOKEN_KEY}80${secret}`)
  return token
}

app.use(express.json());
app.use(cors());
// app.use(function(req, res, next) {
//   res.header("Access-Control-Allow-Origin", "*"); // update to match the domain you will make the request from
//   res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
//   next();
// });

app.get("/", (req, res) => {
  res.json("Pinging backend @ ::",port);
});

app.post("/login", (req, res) => {
  // hash password
  console.log(req.body.data)
  const query =
    `SELECT userName as name, userAccess as access FROM Auth WHERE userMail LIKE '${req.body.data.email}' `+
    `AND userAccess LIKE '${hashStr(req.body.data.role)}' `+
    `AND userPassword LIKE '${hashStr(req.body.data.password)}'`;
  console.log(req.body)
  db.query(query, (error, data) => {
    let token
    let permissions
    console.log('--',data)
    if (data.length == 0) {
      console.warn('return error')
      return res.json({error: 404})
    } else {
      token = generateToken(data[0],data[0].access)
      data[0]['token'] = token
      // TODO: Add list of privileges? or add keyword to securely get permissionss
      permissions = assignPermissions(req.body.data.role)
      data[0]['permissions'] = permissions
    }
    // If it exists, append a Token
    if (error) return res.json(error);
    return res.json(data);
  });
});

app.post("/register", (req, res) => {
  // Generate an AccessLevelToken
  // console.log(req.body[0].role)
  const role = hashStr(req.body.data.role)
  // Hash the password
  const password = hashStr(req.body.data.password)
  //
  const query =
    `INSERT INTO ${DB_TABLE} (userName, userMail, userAccess, userPassword, isActive) VALUES `+
    `('${req.body.data.name} ${req.body.data.lastname}'`+
    `,'${req.body.data.email}','${role}','${password}',true) AS myData `+
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
