let express = require("express");
let router = express.Router();
let authenticate = require("../middleware/authenticate");
let Notes = require("../models/NotesModel");
let User = require("../models/UserSchema");
// const authenticate = require('../middleware/authenticate')

// get all the notes with auth-token api/notes/getNotes

router.get("/getNotes", authenticate, async (req, res) => {
  try {
    let allNotes = await Notes.find({ user: req.user }); // i am getting this req.user from authenticate middleware
    res.send(allNotes);
  } catch (error) {
    console.log(error);
    res.send(error);
  }
});
// add the notes with auth-token api/notes/addNotes
router.post("/addNotes", authenticate, async (req, res) => {
  try {
    let iNotes = new Notes({
      user: req.user.id, // which we attached with request in middleware sections before
      title: req.body.title,
      description: req.body.description,
      tag: req.body.tag,
    });
    let savedNotes = await iNotes.save();
    res.send(savedNotes);
  } catch (error) {
    console.log(error);
    res.send({ error: error });
  }
});

// update the notes with auth-token api/notes/addNotes

router.put("/updateNotes/:id", authenticate, async (req, res) => {
  let updateId = req.params.id;
  let { title, description, tag } = req.body;
  let newNotes = {};
  try {
    if (title) {
      newNotes.title = title;
    } // it means if we add a title then add it to updated data otherwise not
    if (description) {
      newNotes.description = description;
    } // same as above
    if (tag) {
      newNotes.tag = tag;
    } // same as above
    let findUser = await Notes.findById({ _id: updateId });

    if (!findUser) {
      return res.status(404).send("User Not Found");
    }
    if (findUser.user.toString() !== req.user.id) {
      return res.status(401).send("Not Allowed");
    }
    // console.log(findUser.user.toString(), req.user.id)
    // now update if user is autherized
    findUser = await Notes.findByIdAndUpdate(
      req.params.id,
      { $set: newNotes },
      { new: true }
    );
    // res.json({findUser})
    res.send(findUser);
  } catch (error) {
    res.send(error);
  }
});

// delete the notes with auth-token api/notes/deleteNotes
router.delete("/deleteNotes/:id", authenticate, async (req, res) => {
  try {
    let id = req.params.id;

    let findNotes = await Notes.findById({ _id: id });

    if (!findNotes) {
      return res.status(404).send("User not exist");
    }
    if (findNotes.user.toString() !== req.user.id) {
      // if the user id is not same as its forign key then
      return res.status(401).send("Not Allowed");
    }

    findNotes = await Notes.findByIdAndDelete({ _id: req.params.id });
    res.send("deleted successfully");
  } catch (error) {
    res.send(error);
  }
});
module.exports = router;
