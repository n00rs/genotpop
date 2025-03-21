import express from "express";
import process from "process";
import cors from "cors";

process.loadEnvFile(".env");
const app: express.Express = express();

import { getMongoConnection, getPgConnection } from "./config/index.ts";

import masterRoutes from "./routes/master.router.ts";
import salesRoutes from "./routes/sales.router.ts";
import reportsRoutes from "./routes/report.router.ts";
import authRoutes from "./routes/auth.router.ts";

import { authenticateMiddleware } from "./libs/common/authMiddleware.ts";

app.use(
  cors({
    origin: ["http://localhost:5000", process.env.ORIGIN],
    methods: "PUT,POST,DELETE",
    optionsSuccessStatus:200
  })
);

app.use(express.json({ limit: "10mb", inflate: false }));

// Public routes (no authentication required)

app.use("/api/v1/auth", authRoutes);

// Apply the authenticateMiddleware globally (for all routes except the ones defined above)

app.use( authenticateMiddleware );

app.use("/api/v1/master", masterRoutes);
app.use("/api/v1/sales", salesRoutes);
app.use("/api/v1/reports", reportsRoutes);

// app.get("/", async (req, res, next) => {
//   const pool = await getPgConnection({ blnPool: true });
//   const db = await getMongoConnection();
//   const { rows } = await pool.query(`SELECT * FROM tbl_test`);
//   const a = await db.collection("user").find().toArray()

//   console.log(rows,a);

//   res.send({rows,a});
// });

app.listen(process.env.PORT, () =>
  console.log(`server running at ${process.env.PORT} `)
);
