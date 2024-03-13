const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const cors = require("cors");
const app = express();

const PORT = process.env.PORT || 3000;
app.use(cors())
const Student = require('./models/studentSchema');
const Teacher = require("./models/teacherSchema")

mongoose.connect('mongodb://localhost:27017/P126', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

mongoose.connection.on('error', (err) => {
  console.error('MongoDB connection error:', err);
});



// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));



// Basic route for testing

const verifyToken = (req, res, next) => {
    const token = req.headers.authorization.split(" ")[1];

    if (!token) {
      return res.status(401).json({ message: 'Unauthorized: No token provided' });
    }
    jwt.verify(token, 'your_secret_key', (err, decoded) => {
      if (err) {
        return res.status(401).json({ message: 'Unauthorized: Invalid token' });
      }
      req.userId = decoded.userId;
      req.username = decoded.username;
      next();
    });
  };
app.get('/', (req, res) => {
  res.send('Hello, welcome to your API!');
});


app.post('/students/register', async (req, res) => {
    try {
      const { username, password, email,  } = req.body;

      const existingStudent = await Student.findOne({ $or: [{ username }, { email }] });
      if (existingStudent) {
        return res.status(400).json({ message: 'Username or email already exists. Choose a different one.' });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const newStudent = new Student({
        username,
        password:hashedPassword,
        email
      });

      const savedStudent = await newStudent.save();

      res.status(201).json({ message: 'Student registered successfully', student: savedStudent,route:"s" });
    } catch (error) {
      console.error('Error registering student:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

app.post('/students/login', async (req, res) => {
    try {
      const { username, password } = req.body;

      const student = await Student.findOne({ username });
      if (!student) {
        return res.status(401).json({ message: 'Invalid username or password' });
      }
      const isPasswordValid = await bcrypt.compare(password, student.password);
      if (!isPasswordValid) {
        return res.status(401).json({ message: 'Invalid username or password' });
      }

      const token = jwt.sign({ userId: student._id, username: student.username }, 'your_secret_key', { expiresIn: '1h' });

      res.status(200).json({ message: 'Login successful', token });
    } catch (error) {
      console.error('Error logging in student:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

app.post('/postMarks', async (req, res) => {
    try {
      const { email, semester, subject, marks } = req.body;

      const student = await Student.findOne({ email });

      if (!student) {
        return res.status(404).json({ error: 'Student not found' });
      }

      const semesterIndex = student.semesterMarks.findIndex(mark => mark.semester === semester);

      if (semesterIndex === -1) {
        student.semesterMarks.push({ semester, subjects: [{ name: subject, marks }] });
      } else {
        student.semesterMarks[semesterIndex].subjects.push({ name: subject, marks });
      }
  
      await student.save();
  
      return res.status(201).json({ message: 'Marks posted successfully' });
    } catch (error) {
      console.error('Error posting marks:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  });
  
app.post('/getResults', async (req, res) => {
    try {
      const { email } = req.body;
      const student = await Student.findOne({ email });
      if (!student) {
        return res.status(404).json({ error: 'Student not found' });
      }
  
      const semesterResults = student.semesterMarks.map(({ semester, subjects }) => ({
        semester,
        subjects,
      }));
  
      return res.status(200).json(semesterResults);
    } catch (error) {
      console.error('Error retrieving results:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  });

app.get('/getResultsByUserId', verifyToken, async(req, res) => {
    const userId = req.userId;
    console.log(userId)
    const student = await Student.findOne({ _id:userId });
    console.log(student)
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    const semesterResults = student.semesterMarks.map(({ semester, subjects }) => ({
        semester,
        subjects,
      }));

    res.json(semesterResults);
  });


  app.post('/tutors/register', async (req, res) => {
    try {
      const { username,  password,  email } = req.body;

      const existingTutor = await Teacher.findOne({ $or: [{ username }, { email }] });
      if (existingTutor) {
        return res.status(400).json({ message: 'Username or email already exists. Choose a different one.' });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
  
      const newTutor = new Teacher({
        username,
        password: hashedPassword,
        email,
      });

      const savedTutor = await newTutor.save();
      res.status(201).json({ message: 'Tutor registered successfully',});
    } catch (error) {
      console.error('Error registering tutor:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
});

app.post('/tutors/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    console.log(username)
    const tutor = await Teacher.findOne({ username });
    
    if (!tutor) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    const isPasswordValid = await bcrypt.compare(password, tutor.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    const token = jwt.sign({ userId: tutor._id, username: tutor.username }, 'your_secret_key', { expiresIn: '1h' });

    res.status(200).json({ message: 'Login successful', token });
  } catch (error) {
    console.error('Error logging in tutor:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
