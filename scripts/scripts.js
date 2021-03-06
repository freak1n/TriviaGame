// Fix for IE browser
$.support.cors = true;
var serviceRootUrl = "http://trivia-game.apphb.com/api/trivia/";

function onDocumentReady() {
    setTextToSignedUserInfoDiv();

    $("header h1").hover(mouseOverOnTitleHandler, mouseOutOnTitleHandler);

    $("#register-nav-button").on("click", onRegisterNavButtonClick);
    $("body").delegate(".signin-nav-button", "click", onSigninNavButtonClick);

    $("#get-all-users-nav-button").on("click", onGetAllUsersNavButtonClick);
    $("#get-all-categories-nav-button").on("click", onGetAllCategoriesNavButtonClick);
    $("#newgame-nav-button").on("click", onStartNewGameNavBtnClick);
    $("#add-new-question-nav-buttton").on("click", onAddNewQuestionNavBtnClick);
}

function setTitleForContent(title) {
    $("section h2").text(title);
}
function setPageInfo(text) {
    $("#page-info").text(text);
}

//Add new Question
function onAddNewQuestionNavBtnClick(e) {
    performGetRequest(serviceRootUrl + "/categories", onGetAllCategoriesForNewQuestionSucces, onGetAllCategoriesForNewQuestionError);
}
function onGetAllCategoriesForNewQuestionSucces(categories) {
    setTitleForContent("Добавяне на въпрос");
    var selectCategoryForm = '<form id="select-category-form" action="">' +
        '<select id="select-category" name="categories">' +
            '<option value="" selected="selected" disabled="true">Изберете категория</option>' +
            '<option data-id="0" value="">Произволна</option>';
    for (var i = 0; i < categories.length; i++) {
        category = categories[i];
        selectCategoryForm += '<option data-id="' + category.id + '" value="">' + category.name + '</option>';
    }
    selectCategoryForm += '</select>' +
   '</form>'+
   '<div id="one-question">' +
            '<h3>Нов въпрос: </h3>' +
            '<div id="one-question-container">' +
                '<label for="one-question-text">Въпрос: </label>' +
                '<input id="one-question-text" type="text" /><br />' +
                '<label for="correct-answer">Верен отговор: </label>' +
                '<input id="correct-answer" type="text" /><br />' +
                '<label>Грешни отговори: </label>' +
                '<input id="wrong-answer-1" type="text" /><input id="wrong-answer-2" type="text" /><input id="wrong-answer-3" type="text" /> ' +
            '</div>' + 
    '</div>' +
    '<div id="add-new-question-container" class="clear">' +
        '<button id="add-new-question-to-server-button" class="custom-light-yellow-button">Добавяне на нов въпрос</button>' +
        '<div id="add-new-question-error-div"></div>' +
    '</div>';

    $("#main-container").html(selectCategoryForm);
    $("#select-category").on("change", function () {
        $("#add-new-question-container").show();
        $("#one-question").show();
        $("#one-question").accordion();
    });
    $("#add-new-question-to-server-button").on("click", onAddNewQuestionToServerBtn);
}
function onGetAllCategoriesForNewQuestionError(err) {
    console.error(JSON.stringify(err));
}

function onAddNewQuestionToServerBtn(e) {
    var newQuestionInfoForServer = {
        "user": { "username": sessionStorage.userName, "authCode": sessionStorage.authCode },
        "question": {
            "text": $("#one-question-text").val(),
            "correctAnswers": [
             { "text": $("#correct-answer").val() }],
            "wrongAnswers": [
             { "text": $("#wrong-answer-1").val() },
             { "text": $("#wrong-answer-2").val() },
             { "text": $("#wrong-answer-3").val() }]
        }
    }
    alert(JSON.stringify(newQuestionInfoForServer));
    var currentSelectedCategory = $("#select-category").find('option:selected').attr('data-id');
    var service = "add-question/" + currentSelectedCategory;
    performPostRequest(serviceRootUrl + service, newQuestionInfoForServer, onAddNewQuestionSuccess, onAddNewQuestionError);
}
function onAddNewQuestionSuccess(data) {
    alert("ok");
}

function onAddNewQuestionError(err) {
    console.error(JSON.stringify(err));
}

//Registration
function onRegisterNavButtonClick(e) {
    setTitleForContent("Регистрация");
    setPageInfo("");
    var registrationFormHtml =
        '<form id="registration-form" class="reg-signin-form font-size18">' +
            '<label for="username-reg-input">Потребителско име: </label><br />' +
            '<input id="username-reg-input" type="text" autofocus="autofocus" /><br />' +

            '<label for="nickname-reg-input">Прякор: </label><br />' +
            '<input id="nickname-reg-input" type="text" /><br />' +

            '<label for="password-reg-input">Парола: </label><br />' +
            '<input id="password-reg-input" type="password" /><br />' +

            '<label for="password-confirm-reg-input">Повтори паролата: </label><br />' +
            '<input id="password-confirm-reg-input" type="password" /><br />' +
            '<button id="register-button" class="custom-light-yellow-button">Регистрирай ме</button>' +
        '</form>' +
        '<div id="reg-error-div"></div>';
    $("#main-container").html(registrationFormHtml);
    $("#register-button").on("click", onRegisterButtonClick);
}
function onRegisterButtonClick(event) {
    var newUserData = collectDataForNewUser();

    //Check if all inputs are fill
    if (newUserData.username == "" || newUserData.nickname == "" || newUserData.password == "" || newUserData.passwordConfirm == "") {
        $("#reg-error-div").text("Трябва да въведете всички полета!");
        $("#reg-error-div").show();
        event.preventDefault();
        return;
    }

    //Check username length
    if (newUserData.username.length < 4) {
        $("#reg-error-div").text("Потребителското име трябва да съдържа поне 4 символа!");
        $("#reg-error-div").show();
        event.preventDefault();
        return;
    }
    if (newUserData.username.length > 30) {
        $("#reg-error-div").text("Потребителското име не трябва да съдържа повече от 30 символа!");
        $("#reg-error-div").show();
        event.preventDefault();
        return;
    }

    //Check nickname length
    if (newUserData.nickname.length < 4) {
        $("#reg-error-div").text("Прякора трябва да съдържа поне 4 символа!");
        $("#reg-error-div").show();
        event.preventDefault();
        return;
    }
    if (newUserData.nickname.length > 30) {
        $("#reg-error-div").text("Прякора не трябва да съдържа повече от 30 символа!");
        $("#reg-error-div").show();
        event.preventDefault();
        return;
    }

    //Testing if username starts with letter
    var regex = /^[a-zA-Z].*$/;
    var result = regex.test(newUserData.username);
    if (!result) {
        $("#reg-error-div").text("Потребителското име трябва да започва с буква!");
        $("#reg-error-div").show();
        event.preventDefault();
        return;
    }

    //Testing if username contains invalid characters
    regex = /^\w+$/;
    result = regex.test(newUserData.username);
    if (!result) {
        $("#reg-error-div").text("Потребителското име съдържа непозволени символи!");
        $("#reg-error-div").show();
        event.preventDefault();
        return;
    }

    //Testing if nickname contains invalid characters
    regex = /^\w+$/;
    result = regex.test(newUserData.nickname);
    if (!result) {
        $("#reg-error-div").text("Прякора съдържа непозволени символи!");
        $("#reg-error-div").show();
        event.preventDefault();
        return;
    }

    //Check if passwords match
    if (newUserData.password != newUserData.passwordConfirm) {
        $("#reg-error-div").text("Паролите не съвпадат!");
        $("#reg-error-div").show();
        event.preventDefault();
        return;
    }

    //Check password length
    if (newUserData.password.length < 4) {
        $("#reg-error-div").text("Паролата трябва да съдържа повече от 4 символа!");
        $("#reg-error-div").show();
        event.preventDefault();
        return;
    }

    //After validate perform request to server with crypted authCode username and nickname
    var newAuthCode = CryptoJS.SHA1(newUserData.username + newUserData.password).toString();
    var newUser = {
        "username": newUserData.username,
        "nickname": newUserData.nickname,
        "authCode": newAuthCode
    }
    performPostRequest(serviceRootUrl + "register-user", newUser,
        onRegisterUserSuccess, onRegisterUserError);
}
function onRegisterUserSuccess(data) {
    $("#main-container").html('<div class="font-size18">Успешно се регистрирахте в играта. За да влезете натиснете <a href="#" class="signin-nav-button text-color-light-yellow">Вход</a>.</div>');
}
function onRegisterUserError(err) {
    $("#reg-error-div").text("Вече съществува играч с такова потребителско име.");
    $("#reg-error-div").show();
    console.error(JSON.stringify(err));
}
function collectDataForNewUser() {
    var user = {
        username: $("#username-reg-input").val(),
        nickname: $("#nickname-reg-input").val(),
        password: $("#password-reg-input").val(),
        passwordConfirm: $("#password-confirm-reg-input").val()
    }
    return user;
}

//Sign in
function onSigninNavButtonClick(e) {
    setTitleForContent("Вход в системата");
    setPageInfo("");
    var signinFormHtml =
        '<form id="signin-form" class="reg-signin-form font-size18">' +
            '<label for="username-signin-input">Потребителско име: </label><br />' +
            '<input id="username-signin-input" type="text" autofocus="autofocus" /><br />' +
            '<label for="password-signin-input">Парола: </label><br />' +
            '<input id="password-signin-input" type="password" /><br />' +
            '<button id="signin-button" class="custom-light-yellow-button">Влизане</button>' +

       '</form>' +
       '<div id="signin-error-div">Pesho</div>';

    $("#main-container").html(signinFormHtml);
    $("#signin-button").on("click", onSignInButtonClick);
}
function onSignInButtonClick(e) {
    var userData = collectDataForUserSignIn();

    //Check if inputs are filled
    if (userData.username == "" || userData.password == "") {
        $("#signin-error-div").text("Трябва да въведете всички полета!");
        $("#signin-error-div").show();
        e.preventDefault();
        return;
    }

    //Check username length
    if (userData.username.length < 4) {
        $("#signin-error-div").text("Потребителското име трябва да съдържа поне 4 символа!");
        $("#signin-error-div").show();
        event.preventDefault();
        return;
    }
    if (userData.username.length > 30) {
        $("#signin-error-div").text("Потребителското име не трябва да съдържа повече от 30 символа!");
        $("#signin-error-div").show();
        event.preventDefault();
        return;
    }

    //Testing if username starts with letter
    var regex = /^[a-zA-Z].*$/;
    var result = regex.test(userData.username);
    if (!result) {
        $("#signin-error-div").text("Потребителското име трябва да започва с буква!");
        $("#signin-error-div").show();
        event.preventDefault();
        return;
    }

    //Testing if username contains invalid characters
    regex = /^\w+$/;
    result = regex.test(userData.username);
    if (!result) {
        $("#signin-error-div").text("Потребителското име съдържа непозволени символи!");
        $("#signin-error-div").show();
        event.preventDefault();
        return;
    }

    //Check password length
    if (userData.password.length < 4) {
        $("#signin-error-div").text("Паролата трябва да съдържа повече от 4 символа!");
        $("#signin-error-div").show();
        event.preventDefault();
        return;
    }

    var userAuthCode = CryptoJS.SHA1(userData.username + userData.password).toString();
    var userSignin = {
        username: userData.username,
        authcode: userAuthCode
    }
    sessionStorage.setItem("userName", userSignin.username);
    sessionStorage.setItem("authCode", userSignin.authcode);
    performPostRequest(serviceRootUrl + "login-user", userSignin, signInUserSuccess, signInUserError);
}
function signInUserSuccess(data) {
    window.location.href = "?";
}
function signInUserError(err) {
    $("#signin-error-div").text("Грешно име или парола!");
    $("#signin-error-div").show();
    sessionStorage.clear();
    console.error(JSON.stringify(err));
}
function collectDataForUserSignIn() {
    var user = {
        username: $("#username-signin-input").val(),
        password: $("#password-signin-input").val()
    }
    return user;
}

//Get All Categories
function onGetAllCategoriesNavButtonClick(e) {
    performGetRequest(serviceRootUrl + "categories",
        onGetAllCategoriesSuccess, onGetAllCategoriesError);
}
function onGetAllCategoriesSuccess(categories) {
    setTitleForContent("Всички категории в играта");
    setPageInfo("");
    var categoriesHtml =
        '<button id="add-new-category-button" class="custom-light-yellow-button">Добави нова категория</button><br />' +
        '<div id="all-categories-container" class="font-size18">';
    for (var i = 0; i < categories.length; i++) {
        category = categories[i];
        categoriesHtml +=
            '<a href="#" data-id="' + category.id + '">' + category.name + '</a>';
        if (i != categories.length - 1) {
            categoriesHtml += ', ';
        }
    }
    categoriesHtml += '</div';
    $("#main-container").html(categoriesHtml);
    $("#add-new-category-button").on("click", onAddNewCategoryButtonClick);
}
function onGetAllCategoriesError(err) {
    console.error(JSON.stringify(err));
}

//Add New Category
function onAddNewCategoryButtonClick(e) {
    if (!sessionStorage.userName) {
        showDialogBoxToRegistrationOrSignIn();
    }
    else {
        showPageForAddNewCategory();
    }
}
function showPageForAddNewCategory() {
    setTitleForContent("Добавяне на нова категория");
    setPageInfo("За да добавите категория, трябва да въведете поне 10 въпроса към тази категория.");
    var newCategoryForm =
        '<label for="newCategoryNameInput" class="text-color-light-yellow font-size18">Име на категорията: </label>' +
        '<input id="newCategoryNameInput" type="text" autofocus="autofocus" />' +
        '<div id="questions-accordion">';
    for (var i = 1; i <= 10; i++) {
        newCategoryForm +=
            '<h3>Въпрос ' + i + ': </h3>' +
            '<div id="question-container-"' + i + '>' +
                '<label for="question-' + i + '">Въпрос: </label>' +
                '<input id="question-' + i + '" type="text" /><br />' +
                '<label for="correct-answer-for-question-' + i + '">Верен отговор: </label>' +
                '<input id="correct-answer-for-question-' + i + '"" type="text" /><br />' +
                '<label>Грешни отговори: </label>' +
                '<input id="wrong-answer-1-for-question-' + i + '" type="text" /><input id="wrong-answer-2-for-question-' + i + '" type="text" /><input id="wrong-answer-3-for-question-' + i + '" type="text" /> ' +
            '</div>';
    }

    newCategoryForm += '</div>' +
    '<div id="add-new-category-container" class="clear">' +
        '<button id="add-new-category-to-server-button" class="custom-light-yellow-button">Добави нова категория</button>' +
        '<div id="add-new-category-error-div">Pesho</div>' +
    '</div>';
    $("#main-container").html(newCategoryForm);
    $("#add-new-category-to-server-button").on("click", validateQuestionsForNewCategory);
    $("#questions-accordion").accordion();
}
function validateQuestionsForNewCategory(e) {
    var nameOfCategory = $("#newCategoryNameInput").val();
    if (nameOfCategory == "") {
        $("#add-new-category-error-div").text("Трябва да въведете име на категорията.");
        $("#add-new-category-error-div").show();
        e.preventDefault();
        return;
    }

    if (nameOfCategory.length < 5) {
        $("#add-new-category-error-div").text("Името на категорията трябва да е с повече от 5 символа.");
        $("#add-new-category-error-div").show();
        e.preventDefault();
        return;
    }

    var categoryJsonForServer = {
        "category": {
            "name": nameOfCategory,
            "questions": []
        }
    }

    var currentQuestion;
    for (var i = 1; i <= 10; i++) {
        currentQuestion = {
            text: $("#question-" + i).val(),
            correctAnswers: [{ "text": $("#correct-answer-for-question-" + i).val() }],
            wrongAnswers: [
                { "text": $("#wrong-answer-1-for-question-" + i).val() },
                { "text": $("#wrong-answer-2-for-question-" + i).val() },
                { "text": $("#wrong-answer-3-for-question-" + i).val() }]
        }

        if (currentQuestion.text == "" || $("#correct-answer-for-question-" + i).val() == "" || $("#wrong-answer-1-for-question-" + i).val() == "" || $("#wrong-answer-2-for-question-" + i).val() == "" || $("#wrong-answer-3-for-question-" + i).val() == "") {
            $("#add-new-category-error-div").text("Не сте попълнили цялата информация за Въпрос " + i);
            $("#add-new-category-error-div").show();
            e.preventDefault();
            return;
        }

        categoryJsonForServer.category.questions.push(currentQuestion);

    }
    categoryJsonForServer.user = {
        "username": sessionStorage.userName,
        "authCode": sessionStorage.authCode
    }
    performPostRequest(serviceRootUrl + "add-category", categoryJsonForServer, onAddNewCategorySuccess, onAddNewCategoryError);
}
function onAddNewCategorySuccess(data) {
    onGetAllCategoriesNavButtonClick();
}
function onAddNewCategoryError(err) {
    console.error(err);
    $("#add-new-category-error-div").text("Вече съществува категория с такова име");
    $("#add-new-category-error-div").show();
}
function showDialogBoxToRegistrationOrSignIn() {
    $("#dialog-registration-confirm").text("За да използвате тази услуга, трябва да сте влезли с акаунта си.");
    $("#dialog-registration-confirm").dialog({
        resizable: false,
        height: 140,
        modal: true,
        buttons: {
            "Вход": function () {
                onSigninNavButtonClick()
                $(this).dialog("close");
            },
            "Регистрация": function () {
                onRegisterNavButtonClick();
                $(this).dialog("close");
            },

            "Отмени": function () {
                $(this).dialog("close");
            }
        },
    });
}

//Get all users
function onGetAllUsersNavButtonClick(e) {
    performGetRequest(serviceRootUrl + "users-all",
        onGetAllUsersSuccess, onGetAllUsersError);
}
function onGetAllUsersSuccess(users) {
    $("section h2").text("Всички потребители в играта");
    setPageInfo("");
    var usersTableHtml =
        '<table id="all-users-table" class="font-size18">' +
            '<colgroup>' +
                '<col style="width: 300px" />' +
                '<col style="width: 100px" />' +
                '<col style="width: 160px" />' +
            '</colgroup>' +
            '<thead>' +
                '<tr>' +
                    '<td class="bg-color-light-yellow">Псевдоним: </td>' +
                    '<td class="bg-color-light-yellow">Резултат: </td>' +
                    '<td class="bg-color-light-yellow">Изиграни игри: </td>' +
                '</tr>' +
            '</thead>' +
            '<tbody>';
    for (var i = 0; i < users.length; i++) {
        var user = users[i];
        usersTableHtml +=
            '<tr data-nickname="' + user.nickname + '">' +
                '<td>' + user.nickname + '</td>' +
                '<td>' + roundNumbers(user.score, 2) + '</td>' +
                '<td>' + user.games + '</td>'
        '</tr>';
    }
    usersTableHtml +=
             '</tbody>' +
           '</table>';

    $("#main-container").html(usersTableHtml);
    $("#all-users-table tbody tr").on("click", onUserItemClick);
}
function onGetAllUsersError(err) {
    console.error(JSON.stringify(err));
}

//Get user score
function onUserItemClick(e) {
    var currentClickedUserNickName = $(this).data("nickname");
    performGetRequest(serviceRootUrl + "user-score?nickname=" + currentClickedUserNickName,
        onGetUserScoreSuccess, onGetUserScoreError);
}
function onGetUserScoreSuccess(userData) {
    $("section h2").text("Резултати на потребител: " + userData.nickname);
    setPageInfo("");
    var userInfoHtml =
        '<div id="some-user-score" class="font-size18">' +
            '<span class="text-color-light-yellow">Псевдоним: </span>' + userData.nickname + '<br />' +
            '<span class="text-color-light-yellow">Общ резултат: </span>' + userData.totalScore + '<br />' +
            '<span class="text-color-light-yellow">Изиграни игри: </span>' + userData.totalGamesPlayed + '<br /><br />' +
            '<span class="text-color-light-yellow">Резултати по категории:</span><br /><br />';
    for (var i = 0; i < userData.categoryScores.length; i++) {
        var category = userData.categoryScores[i];
        userInfoHtml +=
            '<span class="text-color-light-yellow">Категория: ' + category.category + '</span>:<br />' +
            'Резултат: ' + category.score + '<br />' +
            'Изиграни игри: ' + category.gamesPlayed + '<br /><br />';
    }

    userInfoHtml += '</div>';
    $("#main-container").html(userInfoHtml);
}
function onGetUserScoreError(err) {
    console.error(JSON.stringify(err));
}

//Mouse hover on tittle
function mouseOverOnTitleHandler() {
    $("header h1 span").css('color', '#FFE9C6');
    $("header h1").css('color', '#756A57');
}
function mouseOutOnTitleHandler() {
    $("header h1").css('color', '#FFE9C6');
    $("header h1 span").css('color', '#756A57');
}

//Preparing to New Game. Get All Categories
function onStartNewGameNavBtnClick(e) {
    if (!sessionStorage.userName) {
        showDialogBoxToRegistrationOrSignIn();
    } else {
        showPageForNewGame();
    }
}
function showPageForNewGame() {
    performGetRequest(serviceRootUrl + "categories", onGetAllCategoriesDDSuccess, onGetAllCategoriesForDDError);
}
function onGetAllCategoriesDDSuccess(categories) {
    setTitleForContent("Започване на нова игра");
    //setPageInfo("След като натиснете бутона за започване на игра имате 5 минути да отговорите на въпросите.");
    var selectCategoryForm = '<form id="select-category-form" action="">' +
            '<select id="select-category" name="categories">' +
                '<option value="" selected="selected" disabled="true">Изберете категория</option>' +
                '<option data-id="0" value="">Произволна</option>';
    for (var i = 0; i < categories.length; i++) {
        category = categories[i];
        selectCategoryForm += '<option data-id="' + category.id + '" value="">' + category.name + '</option>';
    }
    selectCategoryForm += '</select><button id="start-new-game-btn" class="custom-light-yellow-button">Започване на играта!</button>' +
   '</form>';

    $("#main-container").html(selectCategoryForm);

    $("#start-new-game-btn").on("click", onStartNewGameClick);
}
function onGetAllCategoriesForDDError(err) {
    console.error(err);
}

//Starting new Game
function onStartNewGameClick(e) {
    var currentSelectedCategory = $("#select-category").find('option:selected').attr('data-id');
    if (currentSelectedCategory == undefined) {
        $("#dialog-registration-confirm").text("Трябва да изберете категория.");
        $("#dialog-registration-confirm").dialog({
            resizable: false,
            height: 140,
            modal: true,
            buttons: {
                "Добре": function () {
                    $(this).dialog("close");
                }
            },
        });
    }
    var userInfoForServer = {
        "username": sessionStorage.userName,
        "authCode": sessionStorage.authCode
    };
    if (currentSelectedCategory == 0) {
        var serviceUrl = serviceRootUrl + "start-game/";
        performPostRequest(serviceUrl, userInfoForServer, onStartNewGameSuccess, onStartNewGameError);
    } else {
        var serviceUrl = serviceRootUrl + "start-game/" + currentSelectedCategory;
        performPostRequest(serviceUrl, userInfoForServer, onStartNewGameSuccess, onStartNewGameError);
    }
}
function onStartNewGameSuccess(questions) {
    var questionsHtml =
        '<div id="question-tabs" data-id="' + questions.id + '">' +
            '<ul>';
    for (var i = 0; i <= 9; i++) {
        questionsHtml += '<li><a href="#question-' + (i + 1) + '">Въпрос ' + (i + 1) + '</a></li>';
    }
    questionsHtml += '</ul>';
    for (var i = 0; i <= 9; i++) {
        var currentQuestion = questions.questions[i];

        questionsHtml +=
            '<div id="question-' + (i + 1) + '" data-id="' + currentQuestion.id + '">' +
                '<p>' +
                    '<h3>' + currentQuestion.text + '</h3>' +
                    '<form action="">';
        for (var j = 0; j < currentQuestion.answers.length; j++) {
            var currentAnswer = currentQuestion.answers[j];
            questionsHtml += '<input id="' + currentAnswer.id + '"  data-id="' + currentAnswer.id + '" type="radio" name="answer"><label for="' + currentAnswer.id + '" >' + currentAnswer.text + '</label><br />';
        }
        questionsHtml += '</form>' +
    '</p>' +
'</div>';
    }
    questionsHtml += '</div><button id="end-the-game-btn" class="custom-light-yellow-button">Приключване на играта</button>';

    $("#main-container").html(questionsHtml);
    $("#question-tabs").tabs();
    $("#end-the-game-btn").on("click", onEndGameBtnClick);
}
function onStartNewGameError(err) {
    console.error(JSON.stringify(err));
}

//End Game
function onEndGameBtnClick(e) {
    var answerInfoForServer = {
        user: {
            "username": sessionStorage.userName,
            "authCode": sessionStorage.authCode
        },
        questions: []
    };

    for (var i = 1; i <= 10; i++) {
        var currentQuestionId = $('#question-' + i).attr("data-id");
        var checkedAnswer = $('input[name=answer]:checked', '#question-' + i).attr("data-id");
        alert(currentQuestionId + "" + checkedAnswer);
        answerInfoForServer.questions.push({
            "questionId": currentQuestionId,
            "answerId": checkedAnswer
        });
    }
    var service = "post-answers/" + $("#question-tabs").attr("data-id");
    performPostRequest(serviceRootUrl + service, answerInfoForServer, onEndGameSuccess, onEndGameError);

}
function onEndGameSuccess(data) {
    $("#dialog-registration-confirm").text("Успешно приключване на игра");
    $("#dialog-registration-confirm").dialog({
        resizable: false,
        height: 140,
        modal: true,
        buttons: {
            "Добре": function () {
                $(this).dialog("close");
            }
        },
    });
}
function onEndGameError(err) {
    console.error(err);
}

//Performing Get and Post Request function
function performGetRequest(serviceUrl, onSuccess, onError) {
    $.ajax({
        url: serviceUrl,
        type: "GET",
        timeout: 20000,
        dataType: "json",
        success: onSuccess,
        error: onError
    });
}
function performPostRequest(serviceUrl, data, onSuccess, onError) {
    $.ajax({
        url: serviceUrl,
        type: "POST",
        timeout: 60000,
        dataType: "json",
        data: data,
        success: onSuccess,
        error: onError
    });
}

function roundNumbers(number, digitsAfterDecimal) {
    var result = Math.round(number * Math.pow(10, digitsAfterDecimal)) / Math.pow(10, digitsAfterDecimal);
    return result;
}
function setTextToSignedUserInfoDiv() {
    if (!sessionStorage.userName) {
        $("#current-user-info").text("В момента не сте влезли в системата.");
    } else {
        var signedInfoHtml = 'В момента сте влезли като <span>' + sessionStorage.userName + '</span>';
        $("#current-user-info").html(signedInfoHtml);
        $("#current-user-info span").addClass("text-color-light-yellow");
    }
}

