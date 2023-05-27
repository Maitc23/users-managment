const controller = {};
const User = require('../models/users');
const cloudinary = require('../middlewares/cloudinary');

//Function to get user by id
controller.getUserById = async (req, res) => {
    try {
        const user_id = req.params;

        //Check of required params
        if (!user_id) return res.status(400).json({ error: 'Campos vacios', sucess: false });

        //We get the user
        const user = await User.findById(user_id, { password: 0, access_token: 0 });

        //We check if the user exist
        if (!user) return res.status(400).json({ error: 'Usuario no encontrado', sucess: false });

        //Response 
        return res.status(200).json({ message: 'Usuario obtenido', sucess: true, user });

    } catch (err) {
        res.status(err.status ? err.status : 500).send({ error: err, success: false });
    }
}

//Function to update a user 
controller.updateUser = async (req, res) => {
    try {
        //We get the data
        let { name, email, password } = req.body;
        let profilePicture = req.file;
        let user_id = req.params;
        let correo = ''
        let img = {
            public_id: '',
            secure_url: ''
        }
        //We get the last data of the user
        const lastUserData = await User.findById(user_id);

        //If the user dont exist we throw an error
        if (!lastUserData) return res.status(400).json({ error: 'Usuario no encontrado', sucess: false });

        //We verify the fields empty and if they are empty we put the last data
        if (!name || name === '') name = lastUserData.name;

        //We verify the password field 
        if (!password || password === '') {
            password = lastUserData.password
        } else {
            //We validate the length of the password
            if (password.length < 5) return res.status(400).json({ error: "La contraseña debe ser de 5 caracteres minimo", success: false });
            //Encriptation of the password
            password = await lastUserData.encryptPassword(password);
        }

        //We verify the email
        if (!email || email === '') {
            correo = lastUserData.email
        } else {
            correo = email.toLowerCase();
            //Get of user with the email send by the user
            const checkUser = await User.findOne({ email: correo });
            //We check if the user exist
            if (checkUser) return res.status(400).json({ error: 'El correo ya existe', sucess: false });
        }

        //We verify the profile picture
        if (!profilePicture || profilePicture === undefined) {
            img = {
                public_id: lastUserData.cloudinary_id,
                secure_url: lastUserData.profilePicture
            }
        } else {
            //We check if previously have an image on cloudinary 
            if (lastUserData.img.cloudinary_id !== '' && lastUserData.img.cloudinary_id !== undefined) {
                //We delete the last image of cloudinary
                await cloudinary.uploader.destroy(lastUserData.img.cloudinary_id);
            }
            //We upload the user picture to cloudinary
            img = await cloudinary.uploader.upload(profilePicture.path);
        }

        //We update the user info 
        await User.findByIdAndUpdate(user_id, {
            name,
            email: correo,
            password,
            img: {
                url: img.secure_url,
                cloudinary_id: img.public_id,
            }
        });

        //Response 
        return res.status(200).json({ message: "Usuario actualizado", sucess: true });

    } catch (err) {
        res.status(err.status ? err.status : 500).send({ error: err, success: false });
    }
}

//Function to delete a user
controller.deleteUser = async (req, res) => {
    try {
        //We get the user id
        const user_id = req.params;

        //Check the params 
        if (!user_id) return res.status(400).json({ error: 'Campos vacios', sucess: false });


        //Get user logged info by the token 
        const userLogged = await User.findById(req.userId);
        
        //We get the user
        const user = await User.findById(user_id);

        //We check if the user exist
        if (!user) return res.status(400).json({ error: 'Usuario no encontrado', sucess: false });

        //We check if the user logged is the same that the user to delete and if it is we throw an error
        if(userLogged._id.toString() === user._id.toString()) return res.status(400).json({ error: 'No tienes permisos para eliminar este usuario', sucess: false }); 

        //We check if the user have a profile picture
        if (user.img.cloudinary_id !== '' && user.img.cloudinary_id !== undefined) {
            await cloudinary.uploader.destroy(user.img.cloudinary_id);
        }

        //We delete the user
        await User.findByIdAndDelete(user_id);

        //Response
        return res.status(200).json({ message: "Usuario eliminado", sucess: true });

    } catch (err) {
        console.log(err)
        res.status(err.status ? err.status : 500).send({ error: err, success: false });
    }
}

//Function to get all users
controller.getUsers = async (req, res) => {
    try {
        //We get all users
        const users = await User.find({},{password: 0, access_token: 0});
        //Response
        return res.status(200).json({ message: "Usuarios obtenidos", sucess: true, users });
    } catch (err) {
        res.status(err.status ? err.status : 500).send({ error: err, success: false });
    }
}



module.exports = controller