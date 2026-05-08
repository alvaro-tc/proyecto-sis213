const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema({
    name : {
        type: String,
        required: true,
    },

    email : {
        type: String,
        required: true,
        validate: {
            validator: function (v) {
                return /\S+@\S+\.\S+/.test(v);
            },
            message : "Email must be in valid format!"
        }
    },

    phone: {
        type : Number,
        required: true,
        validate: {
            validator: function (v) {
                return /^\d{7,15}$/.test(String(v));
            },
            message : "Phone number must be 7-15 digits!"
        }
    },

    password: {
        type: String,
        required: true,
    },

    role: {
        type: String,
        required: true
    }
}, { timestamps : true })

userSchema.pre('save', async function (next) {
    if(!this.isModified('password')){
        return next();
    }

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
})

// Hashea la contraseña también cuando se actualiza vía findOneAndUpdate / findByIdAndUpdate.
async function hashOnUpdate(next) {
    const update = this.getUpdate() || {};
    const newPassword = update.password || update.$set?.password;
    if (!newPassword) return next();

    try {
        const salt = await bcrypt.genSalt(10);
        const hashed = await bcrypt.hash(newPassword, salt);
        if (update.password) update.password = hashed;
        if (update.$set?.password) update.$set.password = hashed;
        this.setUpdate(update);
        next();
    } catch (err) {
        next(err);
    }
}

userSchema.pre('findOneAndUpdate', hashOnUpdate);
userSchema.pre('updateOne', hashOnUpdate);

module.exports = mongoose.model("User", userSchema);