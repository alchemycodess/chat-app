import "dotenv/config";
import express from "express";
import { prisma } from "./prismaClient";
import {
  clerkClient,
  clerkMiddleware,
  getAuth,
  requireAuth,
} from "@clerk/express";
import { AuthObject } from "@clerk/express";
import cors from "cors";
import { error } from "console";

const app = express();
app.use(express.json());
const port = 5000;
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(clerkMiddleware());

app.get("/protected", requireAuth(), async (req, res) => {
  const { userId } = getAuth(req);
  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const user = await clerkClient.users.getUser(userId);
  return res.json({ user });
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

async function syncUserFromClerk(userId) {
  try {
    let dbUser = await prisma.user.findUnique({
      where: { id: userId },
    });
    if (!dbUser) {
      const clerkUser = await clerkClient.users.getUser(userId);
      dbUser = await prisma.user.create({
        data: {
          id: userId,
          email: clerkUser.emailAddresses[0]?.emailAddress || null,
          username: clerkUser.username || null,
        },
      });
      console.log("User synced from clerk", dbUser);
    }
    return dbUser;
  } catch (error) {
    console.error("User sync error", error);
    throw error;
  }
}

// message

// create

app.post("/message", requireAuth(), async (req, res) => {
  try {
    const { userId } = getAuth(req);
    const { content } = req.body;

    if (!userId || !content) {
      return res.status(401).json({ error: "Missing required fields" });
    }

    await syncUserFromClerk(userId);

    const newMsg = await prisma.message.create({
      data: {
        userId,
        content,
      },
      include: {
        user: true,
      },
    });

    res.json({ message: "Msg created successfully.", newMsg });
  } catch (error) {
    res.status(500).json({ error: "Failed to create msg" });
  }
});

// get all msgs
app.get("/messages", requireAuth(), async (req, res) => {
  try {
    const { userId } = getAuth(req);

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized no user exists" });
    }

    const allMsgs = await prisma.message.findMany({
      where: { userId },
      include: {
        user: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    res.json({ message: "All msgs are here", allMsgs });
  } catch (error) {
    res.status(500).json({ error: "FAiled to get all msgs" });
  }
});

// update msg
app.patch("/messages/:id", async (req, res) => {
  try {
    const { userId } = getAuth(req);
    const { id } = req.params;
    const { content } = req.body;

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized no user exists" });
    }

    const existingMsg = await prisma.message.findFirst({
      where: {
        id: Number(id),
        userId: userId,
      },
    });

    if (!existingMsg) {
      return res
        .status(404)
        .json({ error: "Message not found or unauthorized" });
    }
    const updatedMsg = await prisma.message.update({
      where: { id: Number(id) },
      data: { content },
      include: { user: true },
    });
    res.json({ message: "update the msg", updatedMsg });
  } catch (error) {
    res.status(500).json({ error: "FAiled to update msg" });
  }
});

// delete msg
app.delete("/messages/:id", async (req, res) => {
  try {
    const { userId } = getAuth(req);
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized no user exists" });
    }

    const existingMsg = await prisma.message.findFirst({
      where: {
        id: Number(id),
        userId: userId,
      },
    });

    if (!existingMsg) {
      return res
        .status(404)
        .json({ error: "Message not found or unauthorized" });
    }

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
