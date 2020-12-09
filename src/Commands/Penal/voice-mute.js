const { MessageEmbed } = require("discord.js");
const { VoiceMute } = global.Moderation.Permissions;
const Penal = require("../../Helpers/penal.js");

exports.run = async (Moderation, message, args) => {
    if (message.member.check(VoiceMute.AuthRoles) === false) return

    const Member = message.mentions.members.first() || message.guild.member(args[0]) || (await Moderation.getUser(args[0]));
    if (!Member) return message.channel.send("Susturmak için bir üye belirt!");
    if (Member.roles && message.author.id !== message.guild.ownerID && Member.roles.highest.position >= message.member.roles.highest.position) return message.channel.send("Kişi senden yüksek bir pozisyona sahip, onu susturamazsın!");
    if (Member.roles && !Member.manageable) return message.channel.send("Etiketlediğin kişi benden yüksek bir role sahip, üzgünüm.");
    if (Member.id && Member.id === message.author.id) return message.channel.send("Kendini susturmayı neden deniyorsun ki?");

    const Time = args[1] ? require("ms")(args[1]) : undefined;
    if (!Time) return message.channel.send("Geçerli bir süre belirtin.");
    const Reason = args.slice(2).join(" ");
    if (!Reason) return message.channel.send("Geçerli bir sebep belirtin.");

    if (Member.voice.channelID) Member.voice.setMute(true);

    const DateNow = Date.now(), FinishDate = DateNow + Time;
    const NewPenal = await Penal.addPenal(Member.id, message.author.id, "VOICE_MUTE", Reason, true, DateNow, FinishDate);
    const Embed = new MessageEmbed().setAuthor(message.author.tag, message.author.avatarURL({ dynamic: true }));

    message.channel.send(Embed.setColor("RANDOM").setDescription(`${Member} ${Moderation.timeTR(Time)} boyunca ses kanallarında susturuldu. (\`#${NewPenal.Id}\`)`));

    const Channel = message.guild.channels.cache.get(VoiceMute.Channel);
    if (Channel) Channel.send(Embed.setDescription(`${Member} (\`${Member.id}\`) üyesi ses kanallarında susturuldu.\n\n\`•\` **Mute Atılma:** ${new Date(DateNow).toTurkishFormatDate()}\n\`•\` **Mute Bitiş:** ${new Date(FinishDate).toTurkishFormatDate()}\n\`•\` **Mute Sebebi:** ${Reason}`).setColor("RED"));
};

exports.conf = {
    commands: ["voicemute", "sesmute", "vm", "vmute", "smute"],
    enabled: true,
    usage: "voicemute [Üye] [Sebep]"
};