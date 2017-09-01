'use strict';

var form = document.forms.myForm;
var fio = form.elements.fio;
var email = form.elements.email;
var phone = form.elements.phone;
var button = form.elements.submitButton;
var formChoise = document.forms.myChoise;
var container = document.querySelector('#resultContainer');

// ФИО - ровно три слова
function validateName() {

	var fioValue = fio.value.replace(/ +/g," ").trim().split(' ');

	if (fioValue.length === 3) {
		fio.classList.remove('error');
		return true;
	}

	fio.classList.add('error');
	return false;
}


// Почта - только в зоне ya.ru,
// yandex.ru yandex.ua yandex.by,
// yandex.kz и yandex.com
function validateEmail() {

	var regexp = /[a-zA-Z0-9\.]*@(ya.ru|yandex.ru|yandex.ua|yandex.by|yandex.kz|yandex.com)/;

	if (email.value.search(regexp) >= 0) {
		email.classList.remove('error');
		return true;
	}

	email.classList.add('error');
	return false;
}


// Телефон - формат +7(999)999-99-99,
// сумма цифр не должна быть больше 30
function validatePhone() {

	var rezult = 0;
	var regexp = /^\+?7\(\d{3}\)\d{3}-\d{2}-\d{2}$/;

	if (phone.value.search(regexp) >= 0) {

		var summString = phone.value.replace(/\D+/g,"").split('');

		summString.forEach(function(item, i) {
			rezult += +item;
		});

		if (rezult <= 30) {
			phone.classList.remove('error');
			return true;
		}

	}

	phone.classList.add('error');
	return false;
}


form.addEventListener('submit', function(event){
	event.preventDefault();
	MyForm.submit();
});

var MyForm = {

	validate: function() {
		if (validateName() && validateEmail() && validatePhone()) {
			if (formChoise.answer.value === 'success.json')
				button.disabled = true;
			return { isValid: true };
		}

		var errorNameFields = [];

		if (!validateName()) errorNameFields.push('fio');
		if (!validateEmail()) errorNameFields.push('email');
		if (!validatePhone()) errorNameFields.push('phone');

		return {
			isValid: false,
			errorFields: errorNameFields
		};
	},

	getData: function() {
		return {
			fio: fio.value,
			email: email.value,
			phone: phone.value
		}
	},

	setData: function(dataForm) {
		fio.value = dataForm.fio;
		phone.value = dataForm.phone;
		email.value = dataForm.email;
	},

	submit: function() {

		var _this = this;

		if (_this.validate().isValid === true) {
			var xhr = new XMLHttpRequest();

			xhr.open('GET', form.action, false);
			xhr.send();

			if (xhr.status != 200) {
				alert('Ошибка ' + xhr.status + ': ' + xhr.statusText);
			} else {
				// вывести результат
				var data = JSON.parse(xhr.responseText);
				if (data.status === 'success') {
					container.classList.add('success');
					container.classList.remove('error');
					container.innerText = 'Success';
				} else if (data.status === 'error') {
					container.classList.add('error');
					container.classList.remove('Success');
					container.innerText = data.reason;
				} else if (data.status === 'progress') {
					container.classList.add('progress');
					container.classList.remove('error');
					container.innerText = '';
					setTimeout(function() {
						_this.submit();
					}, data.timeout);
				}
			}
		}
	}
};

// Выбор ответа
var answers = document.querySelectorAll('.options input');

for(let answer of answers) {
	answer.addEventListener('change', function() {
		form.action = answer.value;
	});
}
