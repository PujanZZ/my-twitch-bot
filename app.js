require('dotenv').config();

const tmi = require('tmi.js');
const fs = require('fs');
const data = JSON.parse(fs.readFileSync('service/combined_rankings.json', 'utf-8'));

const twitchBotUsername = process.env.TWITCH_BOT_USERNAME;
const oauthToken = process.env.TWITCH_CHAT_OAUTH;

const client = new tmi.Client({
    options: { debug: true },
    identity: {
        username: twitchBotUsername,
        password: oauthToken,
    },
    channels: ['pujzz'],
});

const commandPrefix = '!cs';

client.connect().catch(console.error);

client.on('message', (channel, tags, message, self) => {
    if (self) return;
    const prefix = commandPrefix.toLowerCase();

    if (message.toLowerCase().startsWith(prefix)) {
        // Remove prefix and trim
        const commandBody = message.slice(prefix.length).trim();

        // Try to split on ' vs ' case insensitive
        // Using a regex to split on ' vs ' ignoring case and spaces around it
        const teams = commandBody.split(/ vs /i);

        if (teams.length === 2) {
            const teamA = teams[0].trim();
            const teamB = teams[1].trim();

            // Get data for each team
            let team1Json = getCombinedTeamData(teamA);
            let team2Json = getCombinedTeamData(teamB);

            //monte carlo
            // let results = monteCarloWinProbability(team1Json, team2Json, 500);

            //elo
            let results = eloWinProbability(team1Json, team2Json);

            console.log(results);


            // Log nicely
            // console.log("=== Monte Carlo Win Probability ===");
            // console.log(`Team A: ${results.teamA} - Win Rate: ${results.teamAWinRate.toFixed(2)}%`);
            // console.log(`Team B: ${results.teamB} - Win Rate: ${results.teamBWinRate.toFixed(2)}%`);
            // console.log("===================================");

            const chatMessage = `@${tags.username} ${results.teamA} vs ${results.teamB} — ` +
                `${results.teamA}: ${results.teamAWinRate.toFixed(2)}% chance to win, ` +
                `${results.teamB}: ${results.teamBWinRate.toFixed(2)}% chance to win.`;

            client.say(channel, chatMessage);
        }
    }
});


function monteCarloWinProbability(teamA, teamB, iterations) {
    const strengthA = teamA.points ?? (1 / teamA.rank);
    const strengthB = teamB.points ?? (1 / teamB.rank);

    let winsA = 0;
    let winsB = 0;

    for (let i = 0; i < iterations; i++) {
        const totalStrength = strengthA + strengthB;
        const rand = Math.random() * totalStrength;
        if (rand < strengthA) {
            winsA++;
        } else {
            winsB++;
        }
    }

    return {
        teamA: teamA.name,
        teamAWinRate: (winsA / iterations) * 100,
        teamB: teamB.name,
        teamBWinRate: (winsB / iterations) * 100
    };
}

function getCombinedTeamData(teamName) {
    const hltvTeam = data.hltv.teams.find(t => t.name.toLowerCase() === teamName.toLowerCase());
    const valveTeam = data.valve.teams.find(t => t.name.toLowerCase() === teamName.toLowerCase());

    if (!hltvTeam && !valveTeam) return null;

    return {
        name: teamName,
        rank: hltvTeam?.rank ?? valveTeam?.rank ?? null,
        points: hltvTeam?.points ?? valveTeam?.points ?? null
    };
}


//  ELO

function eloWinProbability(teamA, teamB) {
    const eloDiff = teamB.points  - teamA.points;

    const pA = 1 / (1 + Math.pow(10, eloDiff / 400));
    const pB = 1 - pA;

    return {
        teamA: teamA.name,
        teamAWinRate: pA * 100,
        teamB: teamB.name,
        teamBWinRate: pB * 100
    };
}
