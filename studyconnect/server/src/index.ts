import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import authRoutes from "./routes/auth";
import groupRoutes from "./routes/groups";
import eventsRoutes from "./routes/events";
import questionsRoutes from "./routes/questions";

dotenv.config();

const app = express();
const allowedOrigins = (process.env.ALLOWED_ORIGINS || "")
	.split(",")
	.map((origin) => origin.trim())
	.filter(Boolean);

app.use(
	cors({
		origin: allowedOrigins.length ? allowedOrigins : undefined,
		credentials: true,
	})
);
app.use(express.json());

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.use("/auth", authRoutes);
app.use("/groups", groupRoutes);
app.use("/events", eventsRoutes);
app.use("/questions", questionsRoutes);

// Friendly root route to confirm server is running
app.get("/", (req, res) => {
	res.json({ ok: true, message: "StudyConnect API is running" });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
