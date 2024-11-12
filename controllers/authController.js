
const firebaseAdmin = require('firebase-admin');
const nodemailer = require('nodemailer');
const bcrypt = require('bcryptjs');
const path = require('path');

// Firebase Admin setup
const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT 
//path.resolve(__dirname, '../config/firebaseConfig.json');

firebaseAdmin.initializeApp({
  credential: firebaseAdmin.credential.cert(require(serviceAccountPath))
});

const db = firebaseAdmin.firestore(); // Initialize Firestore

const generateOtp = () => Math.random().toString(36).slice(-8);

const sendOtpEmail = async (email, otp, employeeNumber) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });

 const mailOptions = {
    from: process.env.SMTP_USER,
    to: email,
    subject: 'Your One-Time Password',
    text: `Dear Employee (${employeeNumber}),\n\nYour OTP is: ${otp}\n\nPlease use this OTP to complete your onboarding process.`
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('OTP sent');
  } catch (error) {
    console.error('Failed to send OTP:', error);
  }
};

exports.getNextEmployeeId = async (req, res) => {
  try {
    // Fetch the last created employee document, ordered by employeeId in descending order
    const snapshot = await db.collection('SparkLineEmployees')
      .orderBy('employeeId', 'desc')
      .limit(1)
      .get();

    let newIdNumber = 1; // Default for the first employee if no records exist
    if (!snapshot.empty) {
      const lastEmployeeId = snapshot.docs[0].data().employeeId;
      newIdNumber = parseInt(lastEmployeeId.slice(3), 10) + 1; // Increment the numeric part
    }
    
    // Format the new employee ID
    const nextEmployeeId = `SPL${String(newIdNumber).padStart(5, '0')}`;
    
    // Send the next available employee ID as the response
    res.status(200).json({ nextEmployeeId });
  } catch (error) {
    console.error('Error fetching the next employee ID:', error);
    res.status(500).json({ error: 'Failed to fetch next employee ID.' });
  }
};

// Helper function to generate the next employee ID
const generateEmployeeId = async () => {
  const snapshot = await db.collection('SparkLineEmployees')
    .orderBy('employeeId', 'desc')
    .limit(1)
    .get();

  let newIdNumber = 1; // Default for the first employee
  if (!snapshot.empty) {
    const lastEmployeeId = snapshot.docs[0].data().employeeId;
    newIdNumber = parseInt(lastEmployeeId.slice(3), 10) + 1; // Increment the numeric part
  }
  return `SPL${String(newIdNumber).padStart(5, '0')}`; // Format with leading zeros
};

exports.onboardEmployee = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'Email is required.' });
  }

  try {
    // Check if the email already exists
    const snapshot = await db.collection('SparkLineEmployees').where('email', '==', email).limit(1).get();
    
    let employeeId;
    if (!snapshot.empty) {
      // Email already exists, retrieve the existing employee ID
      employeeId = snapshot.docs[0].data().employeeId;
    } else {
      // New email, generate a new employee ID
      employeeId = await generateEmployeeId();
    }

    // Generate OTP
    const otp = generateOtp();

    // Store or update OTP and email in Firestore
    await db.collection('SparkLineEmployees').doc(employeeId).set({
      employeeId,
      email,
      otp: bcrypt.hashSync(otp, 10),
      otpExpiresAt: Date.now() + 600000, // 10 minutes from now
      password: null // Password will be null until it's set
    }, { merge: true }); // Merge to avoid overwriting existing fields

    // Send OTP email
    await sendOtpEmail(email, otp, employeeId);
    res.status(200).json({ message: 'Employee onboarded successfully. OTP sent.', employeeId });
  } catch (error) {
    console.error('Error onboarding employee:', error);
    res.status(500).json({ error: 'Failed to onboard employee.' });
  }
};


// exports.onboardEmployee = async (req, res) => {
//   const { email } = req.body;

//   if (!email) {
//     return res.status(400).json({ error: 'Email is required.' });
//   }

//   try {
//     // Generate a new employee ID
//     const employeeId = await generateEmployeeId();

//     // Generate OTP
//     const otp = generateOtp();

//     // Store OTP and email in Firestore
//     await db.collection('SparkLineEmployees').doc(employeeId).set({
//       employeeId,
//       email,
//       otp: bcrypt.hashSync(otp, 10),
//       otpExpiresAt: Date.now() + 600000, // 10 minutes from now
//       password: null // Password will be null until it's set
//     });

//     // Send OTP email
//     await sendOtpEmail(email, otp, employeeId);
//     res.status(200).json({ message: 'Employee onboarded successfully. OTP sent.', employeeId });
//   } catch (error) {
//     console.error('Error onboarding employee:', error);
//     res.status(500).json({ error: 'Failed to onboard employee.' });
//   }
// };

// exports.onboardEmployee = async (req, res) => {
//   const { employeeId, email } = req.body;

//   if (!employeeId || !email) {
//     return res.status(400).json({ error: 'Employee ID and email are required.' });
//   }

//   try {
//     // Generate OTP
//     const otp = generateOtp();

//     // Store OTP and email in Firestore
//     await db.collection('SparkLineEmployees').doc(employeeId).set({
//       email,
//       otp: bcrypt.hashSync(otp, 10),
//       otpExpiresAt: Date.now() + 600000, // 10 minutes from now
//       password: null // Password will be null until it's set
//     });

//     // Send OTP email
//     await sendOtpEmail(email, otp);
//     res.status(200).json({ message: 'Employee onboarded successfully. OTP sent.' });
//   } catch (error) {
//     console.error('Error onboarding employee:', error);
//     res.status(500).json({ error: 'Failed to onboard employee.' });
//   }
// };

exports.login = async (req, res) => {
  const { employeeId, password } = req.body;

  try {
    const employeeDoc = await db.collection('SparkLineEmployees').doc(employeeId).get();
    if (!employeeDoc.exists) {
      return res.status(400).json({ error: 'Employee not found.' });
    }

    const employee = employeeDoc.data();
    const isOtpValid = employee.otp && Date.now() < employee.otpExpiresAt && bcrypt.compareSync(password, employee.otp);

    if (isOtpValid) {
      res.status(200).json({ message: 'OTP valid, please change your password.' });
    } else {
      res.status(400).json({ error: 'Invalid or expired OTP.' });
    }
  } catch (error) {
    console.error('Error during OTP validation:', error);
    res.status(500).json({ error: 'Failed to validate OTP.' });
  }
};

exports.changePassword = async (req, res) => {
  const { employeeId, newPassword } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await db.collection('SparkLineEmployees').doc(employeeId).update({
      password: hashedPassword,
      otp: null,
      otpExpiresAt: null
    });

    res.status(200).json({ message: 'Password changed successfully.' });
  } catch (error) {
    console.error('Error changing password:', error);
    res.status(500).json({ error: 'Failed to change password.' });
  }
};


exports.subsequentLogin = async (req, res) => {
  const { employeeId, password } = req.body;

  try {
    const employeeDoc = await db.collection('SparkLineEmployees').doc(employeeId).get();
    if (!employeeDoc.exists) {
      return res.status(400).json({ error: 'Employee not found.' });
    }

    const employee = employeeDoc.data();
    const isPasswordValid = await bcrypt.compare(password, employee.password);

    if (isPasswordValid) {
      res.status(200).json({ message: 'Login successful.' });
    } else {
      res.status(400).json({ error: 'Invalid Credentials.' });
    }
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ error: 'Failed to authenticate user.' });
  }
};
