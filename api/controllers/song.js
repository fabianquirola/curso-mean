'use strict'
const fs = require('fs');
const path = require('path');
const mongoosePaginate = require('mongoose-pagination');

const Artist = require('../models/artist');
const Album = require('../models/song');
const Song = require('../models/song');


function getSong(req, res){

        
    let songId = req.params.id;

    Song.findById(songId).populate({path:'album'}).exec((err,song)=>{
        if(err){
            res.status(500).send({message: 'Error en la petición'});
        }else{
            if(!song){
                res.status(404).send({message:'La Canción no existe'})
            }else{
                res.status(200).send({song});
            }
        }
    });
    
    

}

function saveSong(req,res){

    let song = new Song;

    let params = req.body;

    song.number = params.number;
    song.name = params.name;
    song.duration = params.duration;
    song.file = null;
    song.album = params.album;

    song.save((err,songStored)=>{
        if(err){
            res.status(500).send({message:'Error en el servidor'});

        }else{
            if(!songStored){
                res.status(404).send({message: 'No se ha guardado el song'});
            }else{
                res.status(200).send({song : songStored});
            }
        }
    });

}

function getSongs(req, res){
    
    let albumId = req.params.artist;
    let find = '';

    if(!albumId){
        // sacar todos los songs
        find = Song.find().sort('numer');
    }else{
        // Sacar los songs de un artista concreto
        find = Song.find({album:albumId}).sort('number');
    }

    find.populate({
        path: 'album',
        populate:{
            path:'artist',
            model:'Artist'
        },
    }).exec((err,songs)=>{
        if(err){
            res.status(500).send({message: 'Error en la petición'});
        }else{
            if(!songs){
                res.status(404).send({message:'No hay Songs'})
            }else{
                res.status(200).send({songs});
            }
        }
    })

    
    

}



const updateSong = (req,res) => {
    let songId = req.params.id;
    let update = req.body;

    Song.findByIdAndUpdate(songId,update,(err,songUpdated)=>{
        if(err){
            res.status(500).send({message: 'Error al guardar el song'});
        }else{
            !songUpdated?res.status(404).send({message: 'El song no ha sido actualizado'}):res.status(200).send({song: songUpdated});
        }
    })
}


const deleteSong = (req,res)=>{
    let songId = req.params.id;

    Song.findByIdAndDelete(songId,(err,songRemoved)=>{
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

const uploadFile = (req,res) => {
    var songId = req.params.id;
    var file_name = 'No subido...';

    if(req.files){
        var file_path = req.files.file.path;
        var file_split = file_path.split('\/');
        var file_name = file_split[2];
        var ext_split = file_name.split('\.');
        var file_ext = ext_split[1];

        console.log(file_split);
        console.log(file_name);
        console.log(file_ext);

        if(file_ext === 'mp3' || file_ext === 'ogg'){
            Song.findByIdAndUpdate(songId,{file: file_name},(err,songUpdated)=>{
               
                    if(!songUpdated){
                        res.status(404).send({message:'No se ha podido actualizar la Canción'});
        
                    }else{
                        res.status(200).send({song: songUpdated});
                    }
                
            })
        }else{
            return '';
        }

    }else{
        res.status(200).send({message:'No has subido una imagen...'});
    }
}
 
const getSongFile = (req,res) => {
    let songFile = req.params.songFile;
    let pathFile = `./uploads/songs/${songFile}`;

    fs.exists('./uploads/songs/'+songFile, exists =>{
        if(exists){
            res.sendFile(path.resolve(pathFile))
        }else{
            res.status(200).send({message: 'No existe el fichero'})
        }
    })
}



module.exports = {
    getSong,
    saveSong,  
    getSongs,
    updateSong,
    deleteSong,
    uploadFile,
    getSongFile
};