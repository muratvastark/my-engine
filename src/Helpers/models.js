const Mongoose = require("mongoose")

const StatsSchema = Mongoose.Schema({
    Id: String,
    Voice: Map,
    TotalVoice: Number,
    Message: Map,
    TotalMessage: Number
});

const PenalSchema = new Mongoose.Schema({
    Id: String,
    Type: String,
    User: String,
    Admin: String,
    Reason: String,
    Date: { type: Number, default: Date.now() },
    Finish: { type: Number, default: undefined },
    Activity: { type: Boolean, default: true },
    Complated: { type: Boolean, default: false },
    Temporary: { type: Boolean, default: false },
    Jail_Roles: { type: Array, default: [] }
});

const UserSchema = new Mongoose.Schema({
    Id: String,
    History: {
        Names: [],
        RoleLogs: [],
        Notes: []
    },
    Usage: {}
});
const UserModel = Mongoose.model("Users", UserSchema);

const InviteSchema = Mongoose.Schema({
    Id: { type: String, default: null },
    Inviter: { type: String, default: null },
    Total: { type: Number, default: 0 },
    Regular: { type: Number, default: 0 },
    Fake: { type: Number, default: 0 },
    Leave: { type: Number, default: 0 },
    IsFake: { type: Boolean, default: false }
});

const LevelSchema = Mongoose.Schema({
   Id: { type: String, default: null },
   Level: { type: Number, default: 0 },
   CurrentXP: { type: Number, default: 0 },
   RequiredXP: { type: Number, default: 100 },
});

module.exports = {
    StatsModel: Mongoose.model("Stats", StatsSchema),
    PenalModel: Mongoose.model("Penals", PenalSchema),
    InviteModel: Mongoose.model("Invites", InviteSchema),
    LevelModel: Mongoose.model("Levels", LevelSchema),
    UserModel
};

global.updateUser = (Id, key, value) => {
    UserModel.findOneAndUpdate({ Id }, { $inc: { [`Usage.${key}`]: value } }, { upsert: true, new: true, setDefaultsOnInsert: true }).exec();
};

global.addName = function (Id, Name, Reason) {
    UserModel.findOneAndUpdate({ Id }, { $push: { "History.Names": { Name, Reason, Date: Date.now() } } }, { upsert: true, new: true, setDefaultsOnInsert: true }).exec();
};
