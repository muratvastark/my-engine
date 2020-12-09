const { MessageEmbed } = require("discord.js");
const moment = require("moment");
require("moment-duration-format");
require("moment-timezone");

exports.run = async (Moderation, message, args) => {
    const User = message.mentions.users.first() || Moderation.users.cache.get(args[0]) || (args[0] && args[0].length > 5 ? await Moderation.getUser(args[0]) : message.author) || message.author;

    const Embed = new MessageEmbed().setColor("BLACK").setAuthor(User.tag, User.avatarURL({ dynamic: true })).setThumbnail(User.avatarURL({ dynamic: true }));
    const Status = {
        idle: "Boşta",
        dnd: "Rahatsız Etmeyin",
        offline: "Çevrimdışı",
        online: "Çevrimiçi"
    };

    const Member = message.guild.members.cache.get(User.id);
    Embed.addField("**Kullanıcı Bilgisi**", [ 
        `ID: ${User.id}`,
        `Profil: <@${User.id}>`,
        `Durum: ${Status[User.presence.status]}`,
        `Oluşturulma: ${moment(User.createdAt).tz("Europe/Istanbul").format("Do MMMM YYYY hh:mm")}`,
        `(${Moderation.timeTR(Date.now() - User.createdTimestamp)})`
    ]);
    if (Member) {
        Embed.addField(
            "**Üyelik Bilgisi**", [
            `Sunucu takma adı: ${Member.displayName !== User.username ? Member.displayName : "Yok."}`,
            `Oluşturulma: ${moment(Member.joinedTimestamp).tz("Europe/Istanbul").format("Do MMMM YYYY hh:mm")}`,
            `(${Moderation.timeTR(Date.now() - Member.joinedTimestamp)})`,
            `\nBazı Rolleri: ${Member.roles.cache.filter((role) => role.id !== message.guild.id).map(role => role.toString()).join(" ")}`
            ]
        );
        if (Member.premiumSinceTimestamp) Embed.addField("**Booster**", `${moment(Member.premiumSinceTimestamp).tz("Europe/Istanbul").format("Do MMMM YYYY hh:mm")} tarihinden beri bu sunucuyu yükseltiyor! (${Moderation.timeTR(Number(Date.now() - Member.premiumSinceTimestamp))})`);
    }

    message.channel.send(Embed);
};
exports.conf = {
    commands: ["istatistik", "i"],
    enabled: true,
    usage: "istatistik [Kullanıcı]"
};