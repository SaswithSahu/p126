const mongoose = require('mongoose');

const semesterMarksSchema = new mongoose.Schema({
  semester: { type: String, required: true },
  subjects: [
    {
      name: { type: String, required: true },
      marks: { type: Number, required: true },
    },
  ],
});

const studentSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  semesterMarks: [semesterMarksSchema], // An array of semesterMarks
  // Add more fields as needed
});

const Student = mongoose.model('Student', studentSchema);

module.exports = Student;
