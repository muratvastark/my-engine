const { Client } = require("discord.js");
const Guard = new Client();
const Settings = require("../global.json").OwnerGuard;
const SpamCounter = {};
const Permissions = ["ADMINSTRATOR", "KICK_MEMBERS", "MANAGE_GUILD", "BAN_MEMBERS", "MANAGE_ROLES", "MANAGE_WEBHOOKS", "MANAGE_NICKNAMES", "MANAGE_CHANNELS"];

Guard.on("roleCreate", (role) => role.guild.fetchAuditLogs({ limit: 1 }).then((audit) => checkUser(audit.entries.first())));
Guard.on("roleDelete", (role) => role.guild.fetchAuditLogs({ limit: 1 }).then((audit) => checkUser(audit.entries.first())));
Guard.on("roleUpdate", (oldRole) => oldRole.guild.fetchAuditLogs({ limit: 1 }).then((audit)));
Guard.on("channelCreate", (channel) => channel.guild.fetchAuditLogs({ limit: 1   }).then((audit) => checkUser(audit.entries.first())));
Guard.on("channelDelete", (channel) => channel.guild.fetchAuditLogs({ limit: 1 }).then((audit) => checkUser(audit.entries.first())));
Guard.on("channelUpdate", (oldChannel) => oldChannel.guild.fetchAuditLogs({ limit: 1 }).then((audit)));
Guard.on("guildUpdate", (oldGuild) => oldGuild.fetchAuditLogs({ limit: 1 }).then((audit) => checkUser(audit.entries.first())));
Guard.on("webhookUpdate", (oldWebhook) => oldWebhook.guild.fetchAuditLogs({ limit: 1 }).then((audit) => checkUser(audit.entries.first())));
Guard.on("guildBanAdd", (guild) => guild.fetchAuditLogs({ limit: 1 }).then((audit) => checkUser(audit.entries.first())));
Guard.on("guildMemberRemove", (member) => member.guild.fetchAuditLogs({ limit: 1, type: "MEMBER_KICK" }).then((audit) => checkUser(audit.entries.first())));
Guard.on("guildMemberAdd", (member) => member.guild.fetchAuditLogs({ limit: 1, type: "BOT_ADD" }).then((audit) => checkUser(audit.entries.first())));
Guard.on("guildMemberUpdate", (oldMember, newMember) => {
    if (oldMember._roles === newMember._roles) return;
    const changedRoles = newMember.roles.cache.filter(role => !oldMenber.roles.cache.has(role.id)).filter(role => Permissions.some(perm => role.permissions.toArray().includes(perm)));
    if(changedRoles.size === 0) return;
    oldMember.guild.fetchAuditLogs({ limit: 1 }).then(audit => checkUser(audit.entries.first()));
});

function checkUser(log) {
    if (!log || log && (Settings.SafePersons.includes(log.executor.id) || Date.now() - log.createdTimestamp > 5000)) return;
    const Guild = Guard.guilds.cache.first();
    const Member = Guild.members.cache.get(log.executor.id);
    if (Member.roles.highest.position < Guild.roles.cache.get(Settings.MinStaffRole).position) return;
    if (Settings.MaxWarn > SpamCounter[log.executor.id] && Member) Member.roles.set(Member.roles.cache.filter((role) => Permissions.some((permission) => role.permissions.toArray().includes(permission))).map((role) => role.id));
    else {
        SpamCounter[log.executor.id] = SpamCounter[log.executor.id] ? SpamCounter[log.executor.id] + 1 : 1;
        setTimeout(() => { 
            SpamCounter[log.executor.id] > 0 ? SpamCounter[log.executor.id] = 0 : delete SpamCounter[log.executor.id];
        }, 1000 * 60 * Settings.Hours * 10);    
    }
}

Guard.login(Settings.Token).then(() => console.log(`${Guard.user.tag} is online!`)).catch(() => Guard.destroy());