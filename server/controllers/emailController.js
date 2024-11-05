import CustomError from '../models/CustomError.js';
import { sendEmail, assignPermission } from '../services/emailService.js';

export const shareNote = async (req, res, next) => {
    const { email, noteTitle, noteContent, senderName, permission } = req.body;

    if (!email || !noteTitle || !noteContent || !senderName || !permission) {
        return next(new CustomError('All fields are required', 400));
    }

    const subject = `A note has been shared with you by ${senderName}`;
    const text = `Hi,\n\n${senderName} has shared a note with you:\n\nTitle: ${noteTitle}\n\nContent:\n${noteContent}\n\nBest regards,\nNoteSphere Team`;
    const html = `
        <h2>${senderName} has shared a note with you</h2>
        <p><strong>Title:</strong> ${noteTitle}</p>
        <p>${noteContent}</p>
        <p>Best regards,<br>NoteSphere Team</p>
    `;

    try {
        // Assign permission to the user for the note
        await assignPermission(email, noteTitle, permission);
        
        // Send the sharing email
        await sendEmail(email, subject, text, html);
        res.status(200).json({ message: 'Email sent successfully and permission assigned' });
    } catch (error) {
        console.error("Error in shareNote:", error);
        next(new CustomError('Failed to send email or assign permission', 500));
    }
};
