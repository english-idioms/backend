const stripe = require('../config/stripe');
const User = require('../models/User'); 

// Цены тарифов
const PRICES = {
    STANDART: 1000,  // Цена в центах
    PREMIUM: 1600,
    ULTIMATE: 2400,
};

// Создание Payment Intent
exports.createPaymentIntent = async (req, res) => {
    const { paymentMethodId, planId, userId } = req.body;

    console.log("Запрос от клиента:", { paymentMethodId, planId, userId });

    try {
        // Проверяем, что пользователь существует в базе
        const user = await User.findOne({ email: userId });
        if (!user) {
            console.error("Пользователь не найден:", userId);
            return res.status(400).send({ error: 'Пользователь не найден.' });
        }

        console.log("Найден пользователь:", user);

        // Получаем цену для выбранного плана
        const amount = PRICES[planId];
        if (!amount) {
            console.error("Неверный план тарифа:", planId);
            return res.status(400).send({ error: 'Неверный план тарифа.' });
        }

        console.log("Создаём PaymentIntent для суммы:", amount);

        // Создаём новый PaymentIntent (каждый раз создаём новый)
        const paymentIntent = await stripe.paymentIntents.create({
            amount,  // Сумма в центах
            currency: 'eur',
            payment_method: paymentMethodId,
            confirm: true,
            automatic_payment_methods: {
                enabled: true,
                allow_redirects: 'never',  // Запрещаем редиректы
            },
        });

        console.log("PaymentIntent создан:", paymentIntent);

        // Обновляем подписку пользователя только если она еще не активна
        if (user.subscription && user.subscription.status === 'active') {
            console.log("Подписка уже активна для пользователя:", userId);
            return res.send({ success: true, message: 'Подписка уже активна.' });
        }

        const duration = {
            STANDART: 30,  // Дни подписки
            PREMIUM: 60,
            ULTIMATE: 120,
        };

        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + duration[planId]);

        const currentDate = new Date();  // Дата подписки

        // Обновляем пользователя с новой подпиской
        await User.findOneAndUpdate(
            { email: userId },
            {
                $set: {
                    isSubscribed: true,
                    subscriptionDate: currentDate,
                    subscriptionDays: duration[planId],
                    subscriptionEndDate: expiryDate,
                    planId: planId, // Идентификатор плана
                    stripeSubscriptionId: paymentIntent.id, // Идентификатор Stripe
                    stripeCustomerId: user.stripeCustomerId, // Идентификатор пользователя в Stripe
                    stripeStatus: paymentIntent.status // Статус подписки
                },
            }
        );

        console.log("Подписка обновлена для пользователя:", userId);

        // Отправляем клиенту clientSecret для подтверждения платежа
        res.send({ success: true, clientSecret: paymentIntent.client_secret });
    } catch (error) {
        console.error("Ошибка на сервере:", error.message);
        res.status(400).send({ error: error.message });
    }
};

