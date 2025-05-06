const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { connectToDatabase, getDb } = require('./db');
const { ObjectId } = require('mongodb');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// 이미지 업로드 경로
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);
app.use('/uploads', express.static(uploadDir));

// multer 설정
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname),
});
const upload = multer({ storage });

// ✅ 항목 조회
app.get('/items', async (req, res) => {
  const db = getDb();
  const { type } = req.query;
  try {
    const query = type ? { type } : {};
    const items = await db.collection('items').find(query).toArray();
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: '항목 조회 실패' });
  }
});

// ✅ 항목 등록
app.post('/items', upload.single('image'), async (req, res) => {
  const db = getDb();
  const { name, type, imageBase64, stock } = req.body;

  if (!name || !type) return res.status(400).json({ error: '이름과 종류는 필수입니다.' });

  let imageUrl;
  try {
    if (req.file) {
      imageUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    } else if (imageBase64) {
      const filename = `${Date.now()}.jpg`;
      const filepath = path.join(uploadDir, filename);
      fs.writeFileSync(filepath, Buffer.from(imageBase64, 'base64'));
      imageUrl = `${req.protocol}://${req.get('host')}/uploads/${filename}`;
    } else {
      imageUrl = `${req.protocol}://${req.get('host')}/uploads/logo.png`;
    }

    const newItem = {
      name,
      type,
      image: imageUrl,
      stock: stock === 'false' || stock === false ? false : true // 기본값 true
    };

    const result = await db.collection('items').insertOne(newItem);
    res.json({ success: true, item: { ...newItem, _id: result.insertedId } });
  } catch (err) {
    console.error('❌ 항목 등록 실패:', err);
    res.status(500).json({ error: '서버 오류' });
  }
});

// ✅ 항목 수정
app.patch('/items/:id', async (req, res) => {
  console.log('🛠 PATCH 요청 수신:', req.body);

  const db = getDb();
  const itemId = req.params.id;
  const { name, type, imageBase64, stock } = req.body;

  try {
    const item = await db.collection('items').findOne({ _id: new ObjectId(itemId) });
    if (!item) return res.status(404).json({ error: '항목 없음' });

    const updateData = {};

    if (typeof name !== 'undefined') updateData.name = name;
    if (typeof type !== 'undefined') updateData.type = type;
    if (typeof stock !== 'undefined') {
      updateData.stock = stock === 'false' || stock === false ? false : true;
    }

    if (imageBase64) {
      const oldFile = path.basename(item.image);
      if (oldFile !== 'logo.png') {
        const oldPath = path.join(uploadDir, oldFile);
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }

      const filename = `${Date.now()}.jpg`;
      const filepath = path.join(uploadDir, filename);
      fs.writeFileSync(filepath, Buffer.from(imageBase64, 'base64'));
      updateData.image = `${req.protocol}://${req.get('host')}/uploads/${filename}`;
    }

    console.log('✅ 실제 저장될 데이터:', updateData);

    await db.collection('items').updateOne(
      { _id: new ObjectId(itemId) },
      { $set: updateData }
    );

    const updated = await db.collection('items').findOne({ _id: new ObjectId(itemId) });
    res.json({ success: true, item: updated });
  } catch (err) {
    console.error('❌ 항목 수정 중 오류:', err);
    res.status(500).json({ error: '수정 실패' });
  }
});

// ✅ 항목 삭제
app.delete('/items/:id', async (req, res) => {
  const db = getDb();
  const itemId = req.params.id;

  try {
    const item = await db.collection('items').findOne({ _id: new ObjectId(itemId) });
    if (!item) return res.status(404).json({ error: '항목 없음' });

    const filePath = path.join(uploadDir, path.basename(item.image));
    if (fs.existsSync(filePath) && path.basename(item.image) !== 'logo.png') {
      fs.unlinkSync(filePath);
    }

    await db.collection('items').deleteOne({ _id: new ObjectId(itemId) });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: '삭제 실패' });
  }
});

// ✅ 주문 등록
app.post('/order', async (req, res) => {
  const db = getDb();
  const { name, menu, quantity, type } = req.body;

  if (!name || !menu || !quantity || !type) {
    return res.status(400).json({ error: '주문 정보 누락' });
  }

  const newOrder = {
    name,
    menu,
    quantity,
    type,
    status: 'pending',
    createdAt: new Date(),
  };

  try {
    const result = await db.collection('orders').insertOne(newOrder);
    res.json({ success: true, insertedId: result.insertedId });
  } catch (err) {
    res.status(500).json({ error: '주문 등록 실패' });
  }
});

// ✅ 주문 목록 조회
app.get('/orders', async (req, res) => {
  const db = getDb();
  const { name } = req.query;

  try {
    const filter = name ? { name } : {};
    const list = await db.collection('orders')
      .find(filter)
      .sort({ createdAt: -1 })
      .toArray();
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: '조회 실패' });
  }
});

// ✅ 주문 상태 변경
app.patch('/order/:id', async (req, res) => {
  const db = getDb();
  const { status } = req.body;
  const id = req.params.id;

  try {
    await db.collection('orders').updateOne(
      { _id: new ObjectId(id) },
      { $set: { status } }
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: '상태 변경 실패' });
  }
});

// ✅ 주문 수량 수정
app.patch('/orders/:id', async (req, res) => {
  const db = getDb();
  const { quantity } = req.body;
  const id = req.params.id;

  try {
    await db.collection('orders').updateOne(
      { _id: new ObjectId(id) },
      { $set: { quantity } }
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: '수정 실패' });
  }
});

// ✅ 주문 삭제
app.delete('/orders/:id', async (req, res) => {
  const db = getDb();
  const id = req.params.id;

  try {
    await db.collection('orders').deleteOne({ _id: new ObjectId(id) });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: '삭제 실패' });
  }
});

// ✅ MongoDB 연결 및 서버 실행
connectToDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(`✅ Server running on http://localhost:${PORT}`);
  });
}).catch(err => {
  console.error('❌ MongoDB 연결 실패:', err);
});
