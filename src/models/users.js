const { Schema, model } = require('mongoose');
const bcrypt = require('bcryptjs');

//Model for users 
const userSchema = new Schema({
    name: String,
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
        minlength: 5
    },
    img: {
        cloudinary_id: {
            type: String,
            default: ""
        },
        url: {
            type: String,
            default: "",
        }
    },
    access_token: {
        type: String,
    },
    questions: [{
        type: Schema.Types.ObjectId,
        ref: 'questions'
    }]
},
    {
        timestamps: true
    });

//Encrypt the password
userSchema.methods.encryptPassword = async (password) => {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
};

//Compare the password with the encrypted password
userSchema.methods.validatePassword = function (password) {
    return bcrypt.compare(password, this.password);
}


module.exports = model('Users', userSchema);