import express from "express";
import { login, registerAdmin } from "../services/adminService";

const router = express.Router();

router.post("/register", async (req, res) => {
  try {
    const { username, password } = req.body;
    const result = await registerAdmin({ username, password });
    return res.status(result.statusCode).json(result.data);
  } catch (err) {
    console.error("Error registering admin", err);
    res.status(500).json({ error: "internal server error" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    const result = await login({ username, password });
    return res.status(result.statusCode).json(result.data);
  } catch (err) {
    console.error("Error logging in admin", err);
    res.status(500).json({ error: "internal server error" });
  }
});

export default router;
