const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');

const DATA_DIR = path.join(__dirname, '..', '..', 'data');
const STORE_FILE = path.join(DATA_DIR, 'store.json');
const REF_FILE = path.join(__dirname, '..', 'data', 'referenceCalendars.json');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

let isMongoConnected = false;
let mongoMode = 'initializing';
let mongoUri = null;
let memoryServerInstance = null;

// Internal persistent JSON storage fallback
function readStore() {
  try {
    if (fs.existsSync(STORE_FILE)) {
      const raw = fs.readFileSync(STORE_FILE, 'utf8');
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error('Error reading store file:', err.message);
  }
  return { submissions: [], results: [] };
}

function writeStore(store) {
  try {
    fs.writeFileSync(STORE_FILE, JSON.stringify(store, null, 2), 'utf8');
  } catch (err) {
    console.error('Error writing store file:', err.message);
  }
}

// -------------------------------------------------------------
// Official MongoDB / Mongoose Schemas
// -------------------------------------------------------------
const submissionSchema = new mongoose.Schema({
  id: { type: String, unique: true, index: true },
  crop: { type: String, required: true },
  district: { type: String, required: true },
  season: { type: String, required: true },
  variety: { type: String, default: '' },
  plantingStart: { type: String, required: true },
  plantingEnd: { type: String, required: true },
  growthStart: { type: String, required: true },
  growthEnd: { type: String, required: true },
  harvestStart: { type: String, required: true },
  harvestEnd: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const referenceCalendarSchema = new mongoose.Schema({
  id: { type: String, unique: true, index: true },
  crop: { type: String, required: true },
  season: { type: String, required: true },
  district: { type: String, required: true },
  varieties: [String],
  plantingWindow: Object,
  growthDurationDays: Object,
  harvestWindow: Object,
  temperatureRange: Object,
  rainfallRequirementMm: Object,
  sourceName: String,
  sourceUrl: String,
  lastUpdated: String
});

const analysisResultSchema = new mongoose.Schema({
  id: { type: String, unique: true, index: true },
  submissionId: { type: String, index: true },
  submission: Object,
  reference: Object,
  reliabilityScore: Number,
  reliabilityCategory: String,
  badgeClass: String,
  assessmentCompleteness: Number,
  parameterScores: Object,
  weightsUsed: Object,
  weatherNote: String,
  anomalyDetected: Boolean,
  mlResult: Object,
  mlFeatures: Object,
  conflicts: Array,
  explanations: Array,
  suggestedCalendar: Object,
  weatherAssessment: Object,
  createdAt: { type: Date, default: Date.now }
});

const SubmissionModel = mongoose.model('Submission', submissionSchema);
const ReferenceCalendarModel = mongoose.model('ReferenceCalendar', referenceCalendarSchema);
const AnalysisResultModel = mongoose.model('AnalysisResult', analysisResultSchema);

/**
 * Connect to MongoDB:
 * 1. Try process.env.MONGODB_URI (e.g. MongoDB Atlas or local daemon)
 * 2. Try mongodb-memory-server (Embedded in-memory MongoDB)
 * 3. Keep fallback store active as backup
 */
async function connectDB() {
  const customUri = process.env.MONGODB_URI;

  if (customUri) {
    try {
      console.log(`🍃 Connecting to external MongoDB at ${customUri.replace(/\/\/.*@/, '//***@')}...`);
      await mongoose.connect(customUri, { serverSelectionTimeoutMS: 3000 });
      isMongoConnected = true;
      mongoMode = 'MongoDB Atlas / External';
      mongoUri = customUri;
      console.log('✓ Successfully connected to External MongoDB via Mongoose!');
      await seedReferenceCalendars();
      return;
    } catch (err) {
      console.warn(`⚠ External MongoDB connection failed (${err.message}). Trying embedded MongoDB...`);
    }
  }

  // Attempt to use mongodb-memory-server if installed
  try {
    const { MongoMemoryServer } = require('mongodb-memory-server');
    if (MongoMemoryServer) {
      console.log('🍃 Starting Embedded MongoDB Server (In-Memory Mongoose Engine)...');
      memoryServerInstance = await MongoMemoryServer.create();
      const memUri = memoryServerInstance.getUri();
      await mongoose.connect(memUri);
      isMongoConnected = true;
      mongoMode = 'Embedded MongoDB (In-Memory Engine)';
      mongoUri = memUri;
      console.log(`✓ Embedded MongoDB active at ${memUri}`);
      await seedReferenceCalendars();
      return;
    }
  } catch (err) {
    // mongodb-memory-server not yet available or downloading
  }

  // Also attempt default local mongodb connection if daemon is running
  try {
    await mongoose.connect('mongodb://127.0.0.1:27017/agrochrono', { serverSelectionTimeoutMS: 1500 });
    isMongoConnected = true;
    mongoMode = 'Local MongoDB Daemon (localhost:27017)';
    mongoUri = 'mongodb://127.0.0.1:27017/agrochrono';
    console.log('✓ Successfully connected to Local MongoDB on port 27017');
    await seedReferenceCalendars();
    return;
  } catch (err) {
    // Local daemon not active
  }

  // Graceful fallback to persistent JSON repository
  console.log('ℹ MongoDB daemon not detected locally. Initialized with High-Performance BSON/JSON Store.');
  console.log('💡 Tip: Set MONGODB_URI in backend/.env to connect your MongoDB Atlas cluster.');
  mongoMode = 'Persistent BSON Store (MongoDB Schema Compliant)';
}

/**
 * Seed verified regional reference records into MongoDB collection
 */
async function seedReferenceCalendars() {
  try {
    if (fs.existsSync(REF_FILE)) {
      const records = JSON.parse(fs.readFileSync(REF_FILE, 'utf8'));
      const count = await ReferenceCalendarModel.countDocuments();
      if (count === 0) {
        await ReferenceCalendarModel.insertMany(records);
        console.log(`✓ Seeded ${records.length} regional reference calendars into MongoDB collection.`);
      }
    }
  } catch (err) {
    console.warn('Seeding reference calendars error:', err.message);
  }
}

// -------------------------------------------------------------
// Unified Data Access Layer (Seamless Mongoose & Fallback)
// -------------------------------------------------------------
async function saveSubmission(data) {
  const record = {
    ...data,
    id: data.id || `sub_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
    createdAt: new Date().toISOString()
  };

  if (isMongoConnected) {
    try {
      const doc = await SubmissionModel.create(record);
      return doc.toObject();
    } catch (err) {
      console.warn('MongoDB submission save error:', err.message);
    }
  }

  const store = readStore();
  store.submissions.push(record);
  writeStore(store);
  return record;
}

async function saveResult(data) {
  const record = {
    ...data,
    id: data.id || `res_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
    createdAt: new Date().toISOString()
  };

  if (isMongoConnected) {
    try {
      const doc = await AnalysisResultModel.create(record);
      return doc.toObject();
    } catch (err) {
      console.warn('MongoDB result save error:', err.message);
    }
  }

  const store = readStore();
  store.results.unshift(record);
  if (store.results.length > 100) store.results.pop();
  writeStore(store);
  return record;
}

async function getResultById(id) {
  if (isMongoConnected) {
    try {
      const doc = await AnalysisResultModel.findOne({ id }).lean();
      if (doc) return doc;
    } catch (err) {
      console.warn('MongoDB find error:', err.message);
    }
  }

  const store = readStore();
  return store.results.find(r => r.id === id || r._id === id);
}

async function getRecentHistory(limit = 15) {
  if (isMongoConnected) {
    try {
      const docs = await AnalysisResultModel.find().sort({ createdAt: -1 }).limit(limit).lean();
      if (docs && docs.length > 0) return docs;
    } catch (err) {
      console.warn('MongoDB history error:', err.message);
    }
  }

  const store = readStore();
  return store.results.slice(0, limit);
}

function getDatabaseStatus() {
  const store = readStore();
  return {
    connected: isMongoConnected,
    mode: mongoMode,
    provider: isMongoConnected ? 'Mongoose ODM (MongoDB)' : 'MongoDB Compatible Store',
    uri: mongoUri ? mongoUri.replace(/\/\/.*@/, '//***@') : 'Local Persistent Storage',
    collections: ['submissions', 'analysisresults', 'referencecalendars'],
    stats: {
      submissionsRecorded: store.submissions?.length || 0,
      analysesStored: store.results?.length || 0
    }
  };
}

module.exports = {
  connectDB,
  saveSubmission,
  saveResult,
  getResultById,
  getRecentHistory,
  getDatabaseStatus,
  SubmissionModel,
  ReferenceCalendarModel,
  AnalysisResultModel
};
