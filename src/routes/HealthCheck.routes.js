import { Router } from "express";
import HeathCheck from "../controllers/HealthCheck.controllers.js";
const router =Router()
router.route("/").get(HeathCheck)

export default router