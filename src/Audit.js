const { patch } = require("axios");
const { Client, MessageEmbed } = require("discord.js");
const Audit = new Client({ fetchAllMembers: true });
const Mongoose = require("mongoose");
const { UnregisterRoles, BannedTags, Status, DatabaseName, BannedTagsRole, Tag, SecondTag, TeamRole, TagReception, AuditBotToken, BoosterRole, Prefix, VIP } = require("../global.json").Defaults;
const CooldownXP = new Set();
const Swears = ["allahoc", "allahoç", "allahamk", "allahaq", "0r0spuc0cu", "4n4n1 sk3r1m", "p1c", "p1ç", "@n@nı skrm", "orsb", "orsbcogu", "amnskm", "anaskm", "mk", "amk", "oc", "ag", "fuck", "seks", "sex", "0c", "ambiti", "am biti", "amcik", "amck", "amckl", "amina", "aminakoyarim", "amina koyarim", "amina koyayim", "aminakoyim", "aminda", "amindan", "amindayken", "amini", "aminoglu", "amin oglu", "amiyum", "amk", "amkafa", "amm", "ammak", "ammna","amnda", "amndaki", "amngtn", "amq", "amuna", "ana", "anaaann", "anal", "analarn", "anam", "anamla", "anan", "anana", "anandan", "anani", "ananin", "ananisikerim", "anani sikerim", "ananisikeyim", "anani sikeyim", "anann", "anasi", "anasinin", "anay", "anayin", "anneni", "annenin", "annesiz", "anuna", "aq", "a.q", "a.q.", "aq.", "babani", "bacini", "bacn", "bacndan", "bacy", "bastard", "beyinsiz", "bitch", "boner", "bosalmak", "cibiliyetsiz", "cibilliyetini", "cibilliyetsiz", "dallama", "daltassak", "dalyarak", "dangalak", "dassagi","kaltak", "kancik", "kappe", "karhane", "kavat", "kaypak", "kerane", "kerhane", "kerhanelerde", "kevase", "kevvase", "kodumun", "kodumunun", "koduumun", "koyarm", "koyiim", "koyiiym", "koyim", "koyum", "koyyim", "madafaka", "malafat", "malak", "mcik", "memelerini", "mincikliyim", "mna", "motherfucker", "oc", "ocuu", "o.ç", "o.ç.", "orosbucocuu", "orospu", "orospucocugu", "orospu cocugu", "orospudur", "orospular", "orospunun", "orospunun evlad\u0131", "orospuydu", "orospuyuz", "orostopol", "orrospu", "oruspu", "osbir", "otuzbir", "penis", "pezevek", "pezeven", "pezeveng", "pezevengi", "pezevenk", "pezo", "pic", "picler", "pipi", "porno", "pussy", "rahminde", "s1kerim", "s1kerm", "s1krm", "sakso", "saksofon", "saxo", "serefsiz", "sexs", "sie", "sik", "sikdi", "sikecem", "sikem", "siken", "sikenin", "siker", "sikerim", "sikerler", "sikersin", "sikeyim", "sikeym", "sikicem", "sikici", "sikiiim", "sikiiimmm", "sikiim", "sikiirken", "sikik", "sikilmi", "sikilmie", "sikilmis", "sikilsin", "sikim", "sikimde",  "sikime", "sikimi"];
const Warning = {};

Mongoose.connect("mongodb+srv://muratvastark:airg@123@cluster0.gl8a4.mongodb.net/<dbname>?retryWrites=true&w=majority".replace("<dbname>", DatabaseName), {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false
});
const { LevelModel, StatsModel } = require("./Helpers/models.js");

Audit.once("ready", () => {
    Audit.user.setPresence({ activity: { name: Status, type: "WATCHING" } });

    setInterval(() => {
            const guild = Audit.guilds.cache.first()
            guild.members.fetch().then((members) => {

                members.filter((member) => member.roles.cache.has(BannedTagsRole) && BannedTags.some((tag) => !member.user.username.includes(tag))).forEach((member) => setRoles(member, UnregisterRoles));
                members.filter((member) => BannedTags.some((tag) => member.user.username.includes(tag)) && !member.roles.cache.has(BannedTagsRole)).forEach((member) => setRoles(member, BannedTagsRole));
                members.filter((member) => member.roles.cache.size === 1 && member.roles.cache.first().id === guild.id).forEach((member) => member.roles.add(UnregisterRoles));

                members = members.filter((member) => !member.user.bot && !member.hasPermission("ADMINISTRATOR") && ![BannedTagsRole, ...UnregisterRoles, require("../global.json").Permissions.Suspect.Role].some((role) => member.roles.cache.has(role)));


                members.filter((member) => member.roles.cache.size !== 1 && member.roles.cache.first().id !== guild.id && member.user.username.includes(Tag)).forEach((member) => {
                    if (!member.roles.cache.has(TeamRole)) member.roles.add(TeamRole).catch(console.error);
                    member.setNickname(member.displayName.replace(SecondTag, Tag)).catch(console.error);
                });

                members.filter((member) => !member.user.username.includes(Tag) && !member.roles.cache.has(BoosterRole) && !member.roles.cache.has(VIP)).forEach((member) => {
                    if (member.displayName.includes(Tag)) member.setNickname(member.displayName.replace(Tag, SecondTag)).catch(console.error);
                    if (TagReception === false) member.roles.remove(member.roles.cache.filter((rol) => rol.position >= guild.roles.cache.get(TeamRole).position)).catch(console.error);
                    else setRoles(member, UnregisterRoles);
                });
            });
    }, 5000);
});

Audit.on("guildUpdate", async (oldGuild, newGuild) => {
    if (oldGuild.vanityURLCode === newGuild.vanityURLCode) return;
    const Log = await oldGuild.fetchAuditLogs({ limit: 1, type: "GUILD_UPDATE" }).then(audit => audit.entries.first());
    if (!Log || Log && (Log.executor.id === oldGuild.ownerID || Log.executor.id === Audit.user.id)) return;
    patch(`https://discord.com/api/v8/guilds/${oldGuild.id}/vanity-url`, { code: `${require("../global.json").Defaults.InviteCode}` }, { headers: { Authorization: `Bot ${Audit.token}` } });
});

Audit.on("message", async(message) => {
    if (!message.guild || message.author.bot) return;
    if (!message.member.hasPermission("ADMINISTRATOR")) await messageAudit(message);

    if (!message.content.startsWith(Prefix) && message.content.length > 5) return;

    if (!CooldownXP.has(message.author.id)) {
        const UserData = await LevelModel.findOne({ Id: message.author.id }).exec();
        if (!UserData) (new LevelModel({ Id: message.author.id })).save();
        else {        
            UserData.CurrentXP += Number(Math.floor(Math.random() * (25 - 15 + 1)) + 15);
    
            if (UserData.CurrentXP >= UserData.RequiredXP) {
                UserData.Level += 1;
                UserData.RequiredXP = 5 * (Math.pow(UserData.Level, 2)) + 50 * UserData.Level + 100;
                UserData.CurrentXP = +Number(UserData.RequiredXP - UserData.CurrentXP);
            }
            await UserData.save();

            CooldownXP.add(message.author.id);
            setTimeout(() => {
                CooldownXP.delete(message.author.id);
            }, 60000);
        }
    }

    StatsModel.findOne({ Id: message.member.id }, (err, data) => {
        if (err) return console.error(err);

        if (!data) {
          let voiceMap = new Map();
          let chatMap = new Map();
          chatMap.set((message.channel.parentID || message.channel.id), 1);
          let newMember = new StatsModel({
            Id: message.member.id,
            Voice: voiceMap,
            TotalVoice: 0,
            Message: chatMap,
            TotalMessage: 1
          });
          newMember.save();
        } else {
            let onceki = data.Message.get((message.channel.parentID || message.channel.id)) || 0;
            data.Message.set((message.channel.parentID || message.channel.id), Number(onceki)+1);
            data.TotalMessage++;
            data.save();
        };
    })
});

function setRoles(member, params) {
    if (!member.manageable) return false;
    let roles = member.roles.cache.filter((role) => role.managed).map((role) => role.id).concat(params);
    member.roles.set(roles).catch(console.error);
    return true;
}

async function messageAudit(message) {
    if (!message || !message.content) throw TypeError("Message Audit: Message is required!");

    const Content = message.content;
    const Mention = message.mentions;
    const Link = new RegExp(/(http[s]?:\/\/)(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_+.~#?&/=]*)/gi);
    const Invite = new RegExp(/(https:\/\/)?(www\.)?(discord\.gg|discord\.me|discordapp\.com\/invite|discord\.com\/invite)\/([a-z0-9-.]+)?/i);
    const NativeEmojis = new RegExp(/(?:[\u2700-\u27bf]|(?:\ud83c[\udde6-\uddff]){2}|[\ud800-\udbff][\udc00-\udfff]|[\u0023-\u0039]\ufe0f?\u20e3|\u3299|\u3297|\u303d|\u3030|\u24c2|\ud83c[\udd70-\udd71]|\ud83c[\udd7e-\udd7f]|\ud83c\udd8e|\ud83c[\udd91-\udd9a]|\ud83c[\udde6-\uddff]|[\ud83c\ude01-\ude02]|\ud83c\ude1a|\ud83c\ude2f|[\ud83c\ude32-\ude3a]|[\ud83c\ude50-\ude51]|\u203c|\u2049|[\u25aa-\u25ab]|\u25b6|\u25c0|[\u25fb-\u25fe]|\u00a9|\u00ae|\u2122|\u2139|\ud83c\udc04|[\u2600-\u26FF]|\u2b05|\u2b06|\u2b07|\u2b1b|\u2b1c|\u2b50|\u2b55|\u231a|\u231b|\u2328|\u23cf|[\u23e9-\u23f3]|[\u23f8-\u23fa]|\ud83c\udccf|\u2934|\u2935|[\u2190-\u21ff])/g);
    const CustomEmojis = new RegExp(/<(?:a)?:[a-z0-9_-]{1,256}:[0-9]{16,19}>/gi);
    const Caps = (message.content.match(/[A-ZĞÇÖIÜ]/gm) || []).length;
    let content = undefined;

    if (Link.test(Content)) content = "Link içeren mesaj.";
    else if (Invite.test(Content)) {
        try {
            const FindInvite = await Moderation.fetchInvite(Content);
            if (FindInvite.guild.id !== message.guild.id) content = "Başka sunucunun davet bağlantısı içeren mesaj.";
        } catch(err) {
            content = "Mesaj kanalını kirletmek."
        }
    } else if (Mention.everyone) message = "Everyone içeren mesaj.";
    else if ((Mention.roles.size + Mention.users.size + Mention.channels.size) >= 3) content = "Fazla etiket içeren mesaj.";
    else if (Swears.some(word => new RegExp("(\\b)+(" + word + ")+(\\b)", "gui").test(Content))) content = "Küfür içeren mesaj.";
    else if ((Caps / Content.length) >= 0.7) content = "Fazla büyük harf içeren mesaj.";
    else {
        const Emojis = Content.match(NativeEmojis) || [];
        const Emojis2 = Content.match(CustomEmojis) || [];
        const Emoji = Emojis.concat(Emojis2);
        if (Emoji.length > 5 && (Emoji.length / ((Content.replace(NativeEmojis, "").replace(CustomEmojis, "").trim()).length + Emoji.length) * 100) > 50) content = "Mesajda fazla emoji bulunuyor.";
    }

    if (content) {
        Warning[message.author.id] = Warning[message.author.id] ? Warning[message.author.id] + 1 : 1;
        setTimeout(() => {
            Warning[message.author.id] = Warning[message.author.id] ? Warning[message.author.id] - 1 : delete Warning[message.author.id];
        }, 1000 * 60 * 3);
        
        message.delete({ timeout: 200 });
        if (Warning[message.author.id] >= 3) return message.channel.send(`${Prefix}mute ${message.author} 5m Uyarılara rağmen mesaj kanalını kirletmek.`);
        message.channel.send(new MessageEmbed().setAuthor(`${message.author.tag} uyarıldı!`, message.author.avatarURL({ dynamic: true })).setDescription(`**Sebep:** ${content}`));
    }
}

Audit.login(AuditBotToken).then(() => console.log(`[AUDIT] ${Audit.user.username} is connected!`)).catch(() => console.error("[AUDIT] Bot is not connect!"));
