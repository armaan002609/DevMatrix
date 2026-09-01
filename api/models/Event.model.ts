import { Schema, model, Document } from "mongoose";

export interface IEvent extends Document {
  title: string;
  slug: string;
  description: string;
  date: Date;
  endDate?: Date;
  venue: string;
  tags: string[];
  bannerImageUrl: string;
  registrationType: "internal" | "external";
  externalRegistrationUrl?: string;
  capacity?: number;
  registeredCount: number;
  status: "draft" | "published" | "archived";
  createdBy: Schema.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const EventSchema = new Schema<IEvent>(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, index: true },
    description: { type: String, required: true },
    date: { type: Date, required: true, index: true },
    endDate: { type: Date },
    venue: { type: String, required: true },
    tags: [{ type: String, index: true }],
    bannerImageUrl: { type: String },
    registrationType: {
      type: String,
      enum: ["internal", "external"],
      default: "external",
    },
    externalRegistrationUrl: { type: String },
    capacity: { type: Number },
    registeredCount: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ["draft", "published", "archived"],
      default: "draft",
      index: true,
    },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

EventSchema.index({ status: 1, date: 1 });

export default model<IEvent>("Event", EventSchema);
