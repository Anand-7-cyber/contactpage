const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const nodemailer = require('nodemailer');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Static Files (CSS, JS, Images)
app.use(express.static('public'));

// MongoDB Connection
// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, { dbName: 'conatctform' }) // Replace 'your_database_name' with your MongoDB database name
  .then(() => console.log('MongoDB Atlas connected'))
  .catch((err) => console.log('MongoDB connection error:', err));

// MongoDB Schema and Model
const SubscriberSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
});

const Subscriber = mongoose.model('Subscriber', SubscriberSchema);

module.exports = Subscriber; // Export the model for use in other files

// Email Functionality
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL, // Your Gmail ID
    pass: process.env.EMAIL_PASSWORD, // Your Gmail Password or App Password
  },
});

// Routes

// Send Message Route
app.post('/send-message', (req, res) => {
  const { input1, input2, input3, input4, input5 } = req.body;

  const mailOptions = {
    from: process.env.EMAIL,
    to: input3,
    subject: 'Thank you for contacting us!',
    text: `Hello ${input1} ${input2},\n\nYour message has been received. We will get back to you soon!\n\nMessage: ${input5}\n\nThank you,\nSupport Team`,
  };

  transporter.sendMail(mailOptions, (err, info) => {
    if (err) {
      console.log('Email error:', err);
      res.status(500).send('Failed to send email');
    } else {
      console.log('Email sent:', info.response);
      res.status(200).send('Message sent successfully!');
    }
  });
});

// Subscribe Route
app.post('/subscribe', async (req, res) => {
  const { name, email } = req.body;

  try {
    const newSubscriber = new Subscriber({ name, email });
    await newSubscriber.save();
    res.status(200).send('Subscription successful!');
  } catch (err) {
    console.log('Error saving subscriber:', err);
    res.status(500).send('Failed to subscribe');
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
