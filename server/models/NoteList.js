import mongoose from 'mongoose';

const noteListSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Types.ObjectId,
    required: true,
    ref: 'User',
  },
  normalListOrder: [
    {
      type: mongoose.Types.ObjectId,
      ref: 'Note',
    },
  ],
  favoriteListOrder: [
    {
      type: mongoose.Types.ObjectId,
      ref: 'Note',
    },
  ],
  sharedListOrder: [
    { 
      note: { type: mongoose.Types.ObjectId, ref: 'Note' },
      sharedBy: { type: String }
    }
  ],
});

export default mongoose.model('NoteList', noteListSchema);
