const express = require("express")
const router = express.Router()
const Chat = require('./chatModel')
const sha1 = require('sha1')

router.post('/', (req, res) => {
    const { password, chat } = req.body

    const title = chat

    if (!password || !title) {
        return res.status(400).json({ error: 'Please enter all fields' })
    }
    else {
        Chat.findOne({ chat })
            .then(chat => {
                if (chat) {
                    return res.status(400).json({ error: 'Chat name is already in use' })
                }
                else {
                    const newChat = new Chat({
                        chat: title,
                        author_password: sha1(password)
                    })

                    // newChat.password = sha1(newChat.password)
                    console.log(newChat)
                    newChat.save()
                        .then(chat => {
                            return res.status(200).json({ success: 'Chat was successfully created' })
                        })
                }
            })
    }
})

router.get('/', (req, res) => {
    // if you want 5 minutes, do this 60*5*1000 for 5 minutes | 14 * 24 * 60 * 60 * 1000 for 14 days | 60 * 1000 for 1 minute
    Chat.deleteMany({ last_connection: { "$lt": new Date(Date.now() - 14 * 24 * 60 * 60 * 1000) } })
        .then(res => console.log(res))
    Chat.find()
        .then(chats => {
            // do a filter of over 2 weeks
            // then map it to delete it from the database
            res.json(chats)
        })
})

router.post('/admin', (req, res) => {

    const { adminpw, chat } = req.body

    if (!adminpw || !chat) {
        return res.status(400).json({ error: 'Please enter all fields' })
    }
    else {
        Chat.findOne({ chat })
            .then(chat => {
                if (chat) {
                    if (chat.author_password == sha1(adminpw)) {
                        return res.status(200).json({ adminaccess: true })
                    }
                    else {
                        return res.status(400).json({ error: 'Incorrect access code' })
                    }
                }
                else {
                    return res.status(400).json({ error: 'The chat room does not exist' })
                }
            })
    }
})

router.post('/changename', (req, res) => {

    const { newchat, chat } = req.body

    if (!newchat || !chat) {
        return res.status(400).json({ error: 'Please enter all fields' })
    }
    else {
        Chat.findOne({ chat })
            .then(chat => {
                if (chat) {
                    chat.chat = newchat
                    chat.save()
                    return res.status(200).json({ chat: chat.chat })
                }
                else {
                    return res.status(400).json({ error: 'The chat room does not exist' })
                }
            })
    }
})

router.post('/deletechat', (req, res) => {

    const { chat } = req.body

    if (!chat) {
        return res.status(400).json({ error: 'Please enter all fields' })
    }
    else {
        Chat.findOne({ chat })
            .then(chat => {
                if (chat) {
                    chat.remove()
                    return res.status(200).json({ msg: 'The chat was successfully deleted' })
                }
                else {
                    return res.status(400).json({ error: 'The chat room does not exist' })
                }
            })
    }
})

module.exports = router
