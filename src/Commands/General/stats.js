const { MessageEmbed, MessageAttachment } = require("discord.js");
const { StatsModel, LevelModel, InviteModel } = require("../../Helpers/models.js");
const moment = require("moment");
require("moment-duration-format");
const { Rank } = require("canvacord");

exports.run = async (Moderation, message, args) => {
    if (message.member.roles.highest.positon < message.guild.roles.cache.get(Moderation.Defaults.MinStaffRole).position) return;

    const User = message.mentions.users.first() || Moderation.users.cache.get(args[0]) || message.author;
    const Data = await StatsModel.findOne({ Id: User.id }) || null;
    if (!Data) return message.channel.send("Maalesef veri bulunamadı.");
    const Embed = new MessageEmbed().setAuthor(User.tag, User.avatarURL({ dynamic: true })).setColor("RANDOM");
    const LevelData = await LevelModel.findOne({ Id: User.id }).exec();
    if (LevelData) {
        const UserRank = (await LevelModel.find({}).sort({ Level: -1, CurrentXP: -1 }).exec()).findIndex(data => data.Id === User.id)+1;
        const card = new Rank()
            .setUsername(User.username)
            .setDiscriminator(User.discriminator)
            .setRank(UserRank)
            .setLevel(LevelData.Level)
            .setCurrentXP(LevelData.CurrentXP)
            .setRequiredXP(LevelData.RequiredXP)
            .setStatus(User.presence.status)
            .setAvatar(User.displayAvatarURL({ format: "png", size: 1024 }));
        const img = new MessageAttachment(await card.build(), "rank.png");
        Embed.attachFiles(img).setImage('attachment://rank.png');
    }

    let VoiceTotal = 0, VoiceList = '', MessageTotal = 0, MessageList = '';

    Data.Message.forEach((value, key) => {
        MessageTotal += value;
        return MessageList += `\`•\` ${Moderation.channels.cache.has(key) ? Moderation.channels.cache.get(key).toString() : "#silinmiş-kanal"}: \`${value} mesaj\`\n`;
    });

    Data.Voice.forEach((value, key) => {
        VoiceTotal += value;
        return VoiceList +=  `\`•\` ${Moderation.channels.cache.has(key) ? Moderation.channels.cache.get(key).name : "#silinmiş-kanal"}: \`${moment.duration(value).format("H [saat, ] m [dk.]")}\`\n`;
    });

    const InviteData = await InviteModel.findOne({ Id: User.id }) || { Regular: 0, Total: 0, Fake: 0, Leave: 0 };

    Embed.setDescription(`${User} adlı kullanıcının **${message.guild.name}** adlı sunucudaki mesaj ve ses istatistikleri;`)
        .addField("Genel İstatistikleri", `\`-\` **Toplam Ses:** ${VoiceList.length > 0 ? moment.duration(Data.TotalVoice).format("\`H [saat, ] m [dk.]\`") : "Bulunamadı."}\n \`-\` **Toplam Mesaj:** \`${MessageList.length > 0 ? `${Data.TotalMessage} mesaj` : "Bulunamadı."}\``)
        .addField("Haftalık Ses İstatistikleri", VoiceList.length > 0 ? `\`>\` **Toplam:**  \`${moment.duration(VoiceTotal).format("H [saat, ] m [dk.]")}\`\n${VoiceList}` : "Bulunamadı.")
        .addField("Haftalık Mesaj İstatistikleri", MessageList.length > 0 ?  `\`>\` **Toplam:**  \`${MessageTotal} mesaj\`\n${MessageList}` : "Bulunamadı.")
        .addField("Davet İstatistikleri", `\`${InviteData.Total}\` toplam (\`${InviteData.Regular}\` gerçek, \`${InviteData.Fake}\` sahte, \`${InviteData.Leave}\` çıkan)`);

    message.channel.send(Embed);
};

exports.conf = {
    commands: ["stats", "stat"],
    enabled: true,
    usage: "stats [Üye]"
};
