import MongooseClass from "../base/MongooseClass.js";
import Note from "../../models/Note.js";
import NoteListDao from "../noteList/index.js";
import cloudinary from "../../middlewares/cloudinaryConfig.js";
import { encryptContent, decryptContent } from "../../util/encryptionUtils.js";

class NoteMongooseDao extends MongooseClass {
  constructor() {
    super(Note);
  }

  async fetchNoteById(id) {
    const note = await this.collection.findOne({ id });
    if (note && note.content) {
      note.content = decryptContent(note.content); // Giải mã nội dung
    }
    return note;
  }

  async fetchNotesByUserId(userId) {
    const notes = await this.collection.find({ userId });
    return notes.map((note) => {
      if (note.content) {
        note.content = decryptContent(note.content); // Giải mã nội dung
      }
      return note;
    });
  }

  async fetchNoteContentById(id) {
    const note = await this.collection.findOne({ id }).select("content userId");
    if (note) {
      note.content = decryptContent(note.content); // Decrypt content before returning
    }
    return note;
  }

  async fetchByTitle(title) {
    const note = await this.collection.findOne({ title });
    if (note) {
      note.content = decryptContent(note.content); // Decrypt content before returning
    }
    return note;
  }

  // Create a note with content encryption
  async createNote(noteDetails) {
    if (noteDetails.content) {
      noteDetails.content = encryptContent(noteDetails.content); // Encrypt array of content
    }
    const createdNote = await this.collection.create(noteDetails);
    await NoteListDao.addNoteToNormalList(createdNote.userId, createdNote._id);
    return createdNote;
  }

  // Create a duplicate note (no content encryption as we are copying the existing note)
  async createDuplicate({ existingNoteId, ...noteDetails }) {
    // Encrypt the content if it exists
    if (noteDetails.content) {
      noteDetails.content = encryptContent(noteDetails.content); // Encrypt array of content
    }

    const createdNote = await this.collection.create(noteDetails);

    // Add the duplicate note to the normal list
    await NoteListDao.addDuplicateToNormalList({
      userId: createdNote.userId,
      existingNoteId,
      noteId: createdNote._id,
    });

    return createdNote;
  }

  // Update an existing note (ensure encryption if content is updated)
  async updateNote(id, obj) {
    if (obj.content && Array.isArray(obj.content)) {
      obj.content = encryptContent(obj.content); // Mã hóa trước khi cập nhật
    }
    return await this.collection.findOneAndUpdate({ id }, obj, { new: true });
  }

  // Delete a note by user and noteId
  async deleteNote(userId, noteId) {
    const { _id } = await this.collection.findOneAndDelete({ id: noteId });
    await NoteListDao.deleteNote(userId, _id);
  }

  // Upload an image to Cloudinary
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

  // Fetch notes by title with userId
  async fetchNoteByTitle(title, userId) {
    return await this.collection.find({
      userId,
      title: { $regex: title, $options: "i" }, // Regex for case-insensitive search
    });
  }
}

export default NoteMongooseDao;