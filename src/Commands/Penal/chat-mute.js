const { MessageEmbed } = require("discord.js");
const { ChatMute } = global.Moderation.Permissions
const Penal = require("../../Helpers/penal.js");

exports.run = async (Moderation, message, args) => {
    if (message.member.check(ChatMute.AuthRoles) === false) return

    const Member = message.mentions.members.first() || message.guild.member(args[0]) || (await Moderation.getUser(args[0]));

    if (!Member) return message.channel.send("Susturmak için bir üye belirt!");
    if (Member.roles && message.author.id !== message.guild.ownerID && Member.roles.highest.position >= message.member.roles.highest.position) return message.channel.send("Kişi senden yüksek bir pozisyona sahip, onu susturamazsın!");
    if (Member.roles && !Member.manageable) return message.channel.send("Etiketlediğin kişi benden yüksek bir role sahip, üzgünüm.");
    if (Member.id && Member.id === message.author.id) return message.channel.send("Kendini susturmayı neden deniyorsun ki?");

    const Time = args[1] ? require("ms")(args[1]) : undefined;
    if (!Time) return message.channel.send("Geçerli bir süre belirtin.");
    const Reason = args.slice(2).join(" ");
    if (!Reason) return message.channel.send("Geçerli bir sebep belirtin.");

    if (Member.roles && !Member.roles.cache.has(ChatMute.Role)) Member.roles.add(ChatMute.Role).catch(console.error);

    const DateNow = Date.now(), FinishDate = DateNow + Time;
    const NewPenal = await Penal.addPenal(Member.id, message.author.id, "CHAT_MUTE", Reason, true, DateNow, FinishDate);
    const Embed = new MessageEmbed().setAuthor(message.author.tag, message.author.avatarURL({ dynamic: true }));
    const TimeString = Moderation.timeTR(Time);

    message.channel.send(Embed.setColor("RANDOM").setDescription(`${Member} ${TimeString} boyunca metin kanallarında susturuldu. (\`#${NewPenal.Id}\`)`));
    const Channel = message.guild.channels.cache.get(ChatMute.Channel);
    if (Channel) Channel.send(Embed.setDescription(`${Member} (\`${Member.id}\`) üyesi ${TimeString} süreliğine metin kanallarında susturuldu.\n\n\`•\` **Chat Mute Atılma:** ${new Date(DateNow).toTurkishFormatDate()}\n\`•\` **Chat Mute Bitiş:** ${new Date(FinishDate).toTurkishFormatDate()}\n\`•\` **Chat Mute Sebebi:** ${Reason}`).setColor("RED"));
};

exports.conf = {
    commands: ["chatmute", "mute", "chat-mute", "cmute"],
    enabled: true,
    usage: "mute [Üye] [Sebep]"
};