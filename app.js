require('dotenv').config()


const { default: fetch } = require("node-fetch");
const tmi = require('tmi.js');




const client = new tmi.Client({
    options: { debug: true },
    identity: {
        username: process.env.TWITCH_BOT_USERNAME,
        password: process.env.TWITCH_OAUTH_TOKEN,
    },
    channels: ['pujzz', 'Tolatos', 'Hotbear1110']
});

client.connect().catch(console.error);


let count = 0
let heardTheCount = false
const users = {}

client.on('message', (channel, tags, message, self) => {


    const channelkek = channel.replace(/#(?=\S)/g, '')
    const isNotBot = tags.username.toLowerCase() !== process.env.TWITCH_BOT_USERNAME

    const allowedUsers = tags.username.toLowerCase()
    const isMod = tags['user-type']


    async function getUser() {

        try {
            const response = await fetch(`https://tmi.twitch.tv/group/user/${channelkek}/chatters`);
            const data = await response.json()

            //console.log(data)
            const streamer = data.chatters.broadcaster
            const imchicken = data.chatters.moderators
            const vips = data.chatters.vips
            const viewerlul = data.chatters.viewers
            const finalList = streamer.concat(imchicken, vips, viewerlul)
            const randomArr = Math.floor(Math.random() * finalList.length);
            const randomItem = finalList[randomArr]

            if (message === 'pb streamer') {
                client.say(channel, `Broadcaster of the channel is: ${streamer} TriHard`)

            }


            if (message.toLowerCase().startsWith('pb bing')) {
                console.log(randomItem)
                client.say(channel, `Smadging get binged idiot, ${randomItem}`)
            }
        }
        catch (err) {
            console.log(`error`)
        }


    }

    getUser()

    const getHelp = async () => {

        try {
            const quote = await fetch(`https://api.adviceslip.com/advice`);
            const line = await quote.json()
            //console.log(line.slip)
            if (message.startsWith('pb advice')) {
                client.say(channel, `@${tags.username} ${line.slip.advice} ok`)

            }
        }
        catch (err) {
            console.log('error')
            
        }

    }
    getHelp()



    if (message.startsWith('pb say')) {
        let sentence = message.split(' ')
        sentence.shift()
        sentence.shift()
        sentence = sentence.join(" ")
        console.log(sentence)
        client.say(channel, `${sentence}`)

    }

    //

    if (message === 'pb help') {
        client.say(channel, `pb ping, pb say, pb advice, pb life, pb bing, pb mod`)
    }


    //
    //console.log(isMod)
    //https://tmi.twitch.tv/group/user/${channel}/chatters 


    if (self) return;
    if (message.toLowerCase().startsWith('pb ping') && isNotBot) {
        client.say(channel, `@${tags.username}, TriHard !!`);

    }

    const randomMath = Math.floor(Math.random() * 101);
    if (isNotBot && message.toLowerCase().startsWith('pb life')) {
        client.say(channel, `${tags.username} you have ${randomMath} yil left! better GETALIFE`)
    }


    if (message.toLowerCase().startsWith('pb mod') && isMod === 'mod') {
        client.say(channel, `@${tags.username} is a mod. MODS`)
    } else if (message.toLowerCase().startsWith('pb mod') && isMod !== 'mod') {
        client.say(channel, `@${tags.username} is not a mod.`)
    }



    if ((message.toLowerCase().startsWith('pb colorge'))) {
        client.say(channel, `@${tags.username} has ${tags.color} color`)
    }




});




