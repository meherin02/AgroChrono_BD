const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');

const DATA_DIR = path.join(__dirname, '..', '..', 'data');
const STORE_FILE = path.join(DATA_DIR, 'store.json');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

let isMongoConnected = false;

// Internal in-memory/file storage fallback
function readStore() {
  try {
    if (fs.existsSync(STORE_FILE)) {
      const raw = fs.readFileSync(STORE_FILE, 'utf8');
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error('Error reading store file, creating fresh:', err.message);
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

// Mongoose Schemas (if MongoDB is used)
const submissionSchema = new mongoose.Schema({
  crop: String,
  district: String,
  season: String,
  variety: String,
  plantingStart: String,
  plantingEnd: String,
  growthStart: String,
  growthEnd: String,
  harvestStart: String,
  harvestEnd: String,
  createdAt: { type: Date, default: Date.now }
});

const analysisResultSchema = new mongoose.Schema({
  submissionId: String,
  submission: Object,
  reference: Object,
  reliabilityScore: Number,
  assessmentCompleteness: Number,
  anomalyDetected: Boolean,
  mlResult: Object,
  parameterBreakdown: Object,
  conflicts: Array,
  weatherAssessment: Object,
  explanations: Array,
  suggestions: Array,
  createdAt: { type: Date, default: Date.now }
});

let SubmissionModel;
let AnalysisResultModel;

async function connectDB() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.log('ℹ No MONGODB_URI provided. Using built-in persistent JSON store.');
    return;
  }
  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 2500 });
    isMongoConnected = true;
    SubmissionModel = mongoose.model('Submission', submissionSchema);
    AnalysisResultModel = mongoose.model('AnalysisResult', analysisResultSchema);
    console.log('✓ Successfully connected to MongoDB');
  } catch (err) {
    console.warn('⚠ MongoDB connection failed, falling back to local file storage:', err.message);
    isMongoConnected = false;
  }
}

// Unified repository methods
async function saveSubmission(data) {
  const record = {
    ...data,
    id: data.id || `sub_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
    createdAt: new Date().toISOString()
  };

  if (isMongoConnected && SubmissionModel) {
    try {
      const doc = await SubmissionModel.create(record);
      return { ...record, _id: doc._id };
    } catch (err) {
      console.warn('Mongo save error, using local fallback:', err.message);
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

  if (isMongoConnected && AnalysisResultModel) {
    try {
      const doc = await AnalysisResultModel.create(record);
      return { ...record, _id: doc._id };
    } catch (err) {
      console.warn('Mongo save error, using local fallback:', err.message);
    }
  }

  const store = readStore();
  store.results.unshift(record); // newest first
  // Keep last 100
  if (store.results.length > 100) store.results.pop();
  writeStore(store);
  return record;
}

async function getResultById(id) {
  if (isMongoConnected && AnalysisResultModel) {
    try {
      let doc = await AnalysisResultModel.findOne({ id }).lean();
      if (!doc && mongoose.Types.ObjectId.isValid(id)) {
        doc = await AnalysisResultModel.findById(id).lean();
      }
      if (doc) return doc;
    } catch (err) {
      console.warn('Mongo find error:', err.message);
    }
  }

  const store = readStore();
  return store.results.find(r => r.id === id || r._id === id);
}

async function getRecentHistory(limit = 10) {
  if (isMongoConnected && AnalysisResultModel) {
    try {
      return await AnalysisResultModel.find().sort({ createdAt: -1 }).limit(limit).lean();
    } catch (err) {
      console.warn('Mongo history error:', err.message);
    }
  }

  const store = readStore();
  return store.results.slice(0, limit);
}

module.exports = {
  connectDB,
  saveSubmission,
  saveResult,
  getResultById,
  getRecentHistory
};
