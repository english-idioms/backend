const User = require("../models/User")

//для добавления пользователя в базу. 
module.exports.registerUser = async (req, res) => {
        const { userID, nickname, email } = req.body;
    
        if (!userID || !nickname || !email) {
        return res.status(400).json({ message: "Все поля обязательны для заполнения" });
        }
    
        try {
        const existingUser = await User.findOne({ email });
    
        if (existingUser) {
            // Если пользователь уже существует, возвращаем его данные
            return res.status(200).json({ user: existingUser });
        }
    
        const newUser = new User({
            userID,
            nickname,
            email,
        });
    
        await newUser.save();
        return res.status(201).json({ message: "Пользователь зарегистрирован", user: newUser });
        } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Ошибка сервера при регистрации", error: error.message });
        }
    };

    
//для обновления никнейма
module.exports.updateNickname = async (req, res) => {

    const { email, nickname } = req.body;  // Извлекаем из тела запроса email, не через параметры url
    try {
        const user = await User.findOneAndUpdate(
            { email }, // Поиск осуществляется по email
            { nickname }, // Обновляем nickname
            { new: true } // Возвращаем обновленный документ
        );

        //тут просто обработка ошибок
        if (!user) {
            return res.status(404).json({ message: "Пользователь не найден" });
        }
        res.json({ message: "Никнейм обновлен", user });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Ошибка сервера" });
    }
};

//для получения статуса о подписке
module.exports.getSubscriptionStatus = async (req, res) => {
    const email = req.headers.email; // Получаем email из headers

    if (!email) {
        return res.status(400).json({ error: "Email отсутствует в заголовках запроса." });
    }

    try {
        // Находим пользователя по email
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ error: "Пользователь не найден." });
        }

        // Получаем информацию о подписке
        const subscriptionStatus = {
            isSubscribed: user.isSubscribed,
            subscriptionEndDate: user.subscriptionEndDate,
        };

        // Отправляем информацию о подписке
        return res.json(subscriptionStatus);
    } catch (error) {
        console.error("Ошибка при получении подписки:", error.message);
        return res.status(500).json({ error: "Ошибка сервера." });
    }
};

//получение данных для progressbar
module.exports.getProgressbar = async (req, res) => {
    const email = req.headers.email;

    if (!email) {
        return res.status(400).json({ error: "Email отсутствует в заголовках запроса." });
    }

    try{
        const user = await User.findOne({ email });  // Ищем пользователя по email

        if (!user) { //если юзера нет, то:
            return res.status(404).json({ message: "Пользователь не найден" });
        }
        // Отправляем количество выученных идиом
        const learnedIdiomsCount = user.learnedIdioms.length;
        res.json({ learnedIdiomsCount });
    } catch(e){
        console.error(error);
        res.status(500).json({ message: "Ошибка сервера" });
    }
}

//обновление и получение дней учебы для Progressbar
module.exports.updateUserVisit = async (req, res) => {
    const email = req.headers.email;
    
    if (!email) {
        return res.status(400).json({ error: 'Email отсутствует в заголовках запроса.' });
    }
    
    try {
        const user = await User.findOne({ email });
        const today = new Date().toISOString().slice(0, 10); // Получаем сегодняшнюю дату в формате YYYY-MM-DD
    
        if (!user) {
            return res.status(404).json({ error: 'Пользователь не найден.' });
        }
    
        // Проверяем, если дата сегодня не существует в массиве 'visits'
        if (!user.visits.includes(today)) {
            user.visits.push(today); // Добавляем сегодняшнюю дату
            // Используем Set для предотвращения дублирования
            user.visits = [...new Set(user.visits)];
            await user.save(); // Сохраняем изменения
        }
    
        res.json({ visits: user.visits }); // Возвращаем список всех посещенных дней
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Ошибка сервера' });
    }
};




//получение массива всех выученных идиом
module.exports.getLearnedIdioms = async (req, res) => {
    const { userID } = req.params; //извлекаем userID из параметров запроса

    try{
        const user = await User.findOne({ userID });  // Ищем пользователя по userID

        if (!user) { //если юзера нет, то:
            return res.status(404).json({ message: "Пользователь не найден" });
        }
        // Отправляем массив выученных идиом
        res.json({ learnedIdioms: user.learnedIdioms });
    } catch(e){
        console.error(error);
        res.status(500).json({ message: "Ошибка сервера" });
    }
}

//получение массива всех любимых идиом
module.exports.getFavouriteIdioms = async (req, res) => {
    const { userID } = req.params; //извлекаем userID из параметров запроса
    try{
        const user = await User.findOne({ userID });  // Ищем пользователя по userID

        if (!user) { //если юзера нет, то:
            return res.status(404).json({ message: "Пользователь не найден" });
        }
        // если юзер есть, то отправляем массив любимых идиом
        res.json({ favouriteIdioms: user.favoriteIdioms });
    } catch(e){
        console.error(error);
        res.status(500).json({ message: "Ошибка сервера" });
    }
}

//добавление ID идиомы в массив избранных
module.exports.favouriteIdiom = async (req, res) => {
    const { userID, idiomID } = req.body; // Ожидаем, что фронтенд отправит userID и idiomID
    try {
        const user = await User.findOneAndUpdate(  // Ищем пользователя по ID и добавляем idiomID в массив favoriteIdioms, если его там еще нет
            { userID },
            { $addToSet: { favoriteIdioms: idiomID } }, // $addToSet предотвращает дублирование
            { new: true } 
        );
        if (!user) { //если юзера нет, то:
            return res.status(404).json({message: "Пользователь не найден" });
        }
        //если юзер есть, то:
        res.json( { message: "Идиома добавлена в избранное" , favoriteIdioms: user.favoriteIdioms }); 
    } catch (error) {
        console.error(error);
        res.status(500).json( { message: "Ошибка сервера"} );
    }
}


//удаление ID идиомы из массива избранных
module.exports.removeFavouriteIdiom = async (req, res) => {
    const { userID , idiomID } = req.body;// Ожидаем, что фронтенд отправит userID и idiomID
    try{
        const user = await User.findOneAndUpdate( // Ищем пользователя по ID
            { userID },
            { $pull: {favoriteIdioms: idiomID } }, //удаляет idiomID из массива любимых
            { new: true } 
        );
        if (!user) { //если юзера нет, то:
            return res.status(404).json({message: "Пользователь не найден" });
        }
        //если юзер есть, то:
        res.json( { message: "Идиома удалена из избранного" , favoriteIdioms: user.favoriteIdioms }); 
    } catch (error) {
        console.error(error);
        res.status(500).json( { message: "Ошибка сервера"} );
    }
}

// добавление ID идиомы в массив выученных
module.exports.addLearnedIdiom = async (req, res) => {
    const { userID, idiomID } = req.body;
    try {
        const user = await User.findOneAndUpdate(
            { userID },
            { $addToSet: { learnedIdioms: idiomID } }, // Добавляет уникальное значение
            { new: true }
        );
        if (!user) {
            return res.status(404).json({ message: "Пользователь не найден" });
        }
        res.json({ message: "Идиома добавлена в выученные", learnedIdioms: user.learnedIdioms });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Ошибка сервера" });
    }
};

// удаление ID идиомы из массива выученных
module.exports.removeLearnedIdiom = async (req, res) => {
    const { userID, idiomID } = req.body;
    try {
        const user = await User.findOneAndUpdate(
            { userID },
            { $pull: { learnedIdioms: idiomID } }, // Удаляет значение из массива
            { new: true }
        );
        if (!user) {
            return res.status(404).json({ message: "Пользователь не найден" });
        }
        res.json({ message: "Идиома удалена из выученных", learnedIdioms: user.learnedIdioms });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Ошибка сервера" });
    }
};
