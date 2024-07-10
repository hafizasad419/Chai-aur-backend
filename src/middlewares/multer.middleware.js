import express from "express";
import multer from "multer";

const upload = multer({ dest: "uploads/" });

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "/public/temp")
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + file.originalname)
    }
})


export const multer = multer({
    storage
})

