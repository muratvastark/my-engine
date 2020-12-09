exports.run = async (Moderation, message, args) => {
    if (message.member.check() === false) return;
    console.log("s")
    const Role = message.mentions.roles.first() || message.guild.roles.cache.get(args[0]);
    let Members = message.guild.members.cache.filter((member) => !Moderation.Defaults.Developers.includes(member.id) && !member.user.bot && member.presence.status != "offline" && !member.voice.channelID);
    if (Role && Role.id !== message.guild.id) Members = Members.filter((member) => member.roles.cache.has(Role.id));
    else Members = Members.filter((member) => member.roles.highest.position >= message.guild.roles.cache.get(Moderation.Defaults.MinStaffRole).position);
    Members = Members.map((x) => x.toString()).join(", ");
    message.channel.send(Members.length > 1 ? Members : "Mükkemmel! Seste olmayan yetkili yok.", { split: { char: ", " } });
};

exports.conf = {
    commands: ["yetkilisay", "yetkili-say", "staff-say"],
    enabled: true,
    usage: "yetkilisay [Rol]"
};