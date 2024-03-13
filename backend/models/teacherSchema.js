const mongoose = require('mongoose');

const teacherSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  // Additional fields for teacher profile

  // Marks assigned by the teacher
//   assignedMarks: [
//     {
//       studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
//       semester: { type: Number, required: true },
//       subject: { type: String, required: true },
//       marks: { type: Number, required: true },
//     },
//   ],
  // Add more fields as needed
});

const Teacher = mongoose.model('Teacher', teacherSchema);

module.exports = Teacher;
