const { GuildMember, MessageEmbed } = require("discord.js");
const moment = require('moment');
require('moment-duration-format');
require('moment-timezone');
moment.locale('tr');

module.exports = (Moderation) => {
    Moderation.getUser = async (id) => {
        if (!id || !id.length || id.length < 8 || !Number(id)) return undefined
        try {
            return await Moderation.users.fetch(id)
        } catch (err) {
            return undefined
        }
    };

    GuildMember.prototype.setRoles = function (params) {
        if (!this.manageable) return false;
        const roles = this.roles.cache.filter((role) => role.managed).map((role) => role.id).concat(params);
        this.roles.set(roles).catch(console.error);
        return true;
    }

    GuildMember.prototype.check = function (array) {
        if (array && Array.isArray(array) == false) array = [array];
        if (Moderation.Defaults.Developers.includes(this.id) || this.guild.ownerID === this.id || this.hasPermission("ADMINISTRATOR") || (array && array.length && array.some((id) => this.roles.cache.has(id) || this.id === id))) return true;
        else return false;
    };

    Date.prototype.toTurkishFormatDate = function () {
        return moment.tz(this, "Europe/Istanbul").format('LLL');
    };

    Moderation.timeTR = function (value) {
        const days = Math.floor(value / 86400000);
        value = value % 86400000;
        const hours = Math.floor(value / 3600000);
        value = value % 3600000;
        const minutes = Math.floor(value / 60000);
        value = value % 60000;
        const seconds = Math.floor(value / 1000);
        return (days ? days + ' gün ' : '') + (hours ? hours + ' saat ' : '') + (minutes ? minutes + ' dakika ' : '') + (seconds ? seconds + ' saniye' : '')
    };
};
