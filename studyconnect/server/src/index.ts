import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/auth";
import groupRoutes from "./routes/groups";
import eventsRoutes from "./routes/events";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use("/auth", authRoutes);
app.use("/groups", groupRoutes);
app.use("/events", eventsRoutes);

// Friendly root route to confirm server is running
app.get("/", (req, res) => {
	res.json({ ok: true, message: "StudyConnect API is running" });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
