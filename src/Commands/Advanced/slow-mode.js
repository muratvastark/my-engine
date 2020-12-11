const { MessageEmbed } = require("discord.js");

exports.run = async (Moderation, message, [ option ]) => {
    if (message.member.check() === false) return;
    if (!option || !Number(option) || option < 0) return message.channel.send("Geçerli bir saniye belirt. (Yavaş modu kaldırmak için 0 yazabilirsin.)");
    message.channel.setRateLimitPerUser(option, `${message.author.tag} tarafından istendi.`);
    message.channel.send(new MessageEmbed().setColor("RANDOM").setDescription(`Başarıyla yavaş mod ${option === 0 ? "**kaldırıldı.**" : `**${option} saniye** olarak ayarlandı.`}`));
};

exports.conf = {
    commands: ["slow-mode", "yavaş-mod", "yavaşmod", "slowmode"],
    enabled: true,
    usage: "slow-mode [Sayı]"
};
