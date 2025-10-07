// types/extendRequest.ts
import { Request } from "express";
import { IAdmin } from "../models/adminModel";

export interface ExtendRequest extends Request {
  user?: IAdmin; // Make it optional since it won't exist before middleware runs
}
