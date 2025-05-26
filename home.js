require('dotenv').config();

const fetch = require('node-fetch');
const tmi = require('tmi.js');

const twitchBotUsername = process.env.TWITCH_BOT_USERNAME;
const oauthToken = process.env.OAUTH_TOKEN;

const client = new tmi.Client({
    options: { debug: true },
    identity: {
        username: twitchBotUsername,
        password: oauthToken,
    },
    channels: ['pujzz'],
});

client.connect().catch(console.error);

let count = 0;
let heardTheCount = false;
const commandPrefix = 'pb';

client.on('message', (channel, tags, message, self) => {
    const channelNameWithoutHash = channel.replace(/#(?=\S)/g, '');
    const isNotBot = tags.username.toLowerCase() !== twitchBotUsername;

    const allowedUser = tags.username.toLowerCase();
    const isModerator = tags['user-type'];

    async function getRandomViewer() {
        try {
            const response = await fetch(`https://tmi.twitch.tv/group/user/${channelNameWithoutHash}/chatters`);
            console.log(response);
            const data = await response.json();
            const { broadcaster, moderators, vips, viewers } = data.chatters;
            const allViewers = [...broadcaster, ...moderators, ...vips, ...viewers];
            const randomIndex = Math.floor(Math.random() * allViewers.length);
            const randomViewer = allViewers[randomIndex];

            if (message === `${commandPrefix} streamer`) {
                client.say(channel, `Broadcaster of the channel is: ${broadcaster} TriHard`);
            }

            if (message.toLowerCase().startsWith(`${commandPrefix} bing`)) {
                console.log(randomViewer);
                client.say(channel, `Smadging get binged idiot, ${randomViewer}`);
            }
        } catch (err) {
            console.error('Error fetching viewers:', err);
        }
    }

    // getRandomViewer();

    async function getAdvice() {
        try {
            const quoteResponse = await fetch(`https://api.adviceslip.com/advice`);
            const adviceData = await quoteResponse.json();

            if (message.startsWith(`${commandPrefix} advice`)) {
                client.say(channel, `@${tags.username} ${adviceData.slip.advice} ok`);
            }
        } catch (err) {
            console.error('Error fetching advice:', err);
        }
    }

    getAdvice();

    if (message.startsWith(`${commandPrefix} say`)) {
        const sentence = message.split(' ').slice(2).join(' ');
        client.say(channel, `${sentence}`);
    }

    if (message === `${commandPrefix} help`) {
        client.say(channel, `${commandPrefix} ping, ${commandPrefix} say, ${commandPrefix} advice, ${commandPrefix} life, ${commandPrefix} bing`);
    }

    if (message.toLowerCase().startsWith(`${commandPrefix} ping`) && isNotBot) {
        client.say(channel, `@${tags.username}, TriHard !!`);
    }

    const randomMath = Math.floor(Math.random() * 101);
    if (isNotBot && message.toLowerCase().startsWith(`${commandPrefix} life`)) {
        client.say(channel, `${tags.username} you have ${randomMath} years left! Better GETALIFE`);
    }

    if (message.toLowerCase().startsWith(`${commandPrefix} cum`)) {
        client.say(channel, `${tags.username} just came sadE !`);
    }
    if (message.includes('but first')) {
        client.say(channel, `let me take a selfie Pepepains 🤳`);
    }

    async function getMovieReview(movieName) {
        try {
            const searchResponse = await fetch(`https://api.themoviedb.org/3/search/movie?api_key=YOUR_TMDB_API_KEY&query=${encodeURIComponent(movieName)}`);
            console.log(searchResponse);
            const searchData = await searchResponse.json();
    
            if (searchData.results.length > 0) {
                const selectedMovie = searchData.results[0];
    
                const reviewsResponse = await fetch(`https://api.themoviedb.org/3/movie/${selectedMovie.id}/reviews?api_key=YOUR_TMDB_API_KEY`);
                const reviewsData = await reviewsResponse.json();
    
                if (reviewsData.results.length > 0) {
                    const randomReview = reviewsData.results[Math.floor(Math.random() * reviewsData.results.length)];
    
                    if (message.startsWith(`${commandPrefix} moviereview`)) {
                        client.say(channel, `@${tags.username} Here's a random movie review for "${selectedMovie.title}": ${randomReview.content}`);
                    }
                } else {
                    client.say(channel, `@${tags.username} Sorry, no reviews available for "${selectedMovie.title}".`);
                }
            } else {
                client.say(channel, `@${tags.username} Sorry, couldn't find information for the movie "${movieName}".`);
            }
        } catch (err) {
            console.error('Error fetching movie review:', err);
        }
    }

});
