import express from "express";
import helmet from "helmet";
import cors from "cors";
import morgan from "morgan";
import 'dotenv/config';
import connectDB from "./cofiguration/db.js";
import authRoute from "./routes/auth.js";
import studentRoute from "./routes/student.js";
import classesRoute from "./routes/classes.js";
import chaptersRoute from "./routes/chapter.js";
import { AppError } from "./utils/Error.js";
import registerRoute from "./routes/register.js";
import paymentRoute from "./routes/payment.js";
const app = express();

// Security
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

// Routes
app.use("/api/auth", authRoute);
app.use("/api/student", studentRoute);
app.use("/api/classes", classesRoute);
app.use("/api/chapters", chaptersRoute);
app.use("/api/register",  registerRoute);
app.use("/api/payments", paymentRoute);

// Not found handler
app.use((req, _res, next) =>
    next(new AppError(`Not found: ${req.method} ${req.originalUrl}`, 404))
);

// Error handler
app.use((err, _req, res, _next) => {
    const status = err.statusCode || 500;
    const payload = {
        message: err.message || "Server error",
        ...(process.env.NODE_ENV !== "production" && { stack: err.stack }),
    };
    res.status(status).json(payload);
});


const PORT = process.env.PORT || 4000;

// Start server
connectDB(process.env.MONGO_URI)
    .then(() => app.listen(PORT, () => console.log(`Server listening http://localhost:${PORT}`)))
    .catch((e) => {
        console.error("Failed to start server", e);
        process.exit(1);
    });
