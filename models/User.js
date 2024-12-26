const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    userID: {
        type: String,
        required: true,
        unique: true, 
    },
    nickname: {
        type: String,
        required: false
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    favoriteIdioms: {
        type: [String], // Массив строк для хранения идентификаторов любимых идиом
        default: []
    },
    learnedIdioms: {
        type: [String], // Массив строк для хранения идентификаторов выученных идиом
        default: []
    },
    visits: [
        {
          type: String,  // Дата посещения, например, "2024-12-17"
          unique: true,  // Чтобы не добавлять одинаковую дату несколько раз
        }
    ],

    // Информация об оплате подписки
    isSubscribed: {
        type: Boolean,   // Показывает, активна ли подписка
        default: false
    },
    subscriptionDate: {
        type: Date,      // Дата оплаты подписки
        required: false
    },
    subscriptionDays: {
        type: Number,    // Количество дней действия подписки
        required: false,
        default: 0
    },
    subscriptionEndDate: {
        type: Date,      // Дата окончания подписки
        required: false
    },


    // Информация о подписке через Stripe
    stripeSubscriptionId: {
        type: String,    // Идентификатор подписки в Stripe
        required: false
    },
    planId: {
        type: String,    // Идентификатор тарифа (например, basic, premium)
        required: false
    },
    stripeCustomerId: {
        type: String,    // Идентификатор клиента в Stripe
        required: false
    },
    stripeStatus: {
        type: String,    // Статус подписки, например: "active", "past_due"
        required: false
    }

});

// Создаём модель пользователя
module.exports = mongoose.model("User", userSchema);