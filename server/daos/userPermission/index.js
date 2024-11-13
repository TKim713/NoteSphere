import UserPermissionMongooseDao from "./UserPermissionMongooseDao.js";

const daoOption = process.env.DAO_OPTION;

let UserPermissionDao;

switch (daoOption) {
  case 'MONGOOSE':
    UserPermissionDao = new UserPermissionMongooseDao();
    break;
  case 'FIREBASE':
    break;
  default:
    UserPermissionDao = new UserPermissionMongooseDao();
}

export default UserPermissionDao;
