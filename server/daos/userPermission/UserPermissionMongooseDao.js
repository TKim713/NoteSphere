import MongooseClass from '../base/MongooseClass.js';
import UserPermission from '../../models/UserPermission.js';

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
      throw new Error('No permission found for this note');
    }
  
    const permissionsHierarchy = ['View', 'Comment', 'Edit', 'All'];
    const userPermissionIndex = permissionsHierarchy.indexOf(permission.permission);
    const requiredPermissionIndex = permissionsHierarchy.indexOf(requiredPermission);
  
    if (userPermissionIndex < requiredPermissionIndex) {
      throw new Error('Insufficient permission for this action');
    }
  }
}
  
export default UserPermissionMongooseDao;