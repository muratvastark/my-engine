const { MessageEmbed } = require("discord.js");
const { Tag, TagIntakeMode, TeamRole, MinStaffRole, BoosterRole, ChatChannel } = global.Moderation.Defaults;
const { Register } = global.Moderation.Permissions;

exports.run = async (Moderation, message, args) => {
    if (message.member.check(Register.AuthRoles) === false) return;

    const Member = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
    if (!Member || Member.user.bot || Member.id === message.author.id) return message.channel.send("Geçerli bir üye belirt!");

    if (!Member.manageable || Member.roles.highest.position >= message.guild.roles.cache.get(MinStaffRole).position) return message.channel.send("Yetkili olmayan bir üye belirt!");
    if (message.member.check() === false && TagIntakeMode === true && !Member.user.username.includes(Tag) && !Member._roles.includes(BoosterRole)) return message.channel.send("İsminde tag bulunan birilerini kaydet.");

    Member.setRoles(Register.WomanRoles);
    message.channel.send(new MessageEmbed().setColor("RANDOM").setDescription(`${Member.toString()} kişisi başarıyla \`kadın\` olarak kaydedildi.`));
    if (Member.user.username.includes(Tag)) Member.roles.add(TeamRole).catch(console.error);
    const Channel = Moderation.channels.cache.get(ChatChannel);
    if (Channel) Channel.send(`${Member} aramıza katıldı.`);
    global.updateUser(message.author.id, "Woman", 1);
    global.addName(Member.id, Member.displayName, `<@&${Register.WomanRoles[0]}>`);
};

exports.conf = {
    commands: ["k", "kız", "kadın", "bayan"],
    enabled: true,
    usage: "k [Üye]"
};
