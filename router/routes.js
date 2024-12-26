const express = require("express");
const router = express.Router();
const {
    favouriteIdiom,
    removeFavouriteIdiom,
    getFavouriteIdioms,
    addLearnedIdiom,
    removeLearnedIdiom,
    getLearnedIdioms,
    getProgressbar,
    updateNickname,
    registerUser,
    getSubscriptionStatus,
    updateUserVisit
} = require("../controllers/user-controller");

// Маршрут для добавления пользователя в базу mongo. Frontend - AppBar.js
router.post("/register", registerUser);

// Маршрут для обновления никнейма. Frontend - SubscriptionCard.js
router.post("/update-nickname", updateNickname);

// Маршрут для получения данных о подписке Frontend - SubscriptionCard.js
router.get("/get-subscription", getSubscriptionStatus);

// Маршрут для progressbar Frontend - ProgressBar.js
router.get("/progressbar", getProgressbar); // Получить количество выученных идиом и количество дней
router.post("/visit-days", updateUserVisit); //Обновить и получить назад количество дней посещения

// Маршруты для внесения в списки
router.post("/favourite", favouriteIdiom); // Включение любимой идиомы в список любимых
router.delete("/favourite", removeFavouriteIdiom); // Удаление любимой идиомы из списка
router.post("/learned", addLearnedIdiom); // Включение идиомы в список выученных
router.delete("/learned", removeLearnedIdiom); // Удаление идиомы из списка выученных

// Маршруты для получения списков
router.get("/favourite-idioms/:userID", getFavouriteIdioms); // Получить массив id любимых идиом
router.get("/learned-idioms/:userID", getLearnedIdioms); // Получить массив id выученных идиом

// Тестовый маршрут
router.get("/", (req, res) => {
  res.send("Hi my sweety, I am your server!"); // Сообщение -> localhost:5000/
});

module.exports = router;
