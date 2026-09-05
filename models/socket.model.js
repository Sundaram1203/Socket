// models/socket.model.js
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import moment from "moment-timezone";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_FILE = path.join(__dirname, "..", "data", "users.json");

// make sure the json file exists before we try to read/write it
async function ensureFile() {
  try {
    await fs.access(DATA_FILE);
  } catch {
    await fs.mkdir(path.dirname(DATA_FILE), { recursive: true });
    await fs.writeFile(DATA_FILE, "[]", "utf-8");
  }
}

async function readUsers() {
  await ensureFile();
  const raw = await fs.readFile(DATA_FILE, "utf-8");
  try {
    return JSON.parse(raw || "[]");
  } catch {
    return [];
  }
}

async function writeUsers(users) {
  await fs.writeFile(DATA_FILE, JSON.stringify(users, null, 2), "utf-8");
}

export const insertUser = async (user) => {
  const users = await readUsers();

  // duplicate check -> same email (case-insensitive) OR same phone number
  const duplicate = users.find(
    (u) =>
      (u.email && String(u.email).toLowerCase() === String(user.email).toLowerCase()) ||
      (u.phone_number && String(u.phone_number) === String(user.phone_number))
  );

  if (duplicate) {
    const err = new Error("Email or phone number already exists");
    err.isDuplicate = true;
    throw err;
  }

  const time = moment().tz("Asia/Kolkata").format("YYYY-MM-DD HH:mm:ss");
  const nextId = users.length > 0 ? Math.max(...users.map((u) => u.id)) + 1 : 1;

  const newUser = {
    id: nextId,
    full_name: `${user.first_name} ${user.last_name || ""}`.trim(),
    email: user.email,
    phone_number: user.phone_number,
    created_by: user.first_name,
    created_dt: time
  };

  users.push(newUser);
  await writeUsers(users);

  return newUser;
};

export const getAllUsers = async () => {
  const users = await readUsers();
  // newest last, same ordering as before (ORDER BY id ASC)
  return users.sort((a, b) => a.id - b.id);
};
