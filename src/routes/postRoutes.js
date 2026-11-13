const express = require("express")
const router = express.Router()


const postController = require("../controller/Post/postController.js")

router.post("/criar-post", postController.criarPost)

module.exports = router
