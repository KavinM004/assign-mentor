const bodyParser = require("body-parser");
const express = require("express");
const mongoose = require("mongoose");
const Mentor = require("./models/Mentor");
const Student = require("./models/Student");
require('dotenv').config()
const app = express();

app.use(bodyParser.json());

const PORT = process.env.PORT;
const DB_URL = process.env.DB_URL;

//Connecting to the MongoDB
mongoose
  .connect(DB_URL, {})
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.log("Could not connect to MongoDB", err));

//Create a mentor
app.post("/mentor", async (req, res) => {
  try {
    const mentor = new Mentor(req.body);
    await mentor.save();
    res.status(201).send(mentor);
  } catch (error) {
    res.status(400).send(error);
  }
});

//Create a student
app.post("/student", async (req, res) => {
  try {
    const student = new Student(req.body);
    await student.save();
    res.status(201).send(student);
  } catch (error) {
    res.status(400).send(error);
  }
});

//Assign a mentor for student
app.post("/mentor/:mentorId/assign", async (req, res) => {
  try {
    const mentor = await Mentor.findById(req.params.mentorId);
    const students = await Student.find({ _id: { $in: req.body.students } });

    students.forEach((student) => {
      student.cMentor = mentor._id;
      student.save();
    });

    mentor.students = [
      ...mentor.students,
      ...students.map((student) => student._id),
    ];
    await mentor.save();
    res.send(mentor);
  } catch (error) {
    res.status(400).send(error);
  }
});

//replace the pervious mentor by current mentor
app.put("/student/:studentId/assignMentor/:mentorId", async (req, res) => {
  try {
    const mentor = await Mentor.findById(req.params.mentorId);
    const student = await Student.findById(req.params.studentId);
    console.log(student);
    if (student.cMentor) {
      student.pMentor.push(student.cMentor);
    }

    student.cMentor = mentor._id;
    await student.save();
    res.send(student);
  } catch (error) {
    res.status(400).send(error);
  }
});

//checking the mentors, those students are assigned
app.get("/mentor/:mentorId/students", async (req, res) => {
  try {
    const mentor = await Mentor.findById(req.params.mentorId).populate(
      "students"
    );
    res.send(mentor);
  } catch (error) {
    res.status(400).send(error);
  }
});

//find the specific students details
app.get('/student/:studentId',async(req,res)=>{
    try {
        const pmentor=await Student.findById(req.params.studentId);
        res.status(201).send(pmentor);
    } catch (error) {
        res.status(501).send(error);
    }
});

app.listen(PORT, () => {
  console.log("Server is running on PORT", PORT);
});
