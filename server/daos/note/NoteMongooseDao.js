import MongooseClass from "../base/MongooseClass.js";
import Note from "../../models/Note.js";
import NoteListDao from "../noteList/index.js";
import cloudinary from "../../middlewares/cloudinaryConfig.js";
class NoteMongooseDao extends MongooseClass {
  constructor() {
    super(Note);
  }

  async fetchNoteById(id) {
    return await this.collection.findOne({ id });
  }

  async fetchNotesByUserId(userId) {
    return await this.collection.find({ userId });
  }

  async fetchNoteContentById(id) {
    return await this.collection.findOne({ id }).select("content userId");
  }

  async fetchByTitle(title) {
    return await this.collection.findOne({ title });
  }

  // TODO: use session or cascading middleware
  async createNote(noteDetails) {
    const createdNote = await this.collection.create(noteDetails);

    await NoteListDao.addNoteToNormalList(createdNote.userId, createdNote._id);

    return createdNote;
  }

  async createDuplicate({ existingNoteId, ...noteDetails }) {
    const createdNote = await this.collection.create(noteDetails);

    await NoteListDao.addDuplicateToNormalList({
      userId: createdNote.userId,
      existingNoteId,
      noteId: createdNote._id,
    });

    return createdNote;
  }

  async updateNote(id, obj) {
    return await this.collection.findOneAndUpdate({ id }, obj);
  }

  // TODO: use session or cascading middleware
  async deleteNote(userId, noteId) {
    const { _id } = await this.collection.findOneAndDelete({ id: noteId });

    await NoteListDao.deleteNote(userId, _id);
  }

  async uploadImageToCloudinary(file) {
    if (!file) {
      throw new Error("No file provided for upload.");
    }

    try {
      const uploadResult = await cloudinary.uploader.upload(
        file.path || file.buffer,
        {
          resource_type: "auto",
        }
      );
      return uploadResult;
    } catch (err) {
      throw new Error("Error uploading image to Cloudinary: " + err.message);
    }
  }
  async fetchNoteByTitle(title, userId) {
    return await this.collection.find({
      userId,
      title: { $regex: title, $options: "i" }, // Sử dụng regex để tìm kiếm không phân biệt chữ hoa/thường
    });
  }
}

export default NoteMongooseDao;
