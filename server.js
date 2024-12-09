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
mongoose.connect(process.env.MONGO_URI, { dbName: 'contactpage' })
  .then(() => console.log('MongoDB Atlas connected'))
  .catch((err) => console.log('MongoDB connection error:', err));

// MongoDB Schema and Model
const SubscriberSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
});

const Subscriber = mongoose.model('Subscriber', SubscriberSchema);

// Email Functionality
const transporter = nodemailer.createTransport({
  service: 'gmail', // Use your email service provider (e.g., Gmail)
  auth: {
    user: process.env.EMAIL, // Your Gmail ID (from .env)
    pass: process.env.EMAIL_PASSWORD, // Your Gmail Password or App Password (from .env)
  },
});

// Routes

// Send Message Route
app.post('/send-message', (req, res) => {
  const { input1, input2, input3, input4, input5 } = req.body;

  const mailOptions = {
    from: process.env.EMAIL,
    to: input3, // Recipient email from form
    subject: 'Thank you for contacting us!',
    text: `Hello ${input1} ${input2},\n\nYour message has been received. We will get back to you soon!\n\nMessage: ${input5}\n\nThank you,\nSupport Team`,
  };

  transporter.sendMail(mailOptions, (err, info) => {
    if (err) {
      console.log('Email error:', err);
      return res.status(500).send('Failed to send email');
    } else {
      console.log('Email sent:', info.response);
      return res.status(200).send('Message sent successfully!');
    }
  });
});

// Subscribe Route
app.post('/subscribe', async (req, res) => {
  const { name, email } = req.body;

  try {
    // Check if the email already exists in the database
    const existingSubscriber = await Subscriber.findOne({ email });
    if (existingSubscriber) {
      return res.status(400).send('You are already subscribed!');
    }

    // Save new subscriber
    const newSubscriber = new Subscriber({ name, email });
    await newSubscriber.save();
    return res.status(200).send('Subscription successful!');
  } catch (err) {
    console.log('Error saving subscriber:', err);
    return res.status(500).send('Failed to subscribe');
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
