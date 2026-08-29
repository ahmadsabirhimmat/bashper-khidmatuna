const User = require('../models/User');

const logPrefix = '[admin-bootstrap]';

const ensureAdminUser = async () => {
  const {
    ADMIN_EMAIL,
    ADMIN_PASSWORD,
    ADMIN_FULL_NAME = 'Emergency Admin',
    ADMIN_PHONE = 'N/A',
  } = process.env;

  if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
    console.warn(`${logPrefix} ADMIN_EMAIL or ADMIN_PASSWORD missing. Skipping admin bootstrap.`);
    return;
  }

  const normalizedEmail = ADMIN_EMAIL.trim().toLowerCase();
  let adminUser = await User.findOne({ email: normalizedEmail });

  // If the configured email is new, migrate an existing admin account instead of creating a duplicate.
  // Do NOT reset password here — keep the password already stored in MongoDB.
  if (!adminUser) {
    const existingAdmin = await User.findOne({ role: 'admin' }).sort({ createdAt: 1 });
    if (existingAdmin) {
      const previousEmail = existingAdmin.email;
      existingAdmin.email = normalizedEmail;
      existingAdmin.fullName = ADMIN_FULL_NAME;
      existingAdmin.phoneNumber = ADMIN_PHONE;
      existingAdmin.status = 'active';
      existingAdmin.emailVerified = true;
      await existingAdmin.save();
      console.log(
        `${logPrefix} Migrated admin email from ${previousEmail} to ${normalizedEmail} (password unchanged)`
      );
      return;
    }
  }

  if (adminUser) {
    let shouldSave = false;

    if (adminUser.fullName !== ADMIN_FULL_NAME) {
      adminUser.fullName = ADMIN_FULL_NAME;
      shouldSave = true;
    }
    if (adminUser.phoneNumber !== ADMIN_PHONE) {
      adminUser.phoneNumber = ADMIN_PHONE;
      shouldSave = true;
    }
    if (adminUser.role !== 'admin') {
      adminUser.role = 'admin';
      shouldSave = true;
    }
    if (adminUser.status !== 'active') {
      adminUser.status = 'active';
      shouldSave = true;
    }
    if (!adminUser.emailVerified) {
      adminUser.emailVerified = true;
      shouldSave = true;
    }

    // Password is intentionally not overwritten from .env.
    // ADMIN_PASSWORD is only for first-time create; forgot-password updates MongoDB.

    if (shouldSave) {
      await adminUser.save();
      console.log(`${logPrefix} Updated admin profile for ${normalizedEmail} (password unchanged)`);
    } else {
      console.log(`${logPrefix} Admin account already up to date for ${normalizedEmail}`);
    }
    return;
  }

  // First install only: seed admin from .env
  await User.create({
    email: normalizedEmail,
    password: ADMIN_PASSWORD,
    fullName: ADMIN_FULL_NAME,
    phoneNumber: ADMIN_PHONE,
    role: 'admin',
    status: 'active',
    emailVerified: true,
  });

  console.log(`${logPrefix} Created admin account for ${normalizedEmail}`);
};

module.exports = ensureAdminUser;
