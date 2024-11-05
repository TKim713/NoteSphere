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
}
  
export default UserPermissionMongooseDao;