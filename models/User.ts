import mongoose, { Schema, models, model, Document, Model } from "mongoose";

export type UserRole = "user" | "admin";
export type LibraryStatus = "want" | "reading" | "read";

export interface ILibraryEntry {
  book: mongoose.Types.ObjectId;
  status: LibraryStatus;
}

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  image?: string;
  role: UserRole;
  provider: "credentials" | "google";
  library: ILibraryEntry[];
  favorites: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const LibraryEntrySchema = new Schema<ILibraryEntry>(
  {
    book: { type: Schema.Types.ObjectId, ref: "Book", required: true },
    status: { type: String, enum: ["want", "reading", "read"], required: true },
  },
  { _id: false }
);

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, select: false },
    image: { type: String, default: "" },
    role: { type: String, enum: ["user", "admin"], default: "user" },
    provider: {
      type: String,
      enum: ["credentials", "google"],
      default: "credentials",
    },
    library: { type: [LibraryEntrySchema], default: [] },
    favorites: { type: [Schema.Types.ObjectId], ref: "Book", default: [] },
  },
  { timestamps: true }
);

export default (models.User as Model<IUser>) || model<IUser>("User", UserSchema);
