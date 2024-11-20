import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto-browserify';

import { sendEmail } from './emailService.js';
import UserDao from '../daos/user/index.js';
import NoteListDao from '../daos/noteList/index.js';
import CustomError from '../models/CustomError.js';

export const fetchUser = async (userId) => {
  const user = await UserDao.fetchById(userId);
  return user;
};

export const signup = async (userDetails) => {
  const existingUser = await UserDao.fetchByEmail(userDetails.email);

  if (existingUser) {
    throw new CustomError('Email address is already in use.', 409);
  }

  const { name, lastName, email, password } = userDetails;

  const salt = await bcrypt.genSalt(10);

  const encryptedPassword = await bcrypt.hash(password, salt);

  const verificationToken = crypto.randomBytes(32).toString('hex')

  const newUser = await UserDao.create({
    name,
    lastName,
    email,
    password: encryptedPassword,
    verificationToken
  });

  await NoteListDao.create({
    userId: newUser.id,
  });

  const payload = { user: { id: newUser.id } };

  // const verificationUrl = `http://localhost:5173/email-verification/${verificationToken}`;
  const verificationUrl = `http://localhost:5173/email-verification?token=${verificationToken}`;

  await sendEmail(
    email,
    'Verify your email',
    `Click the link to verify your email: ${verificationUrl}`,
    `<a href="${verificationUrl}">Verify Email</a>`
  );

  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '365d' });
};

export const login = async (userDetails) => {
  const { email, password } = userDetails;

  const existingUser = await UserDao.fetchByEmail(email);

  if (!existingUser) {
    throw new CustomError('A user with that email does not exist.', 400);
  }

  if (!existingUser.isVerified) {
    throw new CustomError('Please verify your email before logging in.', 403);
  }

  const isMatch = await bcrypt.compare(password, existingUser.password);

  if (!isMatch) {
    throw new CustomError(
      'Sorry, your email or password is incorrect. Please try again.',
      401
    );
  }

  const payload = { user: { id: existingUser.id } };

  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '2h' });
};
