export const sendOTPEmail = async (email, otp) => {
  // In a real application, you would use a service like SendGrid, Mailgun, or Nodemailer
  // For demo purposes, we'll just log the OTP
  console.log(`Sending OTP ${otp} to ${email}`);
  
  // Simulate email sending delay
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log(`OTP ${otp} sent successfully to ${email}`);
      resolve();
    }, 1000);
  });
};