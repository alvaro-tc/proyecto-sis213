const mongoose = require('mongoose');

const groqKeySchema = new mongoose.Schema(
  {
    label:        { type: String, required: true, trim: true },
    key:          { type: String, required: true, trim: true, unique: true },
    active:       { type: Boolean, default: true },
    tokenUsed:    { type: Number, default: 0 },
    tokenLimit:   { type: Number, default: 500000 },
    requestCount: { type: Number, default: 0 },
    lastUsed:     { type: Date, default: null },
    lastError:    { type: String, default: null },
    lastStatus: {
      type: String,
      enum: ['ok', 'rate_limited', 'invalid', 'error', 'unknown'],
      default: 'unknown',
    },
  },
  { timestamps: true }
);

groqKeySchema.virtual('maskedKey').get(function () {
  const k = this.key || '';
  if (k.length <= 8) return '***';
  return `${k.slice(0, 8)}…${k.slice(-4)}`;
});

groqKeySchema.virtual('usagePercent').get(function () {
  if (!this.tokenLimit) return 0;
  return Math.min(100, Math.round((this.tokenUsed / this.tokenLimit) * 100));
});

groqKeySchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('GroqKey', groqKeySchema);
