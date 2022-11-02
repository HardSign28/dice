$(function () {

    const total = {
        cpu: 0,
        user: 0,
    }
    let loading = false;
    const $startButton = $('#start');

    // Нажатие кнопки Бросить кости
    $startButton.click(function () {
        start();
    });

    // Закрытие уведомления нажатием на крестик
    $('.alert-close').on('click', function () {
        $(this).parents('.alert').toggleClass('d-block', false);
    });

    // Запускает игру
    async function start() {
        if (loading) return;
        if (total.cpu >= 10 || total.user >= 10) {
            showModal();
            return
        }

        let user = 0;
        let cpu = 0;

        setLoading(true);

        // Включаем анимацию
        animateDice();

        // Отправляем запрос в API и получаем два случайных числа
        await $.ajax({
            method: 'GET', url: 'https://www.randomnumberapi.com/api/v1.0/random?min=1&max=6&count=2', timeout: 5000
        }).done(function (done) {
            cpu = done[0];
            user = done[1];
        }).fail(function () {
            // alert( "error" );
        }).always(function () {
            setLoading(false);
        });

        $('#cpu').html(template(cpu));
        $('#user').html(template(user));


        // Выводим уведомление о выигрыше, проигрыша или ничьей
        setTimeout(() => {
            if (user > cpu) {
                showAlert('success');
                total.user += 1;
            } else if (user === cpu) {
                showAlert('warning');
            } else {
                showAlert('danger');
                total.cpu += 1;
            }

            setProgress();
        }, 500);
    }

    // Возвращает шаблон кости по номеру от 1 до 6
    function template(diceValue) {
        return `<div class="dice dice-${diceValue}"></div>`
    }

    // Показывает уведомление о выигрыше, проигрыша или ничьей
    function showAlert(type) {
        $('.alert').toggleClass('show', false);

        clearTimeout(window.timeout);

        if (type === 'success') {
            $('.alert-success').toggleClass('show', true);
        } else if (type === 'danger') {
            $('.alert-danger').toggleClass('show', true);
        } else if (type === 'warning') {
            $('.alert-warning').toggleClass('show', true);
        }

        window.timeout = setTimeout(function () {
            $(`.alert-${type}`).toggleClass('show', false);
        }, 5000);
    }

    // Возвращает случайное число между min и max
    function getRandom(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min + 1) + min); // The maximum is inclusive and the minimum is inclusive
    }

    // Анимирует бросок костей
    function animateDice() {
        const animate = setInterval(() => {
            if (loading) {
                $('#cpu').html(template(getRandom(1, 6)));
                $('#user').html(template(getRandom(1, 6)));
            }
        }, 70);
        if (loading === false) {
            clearInterval(animate);
        }
    }

    // Блокирует кнопку Бросить кости и показывает лоадер
    function setLoading(state) {
        loading = state;
        $startButton.attr('disabled', state);
        $startButton.find('.spinner').toggleClass('d-none', !state);
    }

    // Визуализация прогресса и счета
    function setProgress() {
        $('#totalCpu').text(total.cpu);
        $('#totalUser').text(total.user);
        $('#progressCpu').css("width", Math.round(total.cpu/10 * 100) + '%' );
        $('#progressUser').css("width", Math.round(total.user/10 * 100) + '%' );

        showModal();
    }

    // Показывает модалку при окончании игры
    async function showModal() {
        if (total.cpu >= 10 || total.user >= 10) {
            const success = total.user > total.cpu;
            const resultText = success ? 'Вы выиграли' : 'Вы проиграли';
            const resultClass = success ? 'success' : 'danger';

            $('#final .final-result').html(`
                <h2 class="title ${resultClass}">
                    ${resultText} со счетом<br>
                    ${total.cpu} : ${total.user}
                </h2>
                <p></p>
                <p><i class="icon-emoji icon-emoji__${resultClass}"></i></p>
            `);

            $('#final').modal();
        }
    }

    $(document).on('keypress',function(e) {
        if (e.code === 'Space') {
            e.preventDefault();
            $startButton.trigger('click');
        }
    });
});