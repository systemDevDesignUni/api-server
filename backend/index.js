import express from "express";
import helmet from "helmet"
import cors from "cors";
import morgan from "morgan";
import 'dotenv/config';
import  connectDB  from "./cofiguration/db.js";

const app = express();

//secirity
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));


app.use((req, _res, next) => next(new AppError(`Not found: ${req.method} ${req.originalUrl}`, 404)));

//err hndle
app.use((err, _req, res, _next) => {
    const status = err.statusCode || 500;
    const payload = {
      message: err.message || 'Server error',
      ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
    };
    res.status(status).json(payload);
  });

const PORT = process.env.PORT || 4000

// start up server
connectDB(process.env.MONGO_URI)
  .then(() => app.listen(PORT, () => console.log(`Server listening  http://localhost:${PORT}`)))
  .catch((e) => {
    console.error('Failed to start server', e);
    process.exit(1);
  });