const { MessageEmbed } = require("discord.js");
const Penal = require("../../Helpers/penal.js");
const { Ban } = global.Moderation.Permissions;
const banLimit = {};

exports.run = async (Moderation, message, args) => {
    if (message.member.check(Ban.AuthRoles) === false) return;

    const Member = message.mentions.members.first() || message.guild.members.cache.get(args[0]) || (await Moderation.getUser(args[0]));
    if (!Member) return message.channel.send("Banlamak için bir üye belirt!");
    if (Member.roles && message.author.id !== message.guild.ownerID && Member.roles.highest.position >= message.member.roles.highest.position) return message.channel.send("Kişi senden yüksek bir pozisyona sahip, onu banlayamazsın!");
    if (Member.roles && !Member.manageable) return message.channel.send("Etiketlediğin kişi benden yüksek bir role sahip, üzgünüm.");
    if (Member.id && Member.id === message.author.id) return message.channel.send("Kendini banlamayı neden deniyorsun ki?");

    const Reason = args.slice(1).join(" ") || "Sebep Belirtilmedi.";
    if (message.guild.ownerID !== message.author.id && Penal.limit(message.author.id, banLimit, Ban.Limit) === false) return message.channel.send(" `Ban` limitine ulaştınınız.");

    if (message.guild.members.cache.get(Member.id)) message.guild.members.ban(Member.id, { reason: Reason }).catch(console.error);
    const NewPenal = await Penal.addPenal(Member.id, message.author.id, "BAN", Reason, false, Date.now());
    const Embed = new MessageEmbed().setAuthor(message.author.tag, message.author.avatarURL({ dynamic: true }));

    message.channel.send(Embed.setColor("RANDOM").setDescription(`${Member} başarıyla sunucudan yasaklandı! (\`#${NewPenal.Id}\`)`).setImage(Ban.Image));

    const Channel = message.guild.channels.cache.get(Ban.Channel);
    if (Channel) Channel.send(Embed.setDescription(`${Member} (\`${Member.id}\`) adlı kullanıcı ${message.author} tarafından sunucudan yasaklandı. Sebep: \`${Reason}\``).setColor("RED"));
}

exports.conf = { 
    commands: ["ban","yasakla","banla","yargı","thor","hammer","siktirgitamkçocu","siktirgeç","siktir","defol","olumbakgit","vayoç", "maymun"],
    enabled: true,
    usage: "ban [Üye] [Sebep]"
};