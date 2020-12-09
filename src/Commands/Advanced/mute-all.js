const { MessageEmbed } = require("discord.js");

exports.run = async (Moderation, message, [ options ]) => {
    if (message.member.check() === false) return;
    if (!message.member.voice.channelID) return message.channel.send("Lütfen bir ses kanalına katıl!");
    if (!options || !["aç", "kapat"].some((option) => option === options)) return message.channel.send("Geçerli bir argüman girmelisin! (`aç` veya `kapat`)");
    if (options === "aç") {
        message.member.voice.channel.members.filter(member => member.id !== message.member.id && !member.voice.serverMute).forEach((member) => member.voice.setMute(true));
        message.channel.send(new MessageEmbed().setColor("RANDOM").setDescription(`\`${message.member.voice.channel.name}\` adlı kanaldaki komutu kullanan dışındaki herkes **susturuldu.**`));
    } else if (options === "kapat") {
        message.member.voice.channel.members.filter((member) => member.voice.serverMute).forEach((member) => member.voice.setMute(false));
        message.channel.send(new MessageEmbed().setColor("RANDOM").setDescription(`\`${message.member.voice.channel.name}\` adlı kanaldaki susturması olan herkesin **susturulması kaldırıldı.**`));
    }
};

exports.conf = {
    commands: ["herkesisustur", "muteall", "mute-all"],
    enabled: true,
    usage: "herkesisustur"
};