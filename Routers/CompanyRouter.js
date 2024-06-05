// routes/companyRoutes.js
const express = require("express");
const router = express.Router();
const companyController = require("../Controllers/companyController");
const authMiddleware = require("../middlerwares/authMiddleware");

router.post("/signup", companyController.companySignup);
router.post("/login", companyController.companyLogin);
router.post("/receiveEnableRequest", companyController.receiveEnableRequest);
// Protected routes (require authentication)
router.use(authMiddleware);
router.get("/requests", companyController.viewAllRequests);

router.get("/viewAllEmployees", companyController.viewAllEmployees);
router.get("/viewEmployee/:id", companyController.viewEmployee);
router.put("/updateEmployee/:id", companyController.updateEmployee);
router.put("/disableEmployee/:id", companyController.disableEmployee);

module.exports = router;
