'use strict'
const fs = require('fs');
const path = require('path');
const mongoosePaginate = require('mongoose-pagination');

const Artist = require('../models/artist');
const Album = require('../models/album');
const Song = require('../models/song');

    function getAlbum(req, res){
        
        let albumId = req.params.id;

        Album.findById(albumId).populate({path:'artist'}).exec((err,album)=>{
            if(err){
                res.status(500).send({message: 'Error en la petición'});
            }else{
                if(!album){
                    res.status(404).send({message:'el album no existe'})
                }else{
                    res.status(200).send({album});
                }
            }
        });
        
        

    }

    function saveAlbum(req,res){
        let album = new Album();
        let params = req.body;
        album.title = params.title;
        album.description = params.description;
        album.year = params.year;
        album.image = 'null';
        album.artist = params.artist;

        album.save((err,albumStored)=>{
            if(err){
                res.status(500).send({message:'Error en el servidor'});

            }else{
                if(!albumStored){
                    res.status(404).send({message: 'No se ha guardado el album'});
                }else{
                    res.status(200).send({album : albumStored});
                }
            }
        });

    }

    function getAlbums(req, res){
        
        let artistId = req.params.artist;
        let find = '';

        if(!artistId){
            // sacar todos los albums
            find = Album.find().sort('title');
        }else{
            // Sacar los albums de un artista concreto
            find = Album.find({artist:artistId}).sort('year');
        }

        find.populate({path: 'album'}).exec((err,albums)=>{
            if(err){
                res.status(500).send({message: 'Error en la petición'});
            }else{
                if(!albums){
                    res.status(404).send({message:'No hay Albums'})
                }else{
                    res.status(200).send({albums});
                }
            }
        })

        
        

    }

    function updateAlbum(req,res){
        let albumId = req.params.id;
        let update = req.body;

        Album.findByIdAndUpdate(albumId,update,(err,albumUpdated)=>{
            if(err){
                res.status(500).send({message: 'Error al guardar el album'});
            }else{
                !albumUpdated?res.status(404).send({message: 'El album no ha sido actualizado'}):res.status(200).send({album: albumUpdated});
            }
        })
    }

    const deleteAlbum = (req,res)=>{
        let albumId = req.params.id;
        Album.findByIdAndRemove(albumId,(err,albumRemoved)=>{
            if(err){
                res.status(500).send({message: 'Error al borrar el album'});
            }else{
                if(!albumRemoved){
                    res.status(404).send({message: 'El album no ha sido eliminado'});
                }else{
                    
                    Song.find({album: albumRemoved._id}).remove((err,songRemoved)=>{
                        if(err){
                            res.status(500).send({message: 'Error al borrar la cancion'});
                        }else{
                            if(!songRemoved){
                                res.status(404).send({message: 'La cancion no ha sido eliminada'});
                            }else{
                                res.status(200).send({album: albumRemoved});
                            }
                            
                        }
                    })
                }
                
            }
        })
    }

    function uploadImage(req,res){
        var albumId = req.params.id;
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
                Album.findByIdAndUpdate(albumId,{image: file_name},(err,albumUpdated)=>{
                   
                        if(!albumUpdated){
                            res.status(404).send({message:'No se ha podido actualizar el albuma'});
            
                        }else{
                            res.status(200).send({album: albumUpdated});
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
        let pathFile = `./uploads/albums/${imageFile}`;
    
        fs.exists('./uploads/albums/'+imageFile, exists =>{
            if(exists){
                res.sendFile(path.resolve(pathFile))
            }else{
                res.status(200).send({message: 'No existe el fichero'})
            }
        })
    }



    module.exports = {
        getAlbum,
        saveAlbum,
        getAlbums,
        updateAlbum,
        deleteAlbum,
        uploadImage,
        getImageFile
        
    };