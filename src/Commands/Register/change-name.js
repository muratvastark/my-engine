const { BoosterRole, SecondTag, Tag } = global.Moderation.Defaults;
const { Register } = global.Moderation.Permissions;
const { MessageEmbed } = require("discord.js");
const { UserModel }= require("../../Helpers/models.js");

exports.run = async (Moderation, message, args) => {
    if (message.member.roles.cache.has(BoosterRole) && (message.mentions.users.size <= 0 || args[0] && !message.guild.members.cache.get(args[0])) {
        if (!args || !args.length) return message.reply("sunucudaki ismini mi değiştireceksin? Değiştireceksen bir isim girmelisin.");
        const Name = `${Member.user.username.includes(Tag) ? Tag : SecondTag} ${args.join(" ")}`;
        if (Name.length > 30) return message.reply("ismin 30 karakterden büyük olamaz.");
        message.member.setNickname(Name);
        message.reply(`holey be! artık ismin **${Name}** :tada:`);
        return;
    }

    if (message.member.check(Register.AuthRoles) === false) return;
    const Member = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
    if (!Member || Member.user.bot || Member.id === message.author.id) return message.channel.send("Geçerli bir üye belirt!");
    if (!Member.manageable || Member.roles.highest.position >= message.member.roles.highest.position) return message.channel.send("Yetkili olmayan bir üye belirt!")

    args = args.filter(a => a !== "" && a !== " ").splice(1);
    const Name = args.filter(arg => isNaN(arg)).map(arg => arg.charAt(0).replace('i', "İ").toUpperCase()+arg.slice(1)).join(" ");
    const Age = args.filter(arg => !isNaN(arg))[0] || undefined;
    if (!Name || !Age) return message.channel.send("Geçerli isim ve yaş belirt!");

    const NewName = `${Member.user.username.includes(Tag) ? Tag : SecondTag} ${Name} | ${Age}`;
    if (NewName.length > 30) return message.channel.send("Kullanıcının adı değiştirilemedi. İsim 30 karakteri geçemez.");
    Member.setNickname(NewName);

    const HistoryData = (await UserModel.findOne({ Id: Member.id }).exec()) || { History: { Names: [] } }
    if (HistoryData.History.Names) HistoryData.History.Names.reverse();
    message.channel.send(new MessageEmbed().setColor("RANDOM").setDescription(HistoryData.History.Names.length > 0 ? [
        `Bu Kullanıcının Sunucudaki Eski İsimleri [ **${HistoryData.History.Names.length}** ]\n`,
        `${HistoryData.History.Names.map((data) => `\`▫️ ${data.Name}\` (${data.Reason})`).join("\n")}`] : `${Member.toString()} kişisinin ismi "**${NewName.slice(2)}**" olarak değiştirildi.`
    ));
};

exports.conf = {
    commands: ["isim", "name", "nick"],
    enabled: true,
    usage: "isim ([Nick](Booster) | [Üye] [İsim] [Yaş])"
};
