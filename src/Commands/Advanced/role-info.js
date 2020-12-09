exports.run = async (Moderation, message, args) => {
    if (message.member.check() === false) return
    const Role = message.mentions.roles.first() || message.guild.roles.cache.get(args[0]);
    if (!args[0] || !Role || Role.id === message.guild.id) return message.channel.send("Geçerli bir rol belirt!");
    message.channel.send([
        `**${Role.name}** - ${Role.members.size < 1 ? "Bu rolde hiç üye yok!" : Role.members.size} üye\n`,
        `${Role.members.array().map((member) => `${member} (\`${member.id}\`)`).join("\n")}`
    ], { split: true });
};

exports.conf = {
    commands: ["üyeler", "uyeler"],
    enabled: true,
    usage: "üyeler [Rol]"
};