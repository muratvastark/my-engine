const Moderation = global.Moderation;
const { MessageEmbed } = require("discord.js")
const { TagChannel, Tag, TeamRole, UnregisterRoles, SecondTag, BannedTags, BannedTagsRole, TagIntakeMode } = Moderation.Defaults;
const { Jail, Suspect } = Moderation.Permissions;

exports.execute = (oldUser, newUser) => {
    const Guild = Moderation.guilds.cache.first();
    const Member = Guild.members.cache.get(oldUser.id);
    if (!Member || UnregisterRoles.some((e) => Member.roles.cache.has(e)) || Member.roles.cache.has(Jail.Role) || Member.roles.cache.has(Suspect.Role)) return;
    
    const Embed = new MessageEmbed().setColor("RANDOM");
    const Channel = Moderation.channels.cache.get(TagChannel);
    if (!BannedTags.some((tag) => oldUser.username.includes(tag)) && BannedTags.some((tag) => newUser.username.includes(tag))) {
        Member.setRoles(BannedTagsRole);
        if (Channel) Channel.send(Embed.setDescription(`${Member}, adlı üye ismine yasaklı bir tag sembolünü aldığı için yasaklı tag rolü verildi.`));
    } else if (BannedTags.some((tag) => oldUser.username.includes(tag)) && !BannedTags.some((tag) => newUser.username.includes(tag))) {
        Member.setRoles(UnregisterRoles);
        if (Channel) Channel.send(Embed.setDescription(`${Member}, adlı üye ismindeki yasaklı tagı çıkardığı için yasaklı tag rolü alındı.`));
    } else if (!oldUser.username.includes(Tag) && newUser.username.includes(Tag)) {
        if (!Member.roles.cache.has(TeamRole)) Member.roles.add(TeamRole).catch(console.error);
        if (Member.displayName.includes(Tag)) Member.setNickname(Member.displayName.replace(SecondTag, Tag)).catch(console.error);
        if (Channel) Channel.send(Embed.setDescription(`${Member} tagımızı ismine ekledi.`)).catch(console.error);
    } else if (oldUser.username.includes(Tag) && !newUser.username.includes(Tag)) {
        if (Member.displayName.includes(SecondTag)) Member.setNickname(Member.displayName.replace(Tag, SecondTag)).catch(console.error);
        if (TagIntakeMode === false) Member.roles.remove(Member.roles.cache.filter((rol) => rol.position >= Guild.roles.cache.get(TeamRole).position)).catch(console.error);
        else Member.setRoles(UnregisterRoles);
        if (Channel) Channel.send(Embed.setDescription(`${Member} tagımızı isminden çıkardı.`));
    }
};

exports.conf = {
    event: "userUpdate",
    enabled: true
};