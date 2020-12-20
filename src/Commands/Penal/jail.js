const { MessageEmbed } = require("discord.js");
const { Jail } = global.Moderation.Permissions;
const Penal = require("../../Helpers/penal.js")
const jailLimit = {};

exports.run = async (Moderation, message, args) => {
    if (message.member.check(Jail.AuthRoles) === false) return;

    const Member = message.mentions.members.first() || message.guild.member(args[0]) || (await Moderation.getUser(args[0]));
    if (!Member) return message.channel.send("Cezalandırmak için bir üye belirt!")
    if (Member.roles && message.author.id !== message.guild.ownerID && Member.roles.highest.position >= message.member.roles.highest.position) return message.channel.send("Kişi senden yüksek bir pozisyona sahip, onu susturamazsın!")
    if (Member.roles && !Member.manageable) return message.channel.send("Etiketlediğin kişi benden yüksek bir role sahip, üzgünüm.")
    if (Member.id && Member.id === message.author.id) return message.channel.send("Kendini cezalandırmayı neden deniyorsun ki?")
    if (message.guild.ownerID !== message.author.id && Penal.limit(message.author.id, jailLimit, Jail.Limit) === false) return message.channel.send(" `Jail` limitine ulaştınınız.")
    const Reason = args.slice(2).join(" ") || "Sebep Belirtilmedi.";
    if (!Reason) return message.channel.send("Geçerli bir sebep belirt.");

    if (Member.roles) Member.setRoles(Jail.Role);

    const DateNow = Date.now();
    const NewPenal = await Penal.addPenal(Member.id, message.author.id, "JAIL", Reason, false, DateNow, undefined, Member.roles ? Member.roles.cache.map((x) => x.id) : null)
    const Embed = new MessageEmbed().setAuthor(message.author.tag, message.author.avatarURL({ dynamic: true }));

    message.channel.send(Embed.setColor("RANDOM").setDescription(`${Member} (\`${Member.id}\`) üyesi cezalıya atıldı. (\`#${NewPenal.Id}\`)`));

    const Channel = message.guild.channels.cache.get(Jail.Channel);
    if (Channel) Channel.send(Embed.setDescription(`${Member} (\`${Member.id}\`) üyesi ${message.author} tarafından cezalıya atıldı. Sebep: \`${Reason}\``).setColor("RED"));
};

exports.conf = {
    commands: ["jail", "hapis", "cezalandır", "cezalandir"],
    enabled: true,
    usage: "jail [Üye] [Sebep]"
};
