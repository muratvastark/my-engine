const { Client, Guild } = require("discord.js");
const Guard = new Client();
const Settings = require("../global.json").Guard;
const SpamCounter = {};
const Permissions = ["ADMINSTRATOR", "KICK_MEMBERS", "MANAGE_GUILD", "BAN_MEMBERS", "MANAGE_ROLES", "MANAGE_WEBHOOKS", "MANAGE_NICKNAMES", "MANAGE_CHANNELS"];

Guard.on("roleCreate", async(role) => await role.guild.checkLog());
Guard.on("roleDelete", async(role) => await role.guild.checkLog());
Guard.on("roleUpdate", async(oldRole) => await oldRole.guild.checkLog());
Guard.on("channelCreate", async(channel) => await channel.guild.checkLog());
Guard.on("channelDelete", async(channel) => await channel.guild.checkLog());
Guard.on("channelUpdate", async(oldChannel) => await oldChannel.guild.checkLog());
Guard.on("guildUpdate", async(oldGuild) => await oldGuild.checkLog());
Guard.on("webhookUpdate", async(oldWebhook) => await oldWebhook.guild.checkLog());
Guard.on("guildBanAdd", async(guild) => await guild.checkLog());
Guard.on("guildMemberRemove", async(member) => await member.guild.checkLog());
Guard.on("guildMemberAdd", async(member) => await member.guild.checkLog());
Guard.on("guildMemberUpdate", async(oldMember, newMember) => {
    if (oldMember._roles === newMember._roles) return;
    const changedRoles = newMember.roles.cache.filter((_role) => !oldMenber.roles.cache.has(_role.id)).filter((_role) => Permissions.some((_perm) => _role.permissions.toArray().includes(_perm)));
    if(changedRoles.size === 0) return;
    oldMember.guild.checkLog();
});

Guild.prototype.checkLog = async function() {
    const Log = await this.fetchAuditLogs({ limit: 1 }).then((_audit) => _audit.entries.first());
    if (!Log || Date.now() - Log.createdTimestamp > 5000) return true;
    if (Member.roles.highest.position < Guild.roles.cache.get(Settings.MinStaffRole).position) return;
    const Member = await this.members.fetch(Log.executor.id);
    if (Settings.MaxWarn > SpamCounter[log.executor.id] && Member) Member.roles.set(Member.roles.cache.filter((role) => Permissions.some((permission) => role.permissions.toArray().includes(permission))).map((role) => role.id));
    else {
        SpamCounter[log.executor.id] = SpamCounter[log.executor.id] ? SpamCounter[log.executor.id] + 1 : 1;
        setTimeout(() => { 
            SpamCounter[log.executor.id] > 0 ? SpamCounter[log.executor.id] = 0 : delete SpamCounter[log.executor.id];
        }, 1000 * 60 * 3);    
    }
};

Guard.login(Settings.Token).then(() => console.log(`${Guard.user.tag} is online!`)).catch(() => Guard.destroy());
