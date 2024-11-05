import UserDao from '../daos/user/index.js';
import NoteDao from '../daos/note/index.js';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendEmail = async (to, subject, text, html) => {
  const mailOptions = {
    from: `"NoteSphere Team" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    text,
    html,
  };

  await transporter.sendMail(mailOptions);
};

export const assignPermission = async (email, noteTitle, permission) => {

    try {
        const user = await UserDao.fetchByEmail(email);
        const note = await NoteDao.fetchByTitle(noteTitle);
    
        if (!user || !note) {
          throw new Error('User or note not found');
        }
    
        await NoteDao.assignPermission(note.id, user.id, permission);
      } catch (error) {
        console.error("Error in assignPermission:", error);
        throw error;
      }
};