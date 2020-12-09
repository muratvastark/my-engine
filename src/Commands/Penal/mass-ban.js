const { MessageEmbed } = require("discord.js");
const Penal = require("../../Helpers/penal.js");
const { Ban } = global.Moderation.Permissions;

exports.run = async (Moderation, message, args) => {
    if (message.member.check(Ban.MassBanAuthRoles) === false) return;

    if (!args || !args.length || args.length < 1) return message.channel.send("Yasaklamak için bir takım üye belirt!");

    const Bans = [];

    args.forEach(async (arg) => {
        if (arg.startsWith("<@") && arg.endsWith(">")) {
            arg = arg.slice(2, -1);
            if (arg.startsWith("!")) arg = arg.slice(1);
        }
        const Member = message.guild.members.cache.get(arg) || (await Moderation.getUser(arg));
        if (Member && (!Bans.includes(Member.id) && Member.roles && Member.roles.highest.position < message.member.roles.highest.position && Member.manageable) && Member.id && Member.id !== message.author.id ) {
            await Penal.addPenal(Member.id, message.author.id, "BAN", "Toplu Ban", false, Date.now());
            if (message.guild.members.cache.get(Member.id)) Member.ban({ reason: "Toplu Ban" }).catch(console.error);
            Bans.push(Member.id);
        }
    });

    const Embed = new MessageEmbed().setAuthor(message.author.tag, message.author.avatarURL({ dynamic: true }));
    message.channel.send(Embed.setColor("RANDOM").setDescription(`${Bans.map((id) => `<@${id}> (\`${id}\`)`).join(", ")} adlı  kullanıcılar başarıyla sunucudan yasaklandı!`).setImage(Ban.GIF > 0 ? Ban.GIF : null));

    const Channel = message.guild.channels.cache.get(Ban.Channel);
    if (Channel) Channel.send(Embed.setDescription(`${message.author} tarafından ${Bans.map((id) => `<@${id}> (\`${id}\`)`).join(", ")} adlı kullanıcılar sunucudan yasaklandı.`).setColor("RED"));
};

exports.conf = {
    commands: ["topluban", "massban", "mass-ban"],
    enabled: true,
    usage: "topluban [Üyeler]"
};