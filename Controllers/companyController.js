// controllers/companyController.js
const jwt = require("jsonwebtoken");
const keys = require("../config/keys");
const Company = require("../Modals/Company");
const Employee = require("../Modals/Employee");

exports.companySignup = async (req, res) => {
  const { name, email, password } = req.body;
  try {
    // Check if a company with the same email or name already exists
    const existingCompany = await Company.findOne({
      $or: [{ email }, { name }],
    });
    if (existingCompany) {
      if (existingCompany.email === email) {
        return res.status(400).json({ message: "Email is already registered" });
      } else {
        return res
          .status(400)
          .json({ message: "Company name is already taken" });
      }
    }

    const company = await Company.create({ name, email, password });
    return res
      .status(200)
      .json({ message: "Company signed up successfully", company });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.companyLogin = async (req, res) => {
  const { email, password } = req.body;
  try {
    const company = await Company.findOne({ email, password });
    if (!company) {
      return res.status(404).json({ message: "Invalid email or password" });
    }
    const payload = { id: company._id, email: company.email, role: "company" };
    jwt.sign(payload, keys.secretOrKey, { expiresIn: "1d" }, (err, token) => {
      if (err) throw err;
      return res.status(200).json({ message: "Login successful", token });
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal server error" });
  }
};
// controllers/companyController.js

exports.viewAllEmployees = async (req, res) => {
  try {
    const { role } = req.user;

    // Check if the authenticated user is a company
    if (role !== "company") {
      return res.status(403).json({
        message: "Forbidden: Only companies can access this resource",
      });
    }

    // Fetch all employees
    const employees = await Employee.find({});
    return res.status(200).json({ employees });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.viewEmployee = async (req, res) => {
  const { id } = req.params;
  try {
    const employee = await Employee.findById(id);
    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }
    return res.status(200).json({ employee });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.updateEmployee = async (req, res) => {
  const { id } = req.params;
  const { address, phoneNumber } = req.body;
  try {
    const updatedEmployee = await Employee.findByIdAndUpdate(
      id,
      { address, phoneNumber },
      { new: true }
    );
    return res.status(200).json({
      message: "Employee details updated successfully",
      employee: updatedEmployee,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.disableEmployee = async (req, res) => {
  const { id } = req.params;
  const { disableReason } = req.body;
  try {
    // Find the employee by ID
    const employee = await Employee.findById(id);
    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    // Toggle the isActive field
    const updatedIsActive = !employee.isActive;

    // Define the update fields
    const updateFields = { isActive: updatedIsActive };

    // Add or remove disableReason based on the value of updatedIsActive
    if (!updatedIsActive) {
      updateFields.message = disableReason; // Add disableReason if isActive is false
    } else {
      updateFields.message = null; // Remove disableReason if isActive is true
    }

    // Update the employee document with the new isActive field value and disableReason message
    const disabledEmployee = await Employee.findByIdAndUpdate(
      id,
      updateFields,
      { new: true }
    );

    return res.status(200).json({
      message: "Employee status updated successfully",
      isActive: updatedIsActive,
      disableReason: !updatedIsActive ? disableReason : null, // Return disableReason if isActive is false, otherwise null
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal server error" });
  }
};
exports.receiveEnableRequest = async (req, res) => {
  const { employeeId } = req.body;

  try {
    // Find the employee by ID
    const employee = await Employee.findById(employeeId);
    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    // Retrieve the request from the employee
    const request = employee.request;

    // Process the request (e.g., enable the employee)
    employee.isActive = true;
    employee.request = null; // Clear the request after processing
    await employee.save();

    // You might want to send a confirmation response to the employee

    return res.status(200).json({ message: "Request processed successfully" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal server error" });
  }
};
exports.viewAllRequests = async (req, res) => {
  try {
    // Fetch all employees with pending requests
    const employeesWithRequests = await Employee.find({
      request: { $ne: null },
    });

    // Extract only the request information from each employee
    const requests = employeesWithRequests.map((employee) => ({
      employeeId: employee._id,
      reason: employee.request.reason,
    }));

    return res.status(200).json({ requests });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal server error" });
  }
};
