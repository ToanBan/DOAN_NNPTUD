# Setup MongoDB Replica Set với Docker

## Giới thiệu

Tài liệu này hướng dẫn cách thiết lập **MongoDB Replica Set (3 node)** bằng Docker để phục vụ phát triển ứng dụng Node.js.

Replica Set giúp:

* Hỗ trợ **transaction**
* Tăng độ **ổn định (failover)**
* Mô phỏng môi trường production

---



## Khởi chạy Docker

```bash
docker-compose up -d
```

---

## Khởi tạo Replica Set

### Bước 1: Truy cập container `mongo1`

```bash
docker exec -it mongo1 mongosh
```

---

### Bước 2: Khởi tạo Replica Set

```js
rs.initiate({
  _id: "rs0",
  members: [
    { _id: 0, host: "mongo1:27017" },
    { _id: 1, host: "mongo2:27017" },
    { _id: 2, host: "mongo3:27017" }
  ]
})
```

---

### Bước 3: Kiểm tra trạng thái

```js
rs.status()
```

👉 Nếu thấy:

* `PRIMARY`
* `SECONDARY`

→ Setup thành công 

---

## 🔗 5. Kết nối MongoDB trong Node.js

```js
mongoose.connect(
  "mongodb://127.0.0.1:27017,127.0.0.1:27018,127.0.0.1:27019/DOAN_NNPTUD?replicaSet=rs0"
);
```

---

## Lưu ý

### Nếu chạy Node.js trong Docker:

```js
mongoose.connect(
  "mongodb://mongo1:27017,mongo2:27017,mongo3:27017/DOAN_NNPTUD?replicaSet=rs0"
);
```

---

## Xử lý lỗi thường gặp

### Lỗi container đã tồn tại

```bash
docker rm -f mongo1 mongo2 mongo3
```

---

### Docker chưa chạy

* Mở **Docker Desktop**
* Đảm bảo trạng thái: `Docker is running`

---

### Không kết nối được Replica Set

* Kiểm tra đã chạy `rs.initiate()` chưa
* Kiểm tra `rs.status()`

---

## Kiểm tra container

```bash
docker ps
```

---

## Dọn dẹp

### Xóa toàn bộ container

```bash
docker rm -f mongo1 mongo2 mongo3
```

---

## Kết luận

* MongoDB Replica Set đã sẵn sàng
* Có thể sử dụng:

  * Transaction
  * Failover
  * Testing môi trường thực tế

---

## Gợi ý phát triển tiếp

* Kết nối với **Mongoose**
* Sử dụng **transaction**
* Xây dựng hệ thống **authentication (JWT)**
* Tích hợp **file storage (MinIO)**

---

💡 *Tip: Không nên dùng `localhost:27017` khi đã setup Replica Set — hãy luôn dùng connection string đầy đủ để tận dụng hệ thống.*




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


## 8. notification.model.js

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

## 9. report.model.js

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

## 10. chat_message.model.js

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

## 11. message_file.model.js

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
