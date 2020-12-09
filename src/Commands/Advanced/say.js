const { MessageEmbed } = require("discord.js");
exports.run = async (Moderation, message) => {
    if (message.member.check() === false) return;
    const Guild = message.guild;
    message.channel.send(new MessageEmbed().setColor("RANDOM").setDescription(`\`>\` Şu anda toplam **${Guild.members.cache.filter((member) => member.voice.channelID).size}** kişi seslide.\n\`>\` Sunucuda **${Guild.memberCount}** adet üye var.\n\`>\` Toplamda **${Guild.members.cache.filter((m) => m.user.username && m.user.username.includes(Moderation.Defaults.Tag)).size}** kişi tagımızı alarak bizi desteklemiş.\n\`>\` Sunucuda **${Guild.premiumSubscriptionCount}** adet takviye var.`))
}

exports.conf = {
    commands: ["say"],
    enabled: true,
    usage: "say"
};