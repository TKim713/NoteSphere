import MongooseClass from '../base/MongooseClass.js';
import User from '../../models/User.js';

class UserMongooseDao extends MongooseClass {
  constructor() {
    super(User);
  }

  async fetchByEmail(email) {
    return await this.collection.findOne({ email: email });
  }

  async fetchByVerificationToken(token) {
    return await this.collection.findOne({ verificationToken: token });
  };
}

export default UserMongooseDao;
