const { Collection, Client, MessageEmbed } = require("discord.js");
const Invite = new Client();
const Invites = new Collection();
const VActivity = new Collection();
const Suggestion = new Set();
const { ServerID } = require("../global.json").Defaults;
const Settings = require("../global.json").Invite;
const { VoiceLog, Status, UnregisterRoles, Tag, BannedTagsRole, BannedTags, MinStaffRole, DatabaseName, SuggestionLog } = require("../global.json").Defaults;
const { ChatMute, Jail, Suspect, Welcome } = require("../global.json").Permissions;
const { InviteModel, UserModel, StatsModel, PenalModel } = require("./Helpers/models.js");
const { connect } = require("mongoose");
const Moment = require("moment");
Moment.locale("tr");
const Logs = require("discord-logs");
Logs(Invite);

connect("mongodb+srv://muratvastark:airg@123@cluster0.gl8a4.mongodb.net/<dbname>?retryWrites=true&w=majority".replace("<dbname>", DatabaseName), {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false
});

Invite.on("ready", () => {
    Invite.guilds.cache.get(ServerID).fetchInvites().then((_invite) => Invites.set(_invite.first().guild.id, _invite))
    Invite.user.setPresence({ activity: { name: Status, type: "WATCHING" } });

    Invite.guilds.cache.first().channels.cache.filter((e) => e.type == "voice" && e.members.filter((member) => !member.user.bot && !member.voice.selfDeaf).size > 0).forEach((channel) => {
        channel.members.forEach((member) => VActivity.set(member.id, { channel: (channel.parentID || channel.id), momentDuration: Date.now() }));
    });

    setInterval(() => {
        VActivity.each((value, key) => {
            voiceInit(key, value.channel, Date.now() - value.momentDuration);
            VActivity.set(key, { channel: value.channel, momentDuration: Date.now() });
        });
    }, 120000);
});

Invite.on("message", (message) => {
    if (message.channel.type !== "dm" || Suggestion.has(message.author.id)) return;

    const Channel = Invite.channels.cache.get(SuggestionLog);
    if (!Channel) return;

    const Embed = new MessageEmbed().setAuthor(mesage.author.tag, message.author.displayAvatarURL({ dynamic: true })).setDescription(message.content ? message.content.slice(0, 2048) : "Mesaj içeriği yok.");
    if (message.attachments.first() && message.attachments.first().url) Embed.setImage(message.attachments.first().url);
    message.channel.send("Önerin başarıyla iletildi! Bir sonraki önerini **10 dakika** sonra yapabileceksin.");
    Channel.send(Embed)
    Suggestion.add(message.author.id);
    setTimeout(() => { 
        Suggestion.delete(message.author.id); 
    }, 10*60*1000);
})

Invite.on("inviteCreate", (invite) => {
    const GuildInvites = Invites.get(invite.guild.id);
    GuildInvites.set(invite.code, invite);
    Invites.set(invite.guild.id, GuildInvites);
});

Invite.on("inviteDelete", (invite) => {
    const GuildInvites = Invites.get(invite.guild.id);
    GuildInvites.delete(invite.code, invite);
    Invites.set(invite.guild.id, GuildInvites);
});

Invite.on("guildMemberRoleRemove", async (member, role) => {
    const Log = await member.guild.fetchAuditLogs({ limit: 1, type: "MEMBER_ROLE_UPDATE" }).then(audit => audit.entries.first());
    if (!Log || !Log.executor || Log.createdTimestamp < (Date.now() - 5000) || member.guild.roles.cache.get(role.id).position < member.guild.roles.cache.get(MinStaffRole).position) return;
    UserModel.findOneAndUpdate({ Id: member.id }, { $push: { "History.RoleLogs": { Date: Date.now(), Type: "KALDIRMA", Executor: Log.executor.id, Role: role.id } } }, { upsert: true, new: true, setDefaultsOnInsert: true }).exec();
});

Invite.on("guildMemberRoleAdd", async (member, role) => {
    const Log = await member.guild.fetchAuditLogs({ limit: 1, type: "MEMBER_ROLE_UPDATE" }).then(audit => audit.entries.first());
    if (!Log || !Log.executor || Log.createdTimestamp < (Date.now() - 5000) || member.guild.roles.cache.get(role.id).position < member.guild.roles.cache.get(MinStaffRole).position) return;
    UserModel.findOneAndUpdate({ Id: member.id }, { $push: { "History.RoleLogs": { Date: Date.now(), Type: "EKLEME", Executor: Log.executor.id, Role: role.id } } }, { upsert: true, new: true, setDefaultsOnInsert: true }).exec();
});

Invite.on("voiceStateUpdate", (oldState, newState) => {
    
    const LogChannel = Invite.channels.cache.get(VoiceLog);
    if (LogChannel) {
        const User = Invite.users.cache.get(newState.id);
        const Channel = newState.guild.channels.cache.get(newState.channelID).name;
        let content;

        if (!oldState.channelID && newState.channelID) content = `\`${User.tag}\` kullanıcısı \`${Channel}\` adlı sesli kanala **katıldı!**`;
        if (oldState.channelID && !newState.channelID) content = `\`${User.tag}\` üyesi \`${Channel}\` adlı sesli kanaldan **ayrıldı!**`;
        if (oldState.channelID && newState.channelID && oldState.channelID != newState.channelID) content = `\`${User.tag}\` üyesi ses kanalını **değiştirdi!** (\`${newState.guild.channels.cache.get(oldState.channelID).name}\` => \`${Channel}\`)`;
        if (oldState.channelID && oldState.selfMute && !newState.selfMute) content = `\`${User.tag}\` kullanıcısı \`${Channel}\` adlı sesli kanalda kendi susturmasını **kaldırdı!**`;
        if (oldState.channelID && !oldState.selfMute && newState.selfMute) content = `\`${User.tag}\` kullanıcısı \`${Channel}\` adlı sesli kanalda kendini **susturdu!**`;
        if (oldState.channelID && oldState.selfDeaf && !newState.selfDeaf) content = `\`${User.tag}\` kullanıcısı \`${Channel}\` adlı sesli kanalda kendi sağırlaştırmasını **kaldırdı!**`;
        if (oldState.channelID && !oldState.selfDeaf && newState.selfDeaf) content = `\`${User.tag}\` kullanıcısı \`${Channel}\` adlı sesli kanalda kendini **sağırlaştırdı!**`;
        LogChannel.send(content).catch(() => undefined);
    }

    if (oldState.member && (oldState.member.user.bot || newState.selfDeaf)) return;
    if (!oldState.channelID && newState.channelID) return VActivity.set(oldState.id, { channel: newState.guild.channels.cache.get(newState.channelID).parentID || newState.channelID, momentDuration: Date.now() });
    if (!VActivity.has(oldState.id)) return VActivity.set(oldState.id, { channel: newState.guild.channels.cache.get((newState.channelID || oldState.channelID)).parentID || (newState.channelID || oldState.channelID), momentDuration: Date.now() });

    const UserVActivity = VActivity.get(oldState.id);
    const Duration = Date.now() - UserVActivity.momentDuration;
    if (oldState.channelID && !newState.channelID) {
        voiceInit(oldState.id, UserVActivity.channel, Duration);
        return VActivity.delete(oldState.id);
    } else if (oldState.channelID && newState.channelID) {
        voiceInit(oldState.id, UserVActivity.channel, Duration);
        VActivity.set(oldState.id, { channel: newState.guild.channels.cache.get(newState.channelID).parentID || newState.channelID, momentDuration: Date.now() });
    }
});

Invite.on("guildMemberAdd", async (member) => {
    if (member.user.bot) return;

    const Guild = member.guild;
    const Fake = Date.now() - member.user.createdTimestamp < 1000 * 60 * 60 * 24 * Suspect.Days;

    PenalModel.find({ Activity: true, User: member.id }, (err, penals) => {
        if (err) return console.error(err);
        if (penals.some((penal) => penal.Type === "BAN")) return member.ban().catch(console.error);
        if (BannedTags.some((tag) => member.user.username.includes(tag))) return setRoles(member, BannedTagsRole);
        if (penals.some((penal) => penal.Type === "TEMP_JAIL" || penal.Type === "JAIL")) return setRoles(member, Jail.Role);

        const WelcomeChannel = Guild.channels.cache.get(Welcome.Channel);

        if (Fake) {
            const FakeChannel = Guild.channels.cache.get(Suspect.Channel);
            if (FakeChannel) FakeChannel.send(new MessageEmbed().setColor("RED").setDescription(`${member} adlı kullanıcının hesabı **\`${Suspect.Days}\`** günden daha az bir süre içerisinde açıldığı için <@&${Suspect.Role}> rolü verildi.`));
            setRoles(member, Suspect.Role);
        } else {
            const Roles = [...UnregisterRoles];
            if (penals.some((penal) => penal.Type === "CHAT_MUTE")) Roles.push(ChatMute.Role);
            member.setNickname(`${Tag} İsim | Yaş`);
            setRoles(member, Roles);
        }

        if (WelcomeChannel) WelcomeChannel.send([
            `Sunucumuza hoş geldin, ${member}! Hesabın ${Moment(member.user.createdAt).format("Do MMMM YYYY hh:mm")} tarihinde oluşturulmuş. ${Fake ? ":no_entry_sign:" : ""}\n`,
            `Sunucuya erişebilmek için teyit odalarında kayıt olup isim yaş belirtmen gerekmektedir.`,
            `<#778983773932748820> kanalından sunucu kurallarımızı okumayı ihmal etme!\n`,
            `Seninle beraber ${member.guild.memberCount} kişiyiz. :tada::tada::tada:\n`
        ]);
    });


    const GuildInvites = (Invites.get(member.guild.id) || new Collection()).clone();
    const InviteChannel = Guild.channels.cache.get(Settings.Channel);
    let Regular = 0, content;

    Guild.fetchInvites().then(async (_invites) => {
        const InviteCode = _invites.find((_invite) => GuildInvites.has(_invite.code) && GuildInvites.get(_invite.code).uses < _invite.uses) || GuildInvites.find((_invite) => !_invites.has(_invite.code)) || Guild.vanityURLCode;
        Invites.set(Guild.id, _invites);

        if (InviteCode.inviter && InviteCode.inviter.id !== member.id) {
            const InviterData = await InviteModel.findOne({ Id: InviteCode.inviter.id }) || new InviteModel({ Id: InviteCode.inviter.id });

            if (Fake) InviterData.Fake += 1;
            else Regular = InviterData.Regular += 1;
            InviterData.Total += 1;

            InviteModel.findOne({ Id: member.id, Inviter: InviteCode.inviter.id }, (err, res) => {
                if (err) return console.error(err);
                if (res && InviterData.Leave !== 0) InviterData.Leave -= 1;
            });

            InviterData.save();
            InviteModel.findOneAndUpdate({ Id: member.id }, { $set: { Inviter: InviteCode.inviter.id, IsFake: Fake } }, { upsert: true, setDefaultsOnInsert: true }).exec();
        }

        if (InviteChannel) {
            if (InviteCode === Guild.vanityURLCode) content = `${member} sunucuya özel davet linkini kullanarak girdi!`;
            else if (InviteCode.inviter.id === member.id) content = `${member} kendi daveti ile sunucuya giriş yaptı.`;
            else content = `${member} katıldı! **Davet eden**: ${InviteCode.inviter.tag} \`(${Regular} davet)\` ${Fake ? ":x:" : ":white_check_mark:"}`;
            InviteChannel.send(content).catch(() => undefined);
        }
    });
});

Invite.on("guildMemberRemove", async (member) => {
    if (member.user.bot) return;

    if(!UnregisterRoles.some(role => member.roles.cache.has(role))) global.addName(member.id, member.displayName, "Sunucudan Ayrılma");

    const Guild = member.guild;
    const Channel = Guild.channels.cache.get(Settings.Channel);
    const Data = await InviteModel.findOne({ Id: member.id }) || null;

    if ((!Data || Data.Inviter === null) && Channel) return Channel.send(`${member} sunucudan çıktı.`);

    const InviterData = await InviteModel.findOne({ Id: Data.Inviter }) || new InviteModel({ Id: Data.Inviter });
    if (Data.IsFake && Data.Inviter && InviterData.Fake !== 0) InviterData.Fake -= 1;
    else if (Data.Inviter && InviterData.Regular !== 0) InviterData.Regular -= 1;
    if (InviterData.Total !== 0) InviterData.Total -= 1;
    InviterData.Leave += 1;

    const InviteUser = Invite.users.cache.has(Data.Inviter).tag || (await Invite.users.fetch(Data.Inviter)).tag;
    if (Channel) Channel.send(`${member} sunucudan çıktı. **Davet eden**: ${InviteUser} \`(${InviterData.Regular} davet)\``);

    InviterData.save();
});

Invite.login(Settings.Token).then(() => console.log(`[INVITE] ${Invite.user.username} is connected!`)).catch(() => console.error("[INVITE] Bot is not connect!"));

function voiceInit(member, channel, duration) {
    StatsModel.findOne({ Id: member }, (err, data) => {
        if (err) return console.error(err);
        if (!data) {
            let voiceMap = new Map();
            let chatMap = new Map();
            voiceMap.set(channel, duration);
            let newMember = new StatsModel({
                Id: member,
                Voice: voiceMap,
                TotalVoice: Number(duration),
                Message: chatMap,
                TotalMessage: 0
            });
            newMember.save();
        } else {
            let onceki = data.Voice.get(channel) || 0;
            data.Voice.set(channel, Number(onceki)+duration);
            data.TotalVoice = Number(data.TotalVoice)+Number(duration);
            data.save();
        };
    });
}

function setRoles(member, params) {
    if (!member.manageable) return false;
    let roles = member.roles.cache.filter((role) => role.managed).map((role) => role.id).concat(params);
    member.roles.set(roles).catch(console.error);
    return true;
}