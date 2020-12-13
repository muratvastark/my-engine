const { PenalModel } = require("./models.js")

module.exports = {
    async addPenal(User, Admin, Type, Reason, Temporary = false, Date = Date.now, Finish = undefined, Jail_Roles = []) {
        const Count = await PenalModel.countDocuments().exec()
        const NewCount = Count + 1;
        global.updateUser(User, Type, 1);
        global.updateUser(Admin, `STAFF_${Type}`, 1);
        return await new PenalModel({ Id: NewCount, Date, Activity: true, Complated: false, User, Admin, Type, Temporary, Reason, Finish, Jail_Roles}).save();
    },

    async inactiveUserPenals(user, type, complated = true) {
        return await PenalModel.updateMany({ Activity: true, User: user, Type: type }, { $set: { Activity: false, Complated: complated } }, (err, res) => {
            if (err) return console.error(err);
        });
    },

    async getPenal(query) {
        return await PenalModel.findOne(query).exec();
    },

    async fetchPenals(query = {}, limit = undefined) {
        if (!limit) return await PenalModel.find(query).exec();
        else return await PenalModel.find(query).limit(limit).exec();
    },

    limit(user, limit, max) {
        if (limit[user] >= max) return false;
        limit[user] = limit[user] ? limit[user]++ : 0;
        setTimeout(() => {
            limit[user] = limit[user]--;
            if (limit[user] < 0) delete limit[user];
        }, 60 * 60 * 1000);
        return true;
    }
};
