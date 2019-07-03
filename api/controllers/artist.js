'use strict'
const fs = require('fs');
const path = require('path');
const mongoosePaginate = require('mongoose-pagination');

const Artist = require('../models/artist');
const Album = require('../models/album');
const Song = require('../models/song');

    function getArtist(req, res){
        
        let artistId = req.params.id;

        Artist.findById(artistId,(err,artist)=>{
            if(err){
                res.status(500).send({message: 'Error en la peticion'});
            }else{
                if(!artist){
                    res.status(404).send({message:'El artista no existe'});
                }else{
                    res.status(200).send({artist});

                }
            }
        });
        

    }

    function getArtists(req,res){
        let page = req.params.page?req.params.page:1;
        let itemsPerPage = 3;

        Artist.find().sort('name').paginate(page,itemsPerPage,(err,artists,total)=>{
            if(err){
                res.status(500).send({message:'Error en la petición'});
            }else{
                if(!artists){
                    res.status(404).send({message: 'No hay artistas !'});

                }else{
                    return res.status(200).send({
                        total_items : total,
                        artists: artists, 
                    })
                }
            }
        })

    }

    function saveArtist(req,res){
        let artist = new Artist();
        let params = req.body;
        artist.name = params.name;
        artist.description = params.description;
        artist.image = 'null';
        artist.save((err,artistStored)=>{
            if(err){
                res.status(500).send({message:'Error al guardar el artista'})
            }else{
                if(!artistStored){
                    res.status(404).send({message: 'El artista no ha sido guardado'});
                }else{
                    res.status(200).send({artist: artistStored});
                }
            }
        })
    }

    function updateArtist(req,res){
        let artistId = req.params.id;
        let update = req.body;

        Artist.findByIdAndUpdate(artistId,update,(err,artistUpdated)=>{
            if(err){
                res.status(500).send({message: 'Error al guardar el artista'});
            }else{
                !artistUpdated?res.status(404).send({message: 'El artista no ha sido actualizado'}):res.status(200).send({artist: artistUpdated});
            }
        })
    }

    function deleteArtist(req,res){
        let artistId = req.params.id;
        Artist.findByIdAndRemove(artistId,(err,artistRemoved)=>{
            if(err){
                res.status(500).send({message: 'Error al borrar el artista'});
            }else{
                if(!artistRemoved){
                    res.status(404).send({message: 'El artista no ha sido eliminado'});
                }else{
                    res.status(200).send({artist: artistRemoved});
                    Album.find({artist: artistRemoved._id}).remove((err,albumRemoved)=>{
                        if(err){
                            res.status(500).send({message: 'Error al borrar el album'});
                        }else{
                            if(!albumRemoved){
                                res.status(404).send({message: 'El album no ha sido eliminado'});
                            }else{
                                res.status(200).send({album: albumRemoved});

                                Song.find({album: albumRemoved._id}).remove((err,songRemoved)=>{
                                    if(err){
                                        res.status(500).send({message: 'Error al borrar la cancion'});
                                    }else{
                                        if(!songRemoved){
                                            res.status(404).send({message: 'La cancion no ha sido eliminada'});
                                        }else{
                                            res.status(200).send({song: songRemoved});
                                        }
                                        
                                    }
                                })
                            }
                            
                        }
                    })
                }

            }
        });
    }

    function uploadImage(req,res){
        var artistId = req.params.id;
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
                Artist.findByIdAndUpdate(artistId,{image: file_name},(err,artistUpdated)=>{
                   
                        if(!artistUpdated){
                            res.status(404).send({message:'No se ha podido actualizar el artista'});
            
                        }else{
                            res.status(200).send({artist: artistUpdated});
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
        let pathFile = `./uploads/artists/${imageFile}`;
    
        fs.exists('./uploads/artists/'+imageFile, exists =>{
            if(exists){
                res.sendFile(path.resolve(pathFile))
            }else{
                res.status(200).send({message: 'No existe el fichero'})
            }
        })
    }



    module.exports = {
        getArtist,
        getArtists,
        saveArtist,
        updateArtist,
        deleteArtist,
        uploadImage,
        getImageFile
    };