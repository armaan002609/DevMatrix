import { Schema, model, Document } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  passwordHash: string;
  role: "member" | "admin";
  studentId: string;
  branch: string;
  yearOfStudy: number;
  registeredEvents: Schema.Types.ObjectId[];
  membershipStatus: "active" | "inactive";
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    passwordHash: { type: String, required: true, select: false },
    role: { type: String, enum: ["member", "admin"], default: "member" },
    studentId: { type: String, required: true, trim: true },
    branch: { type: String, required: true },
    yearOfStudy: { type: Number, required: true, min: 1, max: 6 },
    registeredEvents: [{ type: Schema.Types.ObjectId, ref: "Event" }],
    membershipStatus: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
  },
  { timestamps: true }
);

export default model<IUser>("User", UserSchema);
