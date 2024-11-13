import MongooseClass from '../base/MongooseClass.js';
import NoteList from '../../models/NoteList.js';

class NoteListMongooseDao extends MongooseClass {
  constructor() {
    super(NoteList);
  }

  async fetchUserNotes(userId) {
    return await this.collection
      .findOne({ userId })
      .populate({
        path: 'favoriteListOrder',
        select: 'id title emoji',
      })
      .populate({
        path: 'normalListOrder',
        select: '-content -userId',
      })
      .populate({
        path: 'sharedListOrder.note',
        select: '-content -userId',
      })
      .lean();
  }

  async addNoteToNormalList(userId, noteId) {
    return await this.collection.findOneAndUpdate(
      { userId },
      { $push: { normalListOrder: noteId } }
    );
  }

  async addDuplicateToNormalList({ userId, existingNoteId, noteId }) {
    const noteList = await this.collection.findOne({ userId }).populate({
      path: 'normalListOrder',
      select: 'id _id',
    });
    const updatedNormalListOrder = [...noteList.normalListOrder];

    const existingNoteIndex = noteList.normalListOrder.findIndex(
      (note) => note.id === existingNoteId
    );

    updatedNormalListOrder.splice(existingNoteIndex + 1, 0, noteId);

    noteList.normalListOrder = updatedNormalListOrder;

    noteList.save();
  }

  async addNoteToSharedList(userId, noteId, senderName) {
    return await this.collection.findOneAndUpdate(
      { userId },
      { $push: { sharedListOrder: { note: noteId, sharedBy: senderName } } }
    );
  }

  async favoriteNote(userId, noteId) {
    const noteList = await this.collection
      .findOne({ userId })
      .populate({
        path: 'normalListOrder',
        select: 'id _id',
      })
      .populate({
        path: 'favoriteListOrder',
        select: 'id',
      })
      .populate({
        path: 'sharedListOrder.note',
        select: '-content -userId',
      })
      .populate({
        path: 'sharedListOrder.sharedBy',
        select: 'name email',
      })

    const { _id } = noteList.normalListOrder.find((note) => note.id === noteId);

    if (!noteList.favoriteListOrder.find((note) => note.id === noteId)) {
      noteList.favoriteListOrder.push(_id);
    }

    return await noteList.save();
  }

  async unfavoriteNote(userId, noteId) {
    const noteList = await this.collection.findOne({ userId }).populate({
      path: 'favoriteListOrder',
      select: 'id',
    });

    noteList.favoriteListOrder = noteList.favoriteListOrder.filter(
      (note) => note.id !== noteId
    );

    return await noteList.save();
  }

  async deleteNote(userId, noteId) {
    return await this.collection.findOneAndUpdate(
      { userId },
      { $pull: { normalListOrder: noteId, favoriteListOrder: noteId } }
    );
  }

  async removeNoteFromSharedList(userId, noteId) {
    return await this.collection.findOneAndUpdate(
      { userId },
      { $pull: { sharedListOrder: noteId } }
    );
  }

  // async deleteFavoriteNote(userId, noteId) {
  //   return await this.collection.findOneAndUpdate(
  //     { userId },
  //     { $pull: { normalListOrder: noteId, favoriteListOrder: noteId } }
  //   );
  // }

  // async deleteNote(userId, noteId) {
  //   return await this.collection.findOneAndUpdate(
  //     { userId },
  //     { $pull: { normalListOrder: noteId } }
  //   );
  // }

  async sortNormalList(userId) {
    const noteList = await this.collection.findOne({ userId }).populate({
      path: 'normalListOrder',
      select: 'title id',
    });

    if (!noteList || !noteList.normalListOrder) {
      throw new Error("User's note list or normal list order is missing.");
    }

    noteList.normalListOrder.sort((a, b) => {
      const titleA = a.title || '';
      const titleB = b.title || '';
      return titleA.localeCompare(titleB);
    });

    await noteList.save();

    return noteList.normalListOrder;
}  

  async sortFavoriteList(userId) {
    const noteList = await this.collection.findOne({ userId }).populate({
      path: 'favoriteListOrder',
      select: 'title id',
    });

    if (!noteList || !noteList.favoriteListOrder) {
      throw new Error("User's note list or favorite list order is missing.");
    }

    noteList.favoriteListOrder.sort((a, b) => {
      const titleA = a.title || '';
      const titleB = b.title || '';
      return titleA.localeCompare(titleB);
    });

    await noteList.save();

    return noteList.favoriteListOrder;
  }

  async sortSharedList(userId, newOrder) {
    const noteList = await this.collection.findOne({ userId }).populate({
      path: 'sharedListOrder',
      select: 'id',
    });

    const updatedList = newOrder.map((id) =>
      noteList.sharedListOrder.find((note) => note.id === id)
    );
    noteList.sharedListOrder = updatedList;

    await noteList.save();
  }
}

export default NoteListMongooseDao;
