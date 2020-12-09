const { MessageEmbed } = require("discord.js");

exports.run = async (Moderation, message, args) => {
    if (message.member.check() === false) return;
    if (args[0] === "global") {
        if (message.guild.ownerID !== message.author.id) return;
        const Flag = args.some(arg => arg.toLowerCase() === "aç") ? false : (args.some(arg => arg.toLowerCase() === "kapat") ? true : null);
        if (Flag === null) return message.reply("geçerli bir argüman gir. (`kapat` veya `aç`)");
        const Channels = message.guild.channels.cache.filter((channel) => channel.type !== "category" && channel.type !== "voice" && !["log", "kural", "rule", "duyuru", "announcement"].includes(channel.name));
        Channels.forEach((channel) => channel.updateOverwrite(message.guild.id, {
            SEND_MESSAGES: Flag
        }));
        message.channel.send(new MessageEmbed().setColor("RANDOM").setDescription("Metin kanallarının hepsi" + (Flag === true ? "nin kilidi açıldı." : " kilitlendi.")));
        return;
    }
    const everyone = message.guild.roles.cache.find((a) => a.name === "@everyone");
    if (message.channel.permissionsFor(everyone).has("SEND_MESSAGES")) {
        message.channel.updateOverwrite(everyone.id, {
            SEND_MESSAGES: false
        });
        message.channel.send(new MessageEmbed().setColor("RANDOM").setDescription("Başarılı bir şekilde `kanal` kilitlendi!"));   
    } else {
        message.channel.updateOverwrite(everyone.id, {
            SEND_MESSAGES: true
        });
        message.channel.send(new MessageEmbed().setColor("RANDOM").setDescription("Başarılı bir şekilde `kanal` kilidi açıldı!"));
    }
};

exports.conf = {
    commands: ["kilit", "lock", "kilitle"],
    enabled: true,
    usage: "kilit"
};