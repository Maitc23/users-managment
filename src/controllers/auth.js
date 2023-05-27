const controller = {};
//Middlewares
const jwt = require("jsonwebtoken");
const config = require("../config/config.jwt");
const cloudinary = require("../middlewares/cloudinary");
//Models 
const User = require("../models/users");

//Funcion to register new users
controller.register = async (req, res, next) => {
    try {
        const { name, email, password, passwordCheck } = req.body; //We get the data from the request
        let img = { secure_url: '', public_id: '' }; //We create a variable to save the image
        const file = req.file;//We get the image from the request

        const correo = email.toLowerCase();

        //Check of required params
        if (!correo || !password || !passwordCheck || !name) return res.status(400).json({ error: "Campos obligatorios no llenados", success: false });

        //We validate the length of the password
        if (password.length < 5) return res.status(400).json({ error: "La contraseña debe ser de 5 caracteres minimo", success: false });

        //We check if the passwords are the same 
        if (password !== passwordCheck) return res.status(400).json({ error: "Las contraseñas no coinciden", success: false });

        //Get of user with the email send by the user
        const existingEmail = await User.findOne({ email: correo });

        //Check if the email is already on the database
        if (existingEmail) return res.status(400).json({ error: "Correo ya registrado", success: false });

        //We check if the user send the image 
        if (file !== undefined) {
            //We upload the image to cloudinary
            img = await cloudinary.uploader.upload(file.path);
        }

        //We register the user 
        const user = new User({
            name,
            email: correo,
            password,
            img: {
                url: img.secure_url,
                cloudinary_id: img.public_id,
            }
        });

        //Encriptation of the password
        user.password = await user.encryptPassword(user.password);

        //We save the user on the database
        await user.save();

        //We send the response 
        res.status(200).json({
            user,
            message: "Usuario creado",
        });
    } catch (err) {
        console.log(err)
        res.status(err.status ? err.status : 500).send({ error: err, success: false });
    }
};

//Funcion to login users
controller.login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        let correo = email.toLowerCase();

        //Validamos que llenen los espacios
        if (!email || !password) return res.status(400).json({ error: "Campos vacios", success: false });

        //We get the user with the email 
        let user = await User.findOne({ email: correo });

        //We check if the user exist by the email
        if (!user) return res.status(400).json({ error: "Correo o contraseña incorrectos", success: false });

        //We check if the password is correct
        const validPassword = await user.validatePassword(password);

        //We check if the password is correct 
        if (!validPassword) return res.status(400).json({ error: "Correo o Contraseña incorrectos", success: false });

        //We create the token
        const token = jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET || config.secret,
            {
                expiresIn: 60 * 60 * 24,
            }
        );

        //We save the token on the database 
        user.access_token = token;
        await user.save();

        //Response 
        return res.status(200).json({
            auth: true,
            token,
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                img: user.img,
                access_token: user.access_token
            },
            message: "Usuario loggeado"
        });
    } catch (err) {
        console.log(err)
        res.status(err.status ? err.status : 500).send({ error: err, success: false });
    }
};

//We get the user data
controller.me = async (req, res, next) => {
    try {
        //We get the user data
        const user = await User.findById(req.userId, { password: 0 });
        //We check if the user exist
        if (!user) return res.status(404).json({ error: "Usuario no encontrado", success: false });

        //We send the user data
        return res.status(200).json({user, success: true, message: "Usuario encontrado" });
    } catch (err) {
        res.status(err.status ? err.status : 500).send({ error: err, success: false });
    }
};

//Validate the token
controller.tokenIsValid = async (req, res, next) => {
    try {
        //We get the token
        const token = req.headers["user-access-token"];
        
        //We check if the token exist
        if (!token) return res.json(false);
        
        //We validate the token
        const decoded = jwt.verify(token, process.env.JWT_SECRET || config.secret);

        //We check if the token is valid
        if (!decoded) return res.json(false);
        
        //We get the user data
        const user = await User.findById(decoded.id);

        //We check if the user exist
        if (!user) return res.json(false);
        
        //Response
        return res.status(200).json(true);
    } catch (err) {
        res.status(err.status ? err.status : 500).send({ error: err, success: false });
    }
};

module.exports = controller;
