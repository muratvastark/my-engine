const { MessageEmbed } = require("discord.js");

exports.run = async (Moderation, message, args) => {  
	if (!message.member.hasPermission("MANAGE_MESSAGES")) return;

    const Num = parseInt(args[0]);
    if(!args[0] || Num < 1 || Num > 100) return message.channel.send("1 ve 100 arası bir sayı girin.");
    message.delete().catch(() => undefined);
    message.channel.bulkDelete(Num).then((messages) => message.channel.send(new MessageEmbed().setColor("RANDOM").setDescription(`Başarıyla **${messages.size}** adet mesaj silindi!`)));
};

exports.conf = {
    commands: ["temizle", "sil", "clear", "purge"],
    enabled: true,
    usage: "temizle 1-100"
};