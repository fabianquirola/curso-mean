'use strict'
const fs = require('fs');
const path = require('path');

var bcrypt = require('bcrypt-nodejs');
var User = require('../models/user');
var jwt = require('../services/jwt');



function pruebas(req, res){
    res.status(200).send({
        message:'Probando una accion del controlador de usuarios del api rest con Node y Mongo'
    })
}

function saveUser(req,res){
    var user = new User();
    var params = req.body;

    console.log(params);

    user.name = params.name;
    user.surname = params.surname;
    user.email = params.email;
    user.role = 'ROLE_ADMIN';
    user.image = 'null';

    if(params.password){
        //encriptr contraseña y guardar datos
        bcrypt.hash(params.password,null,null, (err,hash)=>{
            user.password = hash;
            if(user.name != null && user.surname != null && user.email != null){
                //guardr el usuario
                user.save((err,userStored)=>{
                    if(err){
                        res.status(500).send({message: 'Error al guardar el usuario'});
                    }else{
                        if(!userStored){
                            res.status(404).send({message: 'No se ha registrado el usuario'});
                        }else{
                            res.status(200).send({user: userStored});
                        }
                    }
                });
            }else{
                res.status(200).send({message: 'Introduce los datos'});
            }
        })
    }else{
        res.status(200).send({message: 'Introduce la contraseña'});
    }
}

function loginUser(req,res){
    var params = req.body;

    var email = params.email;
    var password = params.password;

    console.log(email.toLowerCase());
    User.findOne({email:email.toLowerCase()},(err,user) => {
        
        if(err){
            res.status(500).send({message:'Error en la petición'});
        }else{
           
            if(!user){
                res.status(404).send({message: 'El usuario no existe'});
            }else{

                //comprobamos la contraseña
                bcrypt.compare(password,user.password,(err,check)=>{
                    if(check){
                        //devolver los datos del usuario logueado
                        if(params.gethash){
                            //devolver un token
                            res.status(200).send({
                                token: jwt.createToken(user)
                            })
                        }else{
                            res.status(200).send({user});
                        }
                    }else{
                        res.status(404).send({message: 'El usuario no ha podido loguearse'});
                    }
                })
            }
        }
    });

}

function updateUser(req,res){
    var userId = req.params.id;
    var update = req.body;

    User.findByIdAndUpdate(userId,update,(err,userUpdated)=>{
        if(err){
            res.status(500).send({message:'Error al actualizar el usuario'})
        }else{
            if(!userUpdated){
                res.status(404).send({message:'No se ha podido actualizar el usuario'});

            }else{
                res.status(200).send({user: userUpdated});
            }
        }

    });
}

function uploadImage(req,res){
    var userId = req.params.id;
    var file_name = 'No subido...';

    if(req.files){
        var file_path = req.files.image.path;
        var file_split = file_path.split('\/');
        var file_name = file_split[2];
        var ext_split = file_name.split('\.');
        var file_ext = ext_split[1];

        console.log(file_split);
        console.log(file_name);
        console.log(file_ext);

        if(file_ext === 'png' || file_ext === 'jpg' || file_ext === 'gif'){
            User.findByIdAndUpdate(userId,{image: file_name},(err,userUpdated)=>{
               
                    if(!userUpdated){
                        res.status(404).send({message:'No se ha podido actualizar el usuario'});
        
                    }else{
                        res.status(200).send({image: file_name, user: userUpdated});
                    }
                
            })
        }else{
            return '';
        }

    }else{
        res.status(200).send({message:'No has subido una imagen...'});
    }
}
 
function getImageFile(req,res){
    let imageFile = req.params.imageFile;
    let pathFile = `./uploads/users/${imageFile}`;

    fs.exists('./uploads/users/'+imageFile, exists =>{
        if(exists){
            res.sendFile(path.resolve(pathFile))
        }else{
            res.status(200).send({message: 'No existe el fichero'})
        }
    })
}

module.exports = {
    pruebas,
    saveUser,
    loginUser,
    updateUser,
    uploadImage,
    getImageFile,
};