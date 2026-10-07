const Notification = require('../models/Notification');

const createNotification = async ({ recipient, sender = null, type, title, message, link = null, data = {}, priority = 'medium' }) => {
  try {
    const notification = await Notification.create({ recipient, sender, type, title, message, link, data, priority });
    return notification;
  } catch (err) {
    console.error('Notification creation error:', err.message);
  }
};

const notificationTemplates = {
  appointmentConfirmed: (patientId, appointmentId, doctorName, date, time) => ({
    recipient: patientId,
    type: 'appointment_confirmed',
    title: 'Appointment Confirmed',
    message: `Your appointment with Dr. ${doctorName} on ${date} at ${time} has been confirmed.`,
    link: '/dashboard/appointments',
    data: { appointmentId },
    priority: 'high'
  }),

  appointmentCancelled: (patientId, appointmentId, reason) => ({
    recipient: patientId,
    type: 'appointment_cancelled',
    title: 'Appointment Cancelled',
    message: `Your appointment has been cancelled. ${reason ? 'Reason: ' + reason : ''}`,
    link: '/dashboard/appointments',
    data: { appointmentId },
    priority: 'high'
  }),

  labResultReady: (patientId, labId, testName) => ({
    recipient: patientId,
    type: 'lab_result_ready',
    title: 'Lab Results Ready',
    message: `Your ${testName} test results are now available.`,
    link: '/dashboard/laboratory',
    data: { labId },
    priority: 'high'
  }),

  prescriptionCreated: (patientId, prescriptionId) => ({
    recipient: patientId,
    type: 'prescription_created',
    title: 'New Prescription',
    message: 'A new prescription has been issued for you.',
    link: '/dashboard/prescriptions',
    data: { prescriptionId },
    priority: 'medium'
  }),

  paymentReceived: (patientId, paymentId, amount) => ({
    recipient: patientId,
    type: 'payment_received',
    title: 'Payment Received',
    message: `Payment of $${amount} has been received successfully.`,
    link: '/dashboard/payments',
    data: { paymentId },
    priority: 'medium'
  })
};

module.exports = { createNotification, notificationTemplates };
