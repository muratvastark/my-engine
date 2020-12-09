const { MessageEmbed } = require("discord.js");

exports.run = async (Moderation, message, args) => {
    if (!message.member.voice.channelID) return message.channel.send("Komutu kullanmak için önce bir ses kanalına katılman gerekiyor.");
    const Member = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
    if (!Member || !Member.voice.channelID || Member.id === message.author.id) return message.channel.send("Seste bulunan geçerli birini etiketlemelisin.");
    if (Member.voice.channelID == message.member.voice.channelID) return message.channel.send("Zaten aynı kanaldasınız.");

    if (message.member.check(Moderation.Permissions.TransportAuthRoles) === true) {
        if (Member.voice.channelID && message.member.voice.channelID) message.member.voice.setChannel(Member.voice.channel)
        message.channel.send(new MessageEmbed().setColor("RANDOM").setAuthor(message.author.tag, message.author.avatarURL({ dynamic: true })).setDescription(`Başarıyla ${Member} adlı üyenin kanalına taşındınız.`));
    } else {
        const NewMessage = await message.channel.send(Member, new MessageEmbed().setColor("RANDOM").setDescription(`${Member}, ${message.author} adlı üye seni \`${message.member.voice.channel.name}\` yanına gelmek istiyor. Kabul ediyor musun?`));
        await NewMessage.react("✅");
        const Collector = await NewMessage.createReactionCollector((reaction, user) => reaction.emoji.name === "✅" && user.id === Member.id, { max: 1, time: 60000 });

        Collector.on("collect", () => {
            NewMessage.delete({ timeout: 200 });
            message.channel.send(`${Member}, ${message.author} başarıyla kanalınıza taşındı!`);
            if (Member.voice.channelID && message.member.voice.channelID) message.member.voice.setChannel(Member.voice.channel);
            Collector.stop();
        });

        Collector.on("end", () => Collector.stop());
    }
};

exports.conf = {
    commands: ["git", "go"],
    enabled: true,
    usage: "git [Üye]"
};
