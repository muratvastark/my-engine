const { MessageEmbed } = require("discord.js")

exports.run = async (Moderation, message, args) => {
    if (!message.member.voice.channelID) return message.channel.send("Komutu kullanmak için önce bir ses kanalına katılman gerekiyor.")
    const Member = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
    if (!Member || !Member.voice.channelID || Member.id === message.author.id) return message.channel.send("Seste bulunan geçerli birini etiketlemelisin.");
    if (Member.voice.channelID === message.member.voice.channelID) return message.channel.send("Zaten aynı kanaldasınız.");

    if (message.member.check(Moderation.Permissions.TransportAuthRoles) === true) {
        if (message.member.voice.channelID && Member.voice.channelID) Member.voice.setChannel(message.member.voice.channel);
        message.channel.send(new MessageEmbed().setColor("RANDOM").setAuthor(message.author.tag, message.author.avatarURL({ dynamic: true })).setDescription(`Başarıyla ${Member} adlı üye kanalınıza taşındı.`))
    } else {
        const NewMessage = await message.channel.send(Member, new MessageEmbed().setColor("RANDOM").setDescription(`${Member}, ${message.author} adlı üye seni \`${message.member.voice.channel.name}\` kanalına çekmek istiyor. Kabul ediyor musun?`));
        await NewMessage.react("✅");
        const Collector = await NewMessage.createReactionCollector((reaction, user) => reaction.emoji.name === "✅" && user.id === Member.id, { max: 1, time: 60000 });

        Collector.on("collect", () => {
            NewMessage.delete({ timeout: 200 });
            message.reply(`${Member} başarıyla kanalınıza taşındı!`);
            if (message.member.voice.channelID && Member.voice.channelID) Member.voice.setChannel(message.member.voice.channel);
            Collector.stop();
        });

        Collector.on("end", () => Collector.stop());
    }
};

exports.conf = {
    commands: ["çek", "gel", "pull"],
    enabled: true,
    usage: "çek [Üye]"
};