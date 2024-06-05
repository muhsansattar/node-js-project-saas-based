// routes/employeeRoutes.js
const express = require("express");
const router = express.Router();
const employeeController = require("../Controllers/EmployeeController");
const authMiddleware = require("../middlerwares/authMiddleware");

router.post("/signup", employeeController.employeeSignup);
router.post("/login", employeeController.employeeLogin);
router.post("/requestEnable", employeeController.requestEnable);

// Protected routes (require authentication)
router.use(authMiddleware);
router.put("/updateProfile", employeeController.updateProfile);

router.post("/addCertification", employeeController.addCertification);
router.get("/viewAllCertifications", employeeController.viewAllCertifications);
router.get(
  "/viewCertification/:certificationId",
  employeeController.viewCertification
);
router.delete(
  "/deleteCertification/:certificationId",
  employeeController.deleteCertification
);
router.put(
  "/updateCertification/:certificationId",
  employeeController.updateCertification
);

module.exports = router;
