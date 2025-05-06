require('dotenv').config(); // .env 파일에서 환경 변수 읽기

const { MongoClient } = require('mongodb');

let db = null;

async function connectToDatabase() {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    throw new Error('❌ MONGO_URI가 .env에 설정되지 않았습니다.');
  }

  const client = new MongoClient(uri);

  try {
    await client.connect();
    db = client.db('delivery'); // 사용할 DB 이름 (원하는 이름으로 변경 가능)
    console.log('✅ MongoDB 연결 성공');
  } catch (err) {
    console.error('❌ MongoDB 연결 실패:', err);
    throw err;
  }
}

function getDb() {
  if (!db) {
    throw new Error('❌ DB가 아직 연결되지 않았습니다. connectToDatabase 먼저 실행하세요.');
  }
  return db;
}

module.exports = { connectToDatabase, getDb };
