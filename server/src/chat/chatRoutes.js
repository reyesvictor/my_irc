const express = require("express")
const router = express.Router()
const Chat = require('./chatModel')
const sha1 = require('sha1')
const {verifyIfChatExists } = require('./chatController')


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

router.post('/changename', (req, res) => {
    console.log('0 changename__________________________________')

    const { newchat, chat } = req.body
    const oldChat = chat
    console.log('1__________________________________')
    console.table([newchat, chat])
    if (!newchat || !chat) {
        console.log('1 end__________________________________')
        return res.status(400).json({ error: 'Please enter all fields' })
    }
    else {
        console.log('2 else__________________________________')
        Chat.findOne({ chat })
            .then(chat => {
                if (chat) {
                    console.log('3__________________________________')
                    chat.save()
                    return res.status(200).json({ newChat: newchat, oldChat: oldChat })
                }
                else {
                    console.log('4__________________________________')
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


router.post('/verifyURL', (req, res) => {
    console.log('\nrouterget_____________________________________________________________')
    console.log(req.body)
    const { search } = req.body.location
    console.log(search)
    const chat = search.split('/').reverse()[0].split('=').reverse()[0]
    //verifier si chat existe. sinon redirect.
    if ( verifyIfChatExists(chat) ) { // true == chat exist, all ok
        return res.status(200).json({msg:'EVERYTHING OK'});
    } else { // chat does not exist
        return res.status(400).json({error:'WRONG URL'});
    }
    console.log('routerget_____________________________________________________________\n')
  })


module.exports = router
