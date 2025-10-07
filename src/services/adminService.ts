require("dotenv").config(); // Load environment variables
import adminModel from "../models/adminModel";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

interface adminParams {
  username: string;
  password: string;
}

export const registerAdmin = async ({ username, password }: adminParams) => {
  const findAdmin = await adminModel.findOne({ username });

  if (findAdmin) {
    return { data: "Admin already exists", statusCode: 400 };
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const newAdmin = new adminModel({ username, password: hashedPassword });
  await newAdmin.save();

  return { data: "Admin registered successfully", statusCode: 201 };
};

export const login = async ({ username, password }: adminParams) => {
  const findAdmin = await adminModel.findOne({ username });
  if (!findAdmin) {
    return { data: "Admin not found", statusCode: 404 };
  }

  const isMatch = await bcrypt.compare(password, findAdmin.password);
  if (!isMatch) {
    return { data: "Invalid credentials", statusCode: 401 };
  }

  const token = jwt.sign(
    {
      userId: findAdmin._id.toString(), // ✅ Now TypeScript knows about toString()
      username: findAdmin.username,
    },
    process.env.JWT_SECRET!,
    { expiresIn: "24h" }
  );

  return {
    data: {
      message: "Login successful",
      token,
      user: { username: findAdmin.username },
    },
    statusCode: 200,
  };
};
