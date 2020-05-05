"use strict";

var validator = require("validator");
var fs = require("fs");
var path = require("path");

var Article = require("../models/article");

var controller = {
  datosCurso: (req, res) => {
    var hola = req.body.hola;

    return res.status(200).send({
      curso: "Master",
      autor: "Martin Carmona",
      url: ":com",
      hola,
    });
  },

  test: (req, res) => {
    return res.status(200).send({
      message: "Soy la accion test",
    });
  },

  save: (req, res) => {
    //recoger los parametros

    var params = req.body;

    //validar datos
    try {
      var validate_title = !validator.isEmpty(params.title);
      var validate_content = !validator.isEmpty(params.content);
    } catch (err) {
      return res.status(200).send({
        message: "Faltan datos",
      });
    }

    if (validate_title && validate_content) {
      //crear el objeto

      var article = new Article();

      //asignar valores
      article.title = params.title;
      article.content = params.content;
      if (params.image) {
        article.image = params.image;
      }else{
        article.image = null;
      }
      

      //guardar
      article.save((err, article) => {
        if (err || !article) {
          return res
            .status(404)
            .send({ status: "error", message: "los datos no se han guardado" });
        } else {
          //respuesta

          return res.status(200).send({ status: "success", article });
        }
      });
    } else {
      return res.status(200).send({
        message: "los datos no son validos",
      });
    }
  },

  getArticles: (req, res) => {
    var query = Article.find({});

    var last = req.params.last;

    if (last || last != undefined) {
      query.limit(3);
    }

    //Find
    query.sort("-_id").exec((err, articles) => {
      if (err) {
        return res
          .status(500)
          .send({ status: "error", message: "los datos no son válidos" });
      }

      if (!articles) {
        return res
          .status(404)
          .send({ status: "error", message: "no hay articulos que mostrar" });
      }

      return res.status(200).send({
        status: "success",
        articles,
      });
    });
  },

  getArticle: (req, res) => {
    //recoger id

    var articleId = req.params.id;

    //comprobar
    if (!articleId || articleId == null) {
      return res.status(404).send({
        status: "error",
        message: "No existe el articulo",
      });
    }

    //buscar y devolver
    Article.findById(articleId, (err, article) => {
      if (err || !article) {
        return res.status(404).send({
          status: "error",
          message: "no existe",
        });
      }

      return res.status(200).send({
        message: "success",
        article,
      });
    });
  },

  update: (req, res) => {
    //recoger el articulo

    var articleId = req.params.id;

    //recoger los datos a actualizar
    var params = req.body;
    //validar datos
    try {
      var validate_title = !validator.isEmpty(params.title);
      var validate_content = !validator.isEmpty(params.content);
    } catch (err) {
      return res.status(404).send({
        message: "Faltan datos",
      });
    }

    if (validate_title && validate_content) {
      //Find and update
      Article.findOneAndUpdate(
        { _id: articleId },
        params,
        { new: true },
        (err, articleUpdated) => {
          if (err) {
            return res.status(500).send({
              status: "error",
              message: "Actualización no correcta",
            });
          }

          if (!articleUpdated) {
            return res.status(404).send({
              status: "error",
              message: "No existe el articulo",
            });
          }

          //Devolver respuesta
          return res.status(200).send({
            status: "success",
            message: "Articulo actualizado",
            article: articleUpdated,
          });
        }
      );
    } else {
      return res.status(500).send({
        status: "error",
        messasge: "No se ha podido actualizar",
      });
    }
  },

  delete: (req, res) => {
    //recoger el id
    var articleId = req.params.id;
    //find and delete

    Article.findOneAndDelete({ _id: articleId }, (err, articleRemoved) => {
      if (err) {
        return res.status(500).send({
          status: "error",
          message: "error al borrar",
        });
      }
      if (!articleRemoved) {
        return res.status(404).send({
          status: "error",
          message: "No se ha encontrado",
        });
      }

      return res.status(200).send({
        status: "succes",
        article: articleRemoved,
      });
    });
  },

  upload: (req, res) => {
    //Configurar modulo connect multiparty  router/article.js

    //REcoger el fichero de la petición
    var file_name = "imagen no subida..";

    if (!req.files) {
      return res.status(404).send({
        status: "error",
        message: file_name,
      });
    }

    //Conseguir nombre y la extensión del archivo

    var file_path = req.files.file0.path;
    var file_split = file_path.split("/");

    // *ADVERTENCIA EN LINUX O MAC*
    // var file_split = file_path.split('/');

    //nombre del archivo

    var file_name = file_split[2];

    //extensión del fichero

    var extension_split = file_name.split(".");
    var file_ext = extension_split[1];

    //Comprobar la extensión, solo imagenes, y si no es valida borrar el fichero

    if (
      file_ext != "png" &&
      file_ext != "jpg" &&
      file_ext != "jpeg" &&
      file_ext != "gif"
    ) {
      //borrar el archivo

      fs.unlink(file_path, (err) => {
        return res.status(200).send({
          status: "error",
          message: "la extensión no es valida",
        });
      });
    } else {
      //subir archivo
      var articleId = req.params.id;

      if (articleId) {
        Article.findOneAndUpdate(
          { _id: articleId },
          { image: file_name },
          { new: true },
          (err, articleUpdated) => {
            if (err || !articleUpdated) {
              return res.status(500).send({
                status: "error",
                message: "error al guardar",
              });
            }
          }
        );
        return res.status(200).send({
          status: "success",
          article: articleUpdated,
        });
      } else {
        return res.status(200).send({
          status: "success",
          image: file_name
        });
      }
    }

    //si todo es correcto
  },

  getImage: (req, res) => {
    var file = req.params.image;
    var path_file = "./upload/articles/" + file;

    fs.exists(path_file, (exists) => {
      if (exists) {
        return res.sendFile(path.resolve(path_file));
      } else {
        return res.status(500).send({
          status: "error",
          message: "La imagen no existe",
        });
      }
    });
  },

  search: (req, res) => {
    //Sacar el string a buscar

    var searchString = req.params.search;

    Article.find({
      $or: [
        { title: { $regex: searchString, $options: "i" } },
        { content: { $regex: searchString, $options: "i" } },
      ],
    })
      .sort([["date", "descending"]])
      .exec((err, articles) => {
        if (err) {
          return res.status(500).send({
            status: "error",
            messasge: "error en la peticion",
          });
        }

        if (!articles || articles.length <= 0) {
          return res.status(404).send({
            status: "error",
            messasge: "no hay articulos que mostrar",
          });
        }

        return res.status(200).send({
          status: "success",
          articles,
        });
      });
    //find orr
  },
}; //end controller

module.exports = controller;
