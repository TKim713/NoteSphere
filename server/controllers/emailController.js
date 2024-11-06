import CustomError from '../models/CustomError.js';
import { sendEmail, assignPermission } from '../services/emailService.js';

export const shareNote = async (req, res, next) => {
    const { email, noteId, noteTitle, senderName, permission } = req.body;

    if (!email || !noteId || !noteTitle || !senderName || !permission) {
        return next(new CustomError('All fields are required', 400));
    }

    const noteUrl = `http://localhost:5173/notes/${noteId}?permission=${permission}`;

    const subject = `${senderName} has invited you to view a note`;
    const text = `Take a look at ${noteTitle} (note name).
                    Accept ${senderName}'s invite to view ${noteTitle}:${noteUrl}`;

    const html = `
        <p>Take a look at <strong>${noteTitle}</strong> (note name).</p>
        <p>Accept ${senderName}'s invite to view <strong>${noteTitle}</strong>:</p>
        <p><a href="${noteUrl}">Click here to view the note</a></p>
        <p>Best regards,<br>NoteSphere Team</p>
    `;

    try {
        // Assign permission to the user for the note
        await assignPermission(email, noteId, permission);

        // Send the sharing email
        await sendEmail(email, subject, text, html);
        res.status(200).json({ message: 'Email sent successfully and permission assigned' });
    } catch (error) {
        console.error("Error in shareNote:", error);
        next(new CustomError('Failed to send email or assign permission', 500));
    }
};
