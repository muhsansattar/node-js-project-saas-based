// controllers/employeeController.js
const Company = require("../Modals/Company");
const Employee = require("../Modals/Employee");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const keys = require("../config/keys");

exports.employeeSignup = async (req, res) => {
  const { name, email, password } = req.body;
  try {
    // Check if all fields are provided
    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }
    // Generate salt and hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    // Generate JWT token if email is unique
    const existingEmployee = await Employee.findOne({ email });
    if (existingEmployee) {
      return res.status(400).json({ message: "Email is already registered" });
    }
    // const employee = await Employee.create({ name, email, password });
    const employee = await Employee.create({
      name,
      email,
      password: hashedPassword,
    });
    return res
      .status(200)
      .json({ message: "Employee signed up successfully", employee });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal server error" });
  }
};
exports.employeeLogin = async (req, res) => {
  const { email, password } = req.body;
  try {
    const employee = await Employee.findOne({ email });
    if (!employee) {
      return res.status(404).json({ message: "Employee Not Found" });
    }

    // Check if the employee is disabled
    if (!employee.isActive) {
      // If employee is disabled, send the disable message to the employee
      return res.status(403).json({
        message: "You are disabled. Please contact your administrator.",
        additionalMessage: employee.message || "", // Send the additional message stored in the Employee schema
      });
    }

    // Check if password matches
    const isMatch = await bcrypt.compare(password, employee.password);
    if (!isMatch) {
      return res.status(404).json({ message: "Invalid email or password" });
    }

    // Get the additional message from the Employee schema
    const additionalMessage = employee.message || "";

    const payload = {
      id: employee._id,
      email: employee.email,
      role: "employee",
    };

    jwt.sign(payload, keys.secretOrKey, { expiresIn: "1d" }, (err, token) => {
      if (err) throw err;
      return res.status(200).json({
        message: "Login successful",
        additionalMessage: additionalMessage,
        token,
      });
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Other controller methods...
// controllers/employeeController.js

exports.updateProfile = async (req, res) => {
  const { id } = req.user;
  const { profileImage, address, phoneNumber } = req.body;
  try {
    const updatedEmployee = await Employee.findByIdAndUpdate(
      id,
      { profileImage, address, phoneNumber },
      { new: true }
    );
    return res.status(200).json({
      message: "Profile updated successfully",
      employee: updatedEmployee,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.addCertification = async (req, res) => {
  const { id, role } = req.user;
  const { authority, description, certificateImages } = req.body;
  // Check if the user is an employee
  if (role !== "employee") {
    return res
      .status(403)
      .json({ message: "Only employees can add certifications" });
  }
  try {
    if (!certificateImages || certificateImages.length < 3) {
      return res
        .status(400)
        .json({ message: "At least 3 certificate images are required" });
    }
    const updatedEmployee = await Employee.findByIdAndUpdate(
      id,
      {
        $push: {
          certifications: { authority, description, certificateImages },
        },
      },
      { new: true }
    );
    return res.status(200).json({
      message: "Certification added successfully",
      employee: updatedEmployee,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.viewAllCertifications = async (req, res) => {
  const { id } = req.user;
  try {
    const employee = await Employee.findById(id);
    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }
    return res.status(200).json({ certifications: employee.certifications });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.viewCertification = async (req, res) => {
  const { id } = req.user;
  const { certificationId } = req.params;
  try {
    const employee = await Employee.findById(id);
    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }
    const certification = employee.certifications.id(certificationId);
    if (!certification) {
      return res.status(404).json({ message: "Certification not found" });
    }
    return res.status(200).json({ certification });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.deleteCertification = async (req, res) => {
  const { id } = req.user;
  const { certificationId } = req.params;
  try {
    const updatedEmployee = await Employee.findByIdAndUpdate(
      id,
      { $pull: { certifications: { _id: certificationId } } },
      { new: true }
    );
    return res.status(200).json({
      message: "Certification deleted successfully",
      employee: updatedEmployee,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.updateCertification = async (req, res) => {
  const { id } = req.user;
  const { certificationId } = req.params;
  const { authority, description, certificateImages } = req.body;
  try {
    const employee = await Employee.findById(id);
    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }
    const certification = employee.certifications.id(certificationId);
    if (!certification) {
      return res.status(404).json({ message: "Certification not found" });
    }
    certification.authority = authority;
    certification.description = description;
    certification.certificateImages = certificateImages;
    await employee.save();
    return res
      .status(200)
      .json({ message: "Certification updated successfully", certification });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal server error" });
  }
};
// controllers/employeeController.js

exports.requestEnable = async (req, res) => {
  const { employeeId, reason } = req.body;

  try {
    // Find the employee by ID
    const employee = await Employee.findById(employeeId);
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    // Check if the employee is already active
    if (employee.isActive) {
      return res.status(400).json({ message: 'Employee is already enabled' });
    }

    // Create a request to the company
    const request = {
      employeeId: employee._id,
      reason,
    };

    // Send the request to the company (you might want to notify the company through another mechanism)
    // For demonstration, we'll just update the employee's request field
    employee.request = request;
    await employee.save();

    return res.status(200).json({ message: 'Request sent to company successfully' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};