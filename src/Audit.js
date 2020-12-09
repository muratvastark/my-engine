const { patch } = require("axios");
const { Client, MessageEmbed } = require("discord.js");
const Audit = new Client({ fetchAllMembers: true });
const Mongoose = require("mongoose");
const { ServerID, UnregisterRoles, BannedTags, Status, DatabaseName, BannedTagsRole, Tag, SecondTag, TeamRole, TagReception, AuditBotToken, BoosterRole, Prefix, VIP } = require("../global.json").Defaults;
const CooldownXP = new Set();

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
    if (!Log || Log && (Log.executor.id === oldGuild.ownerID || Log.executor.id === Audit.user.id || Date.now() - Log.createdTimestamp > 5000)) return;
    patch(`https://discord.com/api/v8/guilds/${oldGuild.id}/vanity-url`, { code: `${require("../global.json").Defaults.InviteCode}` }, { headers: { Authorization: `Bot ${Audit.token}` } });
});

Audit.on("message", async(message) => {
    if (!message.guild || message.author.bot) return;

    if (!message.content.startsWith(Prefix) && !CooldownXP.has(message.author.id)) {
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

Audit.login(AuditBotToken).then(() => console.log(`[AUDIT] ${Audit.user.username} is connected!`)).catch(() => console.error("[AUDIT] Bot is not connect!"));