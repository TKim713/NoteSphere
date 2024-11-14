import MongooseClass from '../base/MongooseClass.js';
import UserPermission from '../../models/UserPermission.js';
import CustomError from "../../models/CustomError.js";

class UserPermissionMongooseDao extends MongooseClass {
  constructor() {
    super(UserPermission);
  }
  
  async assignPermission(noteId, userId, permission) {
    const existingPermission = await this.collection.findOne({ noteId, userId });
  
    if (existingPermission) {
        existingPermission.permission = permission;
        await existingPermission.save();
    } else {
        const newPermission = new this.collection({ userId, noteId, permission });
        await newPermission.save();
    }
  }

  async checkPermission (userId, noteId, requiredPermission) {
    const permission = await UserPermission.findOne({ userId, noteId });
    if (!permission) {
      throw new CustomError("Not authorized to access this resource.", 403);
    }
  
    const permissionsHierarchy = ['View', 'Comment', 'Edit', 'All'];
    const userPermissionIndex = permissionsHierarchy.indexOf(permission.permission);
    const requiredPermissionIndex = permissionsHierarchy.indexOf(requiredPermission);
  
    if (userPermissionIndex < requiredPermissionIndex) {
      throw new CustomError('Insufficient permission for this action', 403);
    }
  }

  async fetchSharedUsersByNoteId(noteId, { limit, skip } = {}) {
    const sharedUsers = await UserPermission.find({ noteId })
      .populate('userId', 'name email')
      .skip(skip)
      .limit(limit);

    const total = await UserPermission.countDocuments({ noteId });

    return {
      total,
      data: sharedUsers.map(permission => ({
        userId: permission.userId._id,
        name: permission.userId.name,
        email: permission.userId.email,
        permission: permission.permission,
      })),
      limit,
      skip,
      hasMore: (skip + limit) < total,
    };
  }
}
  
export default UserPermissionMongooseDao;