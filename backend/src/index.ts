import express from "express";
import { prisma } from "./prismaClient";

const app = express();
app.use(express.json());
const port = 5000;

// create
app.post("/user", async (req, res) => {
  try {
    const { id, username, email } = req.body;

    const user = await prisma.user.create({
      data: {
        id,
        username,
        email,
      },
    });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: "Failed to create user" });
  }
});

// read
app.get("/users", async (req, res) => {
  try {
    const allUsers = await prisma.user.findMany();

    res.json(allUsers);
  } catch (error) {
    res.status(500).json({ error: "Failed to find users" });
  }
});

// update
app.put("/users/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { username, email } = req.body;

    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        username,
        email,
      },
    });
    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ error: "Failed to update user" });
  }
});

// delete
app.delete("/users/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const deletedUser = await prisma.user.delete({
      where: { id },
    });

    res.json({ message: "user deleted successfully", deletedUser });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete user" });
  }
});

// message

// create
app.post("/message", async (req, res) => {
  try {
    const { content, userId } = req.body;
    const newMsg = await prisma.message.create({
      data: {
        userId,
        content,
      },
    });
    res.json({ message: "Msg created successfully.", newMsg });
  } catch (error) {
    res.status(500).json({ error: "Failed to create msg" });
  }
});

// get all msgs
app.get("/messages", async (req, res) => {
  try {
    const allMsgs = await prisma.message.findMany();
    res.json({ message: "All msgs are here", allMsgs });
  } catch (error) {
    res.status(500).json({ error: "FAiled to get all msgs" });
  }
});

// update msg
app.patch("/messages/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    const updatedMsg = await prisma.message.update({
      where: { id: Number(id) },
      data: {
        content,
      },
    });
    res.json({ message: "update the msg", updatedMsg });
  } catch (error) {
    res.status(500).json({ error: "FAiled to update msg" });
  }
});

// delete msg
app.delete("/messages/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const deletedMsg = await prisma.message.delete({
      where: { id: Number(id) },
    });
    res.json({ message: "delete the msg", deletedMsg });
  } catch (error) {
    res.status(500).json({ error: "FAiled to delete msg" });
  }
});

app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
