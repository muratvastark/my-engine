const { MessageEmbed } = require("discord.js");
const { Tag, SecondTag, TagIntakeMode, TeamRole, MinStaffRole, BoosterRole, ChatChannel, VIP } = global.Moderation.Defaults;
const { UserModel }= require("../../Helpers/models.js");
const { Register } = global.Moderation.Permissions;

exports.run = async (Moderation, message, args) => {
    if (message.member.check(Register.AuthRoles) === false) return;

    const Member = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
    if (!Member || Member.user.bot || Member.id === message.author.id) return message.channel.send("Geçerli bir üye belirt!");

    if (!Member.manageable || Member.roles.highest.position >= message.guild.roles.cache.get(MinStaffRole).position) return message.channel.send("Yetkili olmayan bir üye belirt!");
    if (message.member.check() === false && TagIntakeMode === true && !Member.user.username.includes(Tag) && !Member._roles.includes(BoosterRole)) return message.channel.send("İsminde tag bulunan birilerini kaydet.");

    args = args.filter(a => a !== "" && a !== " ").splice(1);
    const Name = args.filter(arg => isNaN(arg)).map(arg => arg.charAt(0).replace('i', "İ").toUpperCase()+arg.slice(1)).join(" ");
    const Age = args.filter(arg => !isNaN(arg))[0] || undefined;

    if (!Name || !Age) return message.channel.send("Geçerli isim ve yaş girmelisin!");
    let isim = `${Member.user.username.includes(Tag) ? Tag : SecondTag} ${Name} | ${Age}`;
    if (isim.length > 30) return message.channel.send("İsim ve yaş ile birlikte toplam 30 karakteri geçecek bir isim giremezsin.");
    const Embed = new MessageEmbed().setColor("RANDOM");
    Member.setNickname(isim).catch(console.error);

    const HistoryData = (await UserModel.findOne({ Id: Member.id }).exec()) || { History: { Names: [] } }
    if (HistoryData.History.Names) HistoryData.History.Names.reverse();

    const NewMessage = await message.channel.send(Embed.setDescription(HistoryData.History.Names.length > 0 ? [
        `Bu Kullanıcının Sunucudaki Eski İsimleri [ **${HistoryData.History.Names.length}** ]`,
        `${HistoryData.History.Names.map((data) => `\`▫️ ${data.Name}\` (${data.Reason})`).join("\n")}`] : `${Member.toString()} kişisinin ismi "**${isim.slice(2)}**" olarak değiştirildi.`
    ));

    await NewMessage.react(Register.ManEmoji);
    await NewMessage.react(Register.WomanEmoji);
    const Collector = await NewMessage.createReactionCollector((reaction, user) => [Register.ManEmoji, Register.WomanEmoji].includes(reaction.emoji.id) && user.id === message.author.id, { max: 1, time: 25000 });

    Collector.on("collect", (reaction) => {
        if (reaction.emoji.id === Register.ManEmoji) {
            Collector.stop();
            const Roles = [...Register.ManRoles];
            if (Member.user.username.includes(Tag)) Roles.push(TeamRole);
            if (Member.roles.cache.has(VIP)) Roles.push(VIP);
            Member.setRoles(Roles);
            global.updateUser(message.author.id, "Man", 1);
            global.addName(Member.id, isim, `<@&${Register.ManRoles[0]}>`);
            NewMessage.edit(Embed.setDescription(`${Member.toString()} kişisi başarıyla \`erkek\` olarak kaydedildi.`));
        } else if (reaction.emoji.id === Register.WomanEmoji) {
            Collector.stop();
            const Roles = [...Register.WomanRoles];
            if (Member.user.username.includes(Tag)) Roles.push(TeamRole);
            if (Member.roles.cache.has(VIP)) Roles.push(VIP);
            Member.setRoles(Roles);
            global.updateUser(message.author.id, "Woman", 1);
            global.addName(Member.id, isim, `<@&${Register.WomanRoles[0]}>`);
            NewMessage.edit(Embed.setDescription(`${Member.toString()} kişisi başarıyla \`kadın\` olarak kaydedildi.`));
        }
    });

    Collector.on("end", () => {
        Collector.stop();
        NewMessage.reactions.removeAll();
        const Channel = Moderation.channels.cache.get(ChatChannel);
        if (Channel) Channel.send(`${Member} aramıza katıldı.`);
    });
};

exports.conf = {
    commands: ["kayıt", "e", "k", "erkek", "kız", "kadın", "bayan", "bay"],
    enabled: true,
    usage: "kayıt [Üye]"
};
