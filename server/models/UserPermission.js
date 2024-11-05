import mongoose from 'mongoose';

const userPermissionSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    noteId: { type: String, required: true },
    permission: { type: String, enum: ['View', 'Edit', 'Comment', 'All'], required: true },
}, { timestamps: true });

const UserPermission = mongoose.model('UserPermission', userPermissionSchema);

export default UserPermission;