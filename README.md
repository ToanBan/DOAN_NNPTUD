# 📦 Database Schemas (MongoDB - Mongoose)

> Ý tưởng: Thiết kế hệ thống database cho mạng xã hội với các chức năng như đăng bài, tương tác, theo dõi và nhắn tin.

---

## 1. role.model.js

```js
const mongoose = require("mongoose");

const roleSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    description: { type: String, default: "" },
    isDeleted: { type: Boolean, default: false }
  },
  { timestamps: true }
);

module.exports = mongoose.model("role", roleSchema);
```

---

## 2. user.model.js

```js
const mongoose = require("mongoose");
let bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    email: { type: String, required: true, unique: true },

    fullName: { type: String, default: "" },
    avatarUrl: {
      type: String,
      default: "https://i.sstatic.net/l60Hf.png"
    },

    status: { type: Boolean, default: false },

    role: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "role",
      required: true
    },

    loginCount: { type: Number, default: 0 },
    lockTime: Date,

    isDeleted: { type: Boolean, default: false },

    forgotPasswordToken: String,
    forgotPasswordTokenExp: Date
  },
  { timestamps: true }
);

userSchema.pre("save", function () {
  if (this.isModified("password")) {
    let salt = bcrypt.genSaltSync(10);
    this.password = bcrypt.hashSync(this.password, salt);
  }
});

module.exports = mongoose.model("user", userSchema);
```

---

## 3. post.model.js

```js
const mongoose = require("mongoose");

const postSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true
    },

    content: { type: String, default: "" },

    privacy: {
      type: String,
      enum: ["public", "private", "friends"],
      default: "public"
    },

    likeCount: { type: Number, default: 0 },
    commentCount: { type: Number, default: 0 },
    fileCount: { type: Number, default: 0 },

    isDeleted: { type: Boolean, default: false }
  },
  { timestamps: true }
);

module.exports = mongoose.model("post", postSchema);
```

---

## 4. post_file.model.js

```js
const mongoose = require("mongoose");

const postFileSchema = new mongoose.Schema(
  {
    post: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "post",
      required: true
    },

    fileUrl: { type: String, required: true },

    fileType: {
      type: String,
      enum: ["image", "video", "file"],
      required: true
    },

    fileName: String,
    fileSize: Number,

    isDeleted: { type: Boolean, default: false }
  },
  { timestamps: true }
);

module.exports = mongoose.model("post_file", postFileSchema);
```

---

## 5. comment.model.js

```js
const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema(
  {
    post: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "post",
      required: true
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true
    },

    content: { type: String, required: true },

    parentComment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "comment",
      default: null
    },

    isDeleted: { type: Boolean, default: false }
  },
  { timestamps: true }
);

module.exports = mongoose.model("comment", commentSchema);
```

---

## 6. like.model.js

```js
const mongoose = require("mongoose");

const likeSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
    post: { type: mongoose.Schema.Types.ObjectId, ref: "post" }
  },
  { timestamps: true }
);

module.exports = mongoose.model("like", likeSchema);
```

---

## 7. follow.model.js

```js
const mongoose = require("mongoose");

const followSchema = new mongoose.Schema(
  {
    follower: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user"
    },

    following: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user"
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("follow", followSchema);
```

---


## 9. notification.model.js

```js
const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    sender: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
    receiver: { type: mongoose.Schema.Types.ObjectId, ref: "user" },

    type: {
      type: String,
      enum: ["like", "comment", "follow"]
    },

    post: { type: mongoose.Schema.Types.ObjectId, ref: "post" },

    isRead: { type: Boolean, default: false }
  },
  { timestamps: true }
);

module.exports = mongoose.model("notification", notificationSchema);
```

---

## 10. report.model.js

```js
const mongoose = require("mongoose");

const reportSchema = new mongoose.Schema(
  {
    reporter: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
    post: { type: mongoose.Schema.Types.ObjectId, ref: "post" },

    reason: String,

    status: {
      type: String,
      enum: ["pending", "resolved"],
      default: "pending"
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("report", reportSchema);
```

---

## 11. chat_message.model.js

```js
const mongoose = require("mongoose");

const chatMessageSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true
    },

    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true
    },

    content: {
      type: String,
      default: ""
    },

    isRead: {
      type: Boolean,
      default: false
    },

    isDeleted: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("chat_message", chatMessageSchema);
```

---

## 12. message_file.model.js

```js
const mongoose = require("mongoose");

const messageFileSchema = new mongoose.Schema(
  {
    message: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "chat_message",
      required: true
    },

    fileUrl: { type: String, required: true },

    fileType: {
      type: String,
      enum: ["image", "video", "file"],
      required: true
    },

    fileName: String,
    fileSize: Number
  },
  { timestamps: true }
);

module.exports = mongoose.model("message_file", messageFileSchema);
```
