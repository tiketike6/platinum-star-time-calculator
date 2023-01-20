/* eslint-disable max-statements */
(function () {
    // dayjsのロケール設定
    dayjs.locale('ja');

    // コース毎の元気コストの設定
    const staminaCost = {
        _2m_live3: 15 * 3,
        _2m_live2: 15 * 3,
        _2m_live: 15 * 3,
        _2m_work: 15 * 3,
        _4m_live3: 20 * 3,
        _4m_live2: 20 * 3,
        _4m_live: 20 * 3,
        _4m_work: 20 * 3,
        _6m_live3: 25 * 3,
        _6m_live2: 25 * 3,
        _6m_live: 25 * 3,
        _6m_work: 25 * 3,
        _mm_live3: 30 * 3,
        _mm_live2: 30 * 3,
        _mm_live: 30 * 3,
        _mm_work: 30 * 3,
    };

    // コース毎の獲得ptの設定
    const points = {
        _2m_live3: 142 + 142 + 142,
        _2m_live2: 142 + 142 + 50,
        _2m_live: 142 + 50 + 50,
        _2m_work: 50 + 50 + 50,
        _4m_live3: 161 + 161 + 161,
        _4m_live2: 161 + 161 + 57,
        _4m_live: 161 + 57 + 57,
        _4m_work: 57 + 57 + 57,
        _6m_live3: 180 + 180 + 180,
        _6m_live2: 180 + 180 + 74,
        _6m_live: 180 + 74 + 74,
        _6m_work: 74 + 74 + 74,
        _mm_live3: 200 + 200 + 200,
        _mm_live2: 200 + 200 + 82,
        _mm_live: 200 + 82 + 82,
        _mm_work: 82 + 82 + 82,
    };

    // コース毎の獲得ゲージの設定
    const gauges = {
        _2m_live3: 20,
        _2m_live2: 20,
        _2m_live: 20,
        _2m_work: 20,
        _4m_live3: 30,
        _4m_live2: 30,
        _4m_live: 30,
        _4m_work: 30,
        _6m_live3: 40,
        _6m_live2: 40,
        _6m_live: 40,
        _6m_work: 40,
        _mm_live3: 50,
        _mm_live2: 50,
        _mm_live: 50,
        _mm_work: 50,
    };

    // コース毎の所要時間の設定
    const minutes = {
        _2m_live3: 3 + 3 + 3,
        _2m_live2: 3 + 3 + 0.5,
        _2m_live: 3 + 0.5 + 0.5,
        _2m_work: 0.5 + 0.5 + 0.5,
        _4m_live3: 3 + 3 + 3,
        _4m_live2: 3 + 3 + 0.5,
        _4m_live: 3 + 0.5 + 0.5,
        _4m_work: 0.5 + 0.5 + 0.5,
        _6m_live3: 3 + 3 + 3,
        _6m_live2: 3 + 3 + 0.5,
        _6m_live: 3 + 0.5 + 0.5,
        _6m_work: 0.5 + 0.5 + 0.5,
        _mm_live3: 3 + 3 + 3,
        _mm_live2: 3 + 3 + 0.5,
        _mm_live: 3 + 0.5 + 0.5,
        _mm_work: 0.5 + 0.5 + 0.5,
    };

    // イベントステージの設定
    const eventStaminaCost = 20;
    const eventPoints = 3000;
    const eventMinutes = 3;

    // SPステージの設定
    const spStaminaCost = 200;
    const spStagePoints = 4500;

    // 入力値の取得
    function getFormValue() {
        const formValue = {};
        const errors = [];

        if ($('#isNow').prop('checked')) {
            $('#now').val(dayjs().format('YYYY-MM-DDTHH:mm'));
            formValue.isNow = true;
        }

        function validDateTime(field) {
            const inputValue = $(`#${field}`).val();
            if (!inputValue) {
                errors.push({
                    field: field,
                    message: '必須です。',
                });
            } else if (!dayjs(inputValue).isValid()) {
                errors.push({
                    field: field,
                    message: '日時の入力例は「2017-06-29T15:00」です。',
                });
            } else {
                formValue[field] = inputValue;
                formValue[`${field}Unix`] = dayjs(inputValue).unix();
            }
        }
        validDateTime('start');
        validDateTime('end');
        validDateTime('halfway');
        validDateTime('now');

        if (formValue.nowUnix < formValue.startUnix) {
            formValue.nowUnix = formValue.startUnix;
            formValue.isFuture = true;
        }
        if (formValue.nowUnix > formValue.endUnix) {
            formValue.nowUnix = formValue.endUnix;
        }

        formValue.endOfTodayUnix = dayjs(formValue.now).endOf('d').unix();
        if (formValue.endOfTodayUnix < formValue.startUnix) {
            formValue.endOfTodayUnix = formValue.startUnix;
        }
        if (formValue.endOfTodayUnix > formValue.endUnix) {
            formValue.endOfTodayUnix = formValue.endUnix;
        }

        function validSafeInteger(field) {
            const inputValue = $(`#${field}`).val();
            if (!inputValue) {
                errors.push({
                    field: field,
                    message: '必須です。',
                });
            } else if (!Number.isSafeInteger(Number(inputValue))) {
                errors.push({
                    field: field,
                    message: '有効な値ではありません。',
                });
            } else {
                formValue[field] = Number(inputValue);
            }
        }
        validSafeInteger('target');
        validSafeInteger('stamina');
        validSafeInteger('maxStamina');
        validSafeInteger('myPoint');
        validSafeInteger('gauge');
        validSafeInteger('mission');
        validSafeInteger('missionStage');
        validSafeInteger('spStage');

        formValue.showCourse = $('[name="showCourse"]:checked')
            .map((i) => {
                return $('[name="showCourse"]:checked').eq(i).val();
            })
            .get();
        formValue.isAutoSave = $('#autoSave').prop('checked');

        $('.error').remove();
        if (errors.length) {
            errors.forEach((error) => {
                $(`#${error.field}`).after(`<span class="error">${error.message}</span>`);
            });
            return null;
        }
        return formValue;
    }

    // 目標ポイントを計算
    function calculateTargetPoint(formValue) {
        let diffTarget = formValue.target - formValue.myPoint;
        if (diffTarget < 0) {
            diffTarget = 0;
        }
        $('#diffTarget').text(`(あと ${diffTarget.toLocaleString()} pt)`);

        $('#todaysLabel').text(`【${dayjs.unix(formValue.endOfTodayUnix).format('M/D')}の目標】`);

        const todaysTarget = Math.round(
            (formValue.target * (formValue.endOfTodayUnix - formValue.startUnix)) / (formValue.endUnix - formValue.startUnix)
        );
        let diffToday = todaysTarget - formValue.myPoint;
        if (diffToday < 0) {
            diffToday = 0;
        }
        $('#todaysTarget').text(`${todaysTarget.toLocaleString()} pt (あと ${diffToday.toLocaleString()} pt)`);

        $('#nowLabel').text(`【${dayjs.unix(formValue.nowUnix).format('M/D H:mm')}の目標】`);

        const nowTarget = Math.round((formValue.target * (formValue.nowUnix - formValue.startUnix)) / (formValue.endUnix - formValue.startUnix));
        let diffNow = nowTarget - formValue.myPoint;
        if (diffNow < 0) {
            diffNow = 0;
        }
        $('#nowTarget').text(`${nowTarget.toLocaleString()} pt (あと ${diffNow.toLocaleString()} pt)`);
    }

    // SPステージの計算
    function calculateSpStage(formValue) {
        const isBeforeHalfway = formValue.nowUnix < formValue.halfwayUnix;

        const remainingSpStage =
            dayjs.unix(formValue.endUnix).endOf('d').diff(dayjs.unix(formValue.nowUnix), 'd') +
            (isBeforeHalfway
                ? dayjs.unix(formValue.endUnix).endOf('d').diff(dayjs.unix(formValue.halfwayUnix), 'd') + 1
                : dayjs.unix(formValue.endUnix).endOf('d').diff(dayjs.unix(formValue.nowUnix), 'd')) +
            formValue.spStage;
        $('#remainingSpStage').text(`(千秋楽まであと ${remainingSpStage.toLocaleString()} 回)`);
        formValue.remainingSpStage = remainingSpStage;
    }

    // コース毎の計算
    function calculateByCouse(course, formValue, result, minCost) {
        if (formValue.showCourse.length && formValue.showCourse.indexOf(course) === -1) {
            // 表示コースでなければ計算しない
            return;
        }

        const isWork = course.indexOf('work') !== -1;
        let remainingSpStage = formValue.remainingSpStage;
        let gauge = formValue.gauge;

        let spStageTimes = 0;
        let spStageEarnedPoints = 0;

        let promotionTimes = 0;
        let promotionEarnedPoint = 0;

        let eventStageTimes = 0;
        let eventEarnedPoints = 0;

        let eventLiveTimes = 0;
        let stageTimes = 0;
        let consumedStamina = 0;

        // プロモーション回数、イベントステージ回数を計算
        while (
            formValue.target > formValue.myPoint + spStageEarnedPoints + promotionEarnedPoint + eventEarnedPoints ||
            formValue.mission > eventLiveTimes ||
            formValue.missionStage > stageTimes
        ) {
            // 累積ptが最終目標pt未満、イベント楽曲回数がミッション未満なら繰り返し
            if (remainingSpStage) {
                // SPイベントステージが可能
                spStageTimes++;
                eventLiveTimes++;
                stageTimes++;
                remainingSpStage--;
                spStageEarnedPoints += spStagePoints;
                consumedStamina += spStaminaCost;
            } else if (gauge >= 100) {
                // ゲージが100%以上ならイベントステージ
                eventStageTimes++;
                eventLiveTimes++;
                stageTimes++;
                gauge -= 100;
                eventEarnedPoints += eventPoints;
                consumedStamina += eventStaminaCost;
            } else {
                // ゲージが100%未満ならプロモーション
                promotionTimes++;
                gauge += gauges[course];
                promotionEarnedPoint += points[course];
                consumedStamina += staminaCost[course];
                if (!isWork) {
                    eventLiveTimes++;
                }
            }
        }

        // 所要時間の計算
        const requiredMinutes = minutes[course] * Math.ceil(promotionTimes) + eventMinutes * (spStageTimes + eventStageTimes);

        // 自然回復日時の計算
        const naturalRecoveryUnix = dayjs
            .unix(formValue.nowUnix)
            .add((consumedStamina - formValue.stamina) * 5, 'm')
            .unix();

        // 要回復元気の計算
        let requiredRecoveryStamina = 0;
        if (naturalRecoveryUnix > formValue.endUnix) {
            requiredRecoveryStamina = Math.ceil((naturalRecoveryUnix - formValue.endUnix) / 60 / 5);
        }

        // 計算結果を格納
        result[course] = {};

        result[course].spStageTimes = spStageTimes;
        result[course].spStageEarnedPoints = spStageEarnedPoints;

        result[course].promotionTimes = promotionTimes;
        result[course].promotionEarnedPoint = promotionEarnedPoint;

        result[course].eventTimes = eventStageTimes;
        result[course].eventEarnedPoints = eventEarnedPoints;

        result[course].consumedStamina = consumedStamina;
        result[course].naturalRecoveryUnix = naturalRecoveryUnix;
        result[course].requiredRecoveryStamina = requiredRecoveryStamina;
        result[course].requiredMinutes = requiredMinutes;
        result[course].requiredTime = '';
        if (Math.floor(requiredMinutes / 60)) {
            result[course].requiredTime += `${Math.floor(requiredMinutes / 60)}時間`;
        }
        if (Math.ceil(requiredMinutes % 60)) {
            result[course].requiredTime += `${Math.ceil(requiredMinutes % 60)}分`;
        }
        if (!result[course].requiredTime) {
            result[course].requiredTime += '0分';
        }

        // 所要時間、要回復元気の最小値を格納
        if (minCost.requiredMinutes === undefined || minCost.requiredMinutes > requiredMinutes) {
            minCost.requiredMinutes = requiredMinutes;
        }
        if (minCost.requiredRecoveryStamina === undefined || minCost.requiredRecoveryStamina > requiredRecoveryStamina) {
            minCost.requiredRecoveryStamina = requiredRecoveryStamina;
        }
    }

    // 計算結果の表示
    function showResultByCouse(course, formValue, minResult, minCost) {
        const level = course.slice(0, 3);
        if (formValue.showCourse.length && formValue.showCourse.indexOf(course) === -1) {
            // 表示コースでなければ列を非表示
            $(`.${course}`).hide();
            const colspan = $(`.${level}_header`).prop('colspan');
            if (colspan > 1) {
                $(`.${level}_header`).prop('colspan', colspan - 1);
            } else {
                $(`.${level}_header`).hide();
            }
            return;
        }
        $(`.${course}`).show();
        $(`.${level}_header`).show();

        function showResultText(field, minValue, unit, isLink) {
            let text = minValue;
            if (isLink) {
                text =
                    `<a href="../event-jewels-calculator/index.html?start=${formValue.start}&end=${formValue.end}` +
                    `&consumedStamina=${minValue}&stamina=${formValue.stamina}">${minValue.toLocaleString()}</a>`;
            }
            if (unit) {
                text += ` ${unit}`;
            }
            $(`#${field}${course}`).html(text);
        }

        showResultText('spStageTimes', minResult[course].spStageTimes.toLocaleString());
        showResultText('spStageEarnedPoints', minResult[course].spStageEarnedPoints.toLocaleString(), 'pt');

        showResultText('promotionTimes', minResult[course].promotionTimes.toLocaleString());
        showResultText('promotionEarnedPoint', minResult[course].promotionEarnedPoint.toLocaleString(), 'pt');

        showResultText('eventTimes', minResult[course].eventTimes.toLocaleString());
        showResultText('eventEarnedPoints', minResult[course].eventEarnedPoints.toLocaleString(), 'pt');

        showResultText('consumedStamina', minResult[course].consumedStamina, false, true);
        showResultText('naturalRecoveryAt', dayjs.unix(minResult[course].naturalRecoveryUnix).format('M/D H:mm'));
        showResultText('requiredRecoveryStamina', minResult[course].requiredRecoveryStamina.toLocaleString());
        showResultText('requiredTime', minResult[course].requiredTime);

        // 所要時間、要回復元気の最小値は青文字
        if (formValue.showCourse.length !== 1 && minResult[course].requiredMinutes === minCost.requiredMinutes) {
            $(`#requiredTime${course}`).addClass('info');
        } else {
            $(`#requiredTime${course}`).removeClass('info');
        }
        if (formValue.showCourse.length !== 1 && minResult[course].requiredRecoveryStamina === minCost.requiredRecoveryStamina) {
            $(`#requiredRecoveryStamina${course}`).addClass('info');
        } else {
            $(`#requiredRecoveryStamina${course}`).removeClass('info');
        }

        // 開催期限をオーバーする場合、赤文字
        if (minResult[course].naturalRecoveryUnix > formValue.endUnix) {
            $(`#naturalRecoveryAt${course}`).addClass('danger');
        } else {
            $(`#naturalRecoveryAt${course}`).removeClass('danger');
        }
        if (dayjs.unix(formValue.nowUnix).add(minResult[course].requiredMinutes, 'm').unix() > formValue.endUnix) {
            $(`#requiredTime${course}`).addClass('danger');
        } else {
            $(`#requiredTime${course}`).removeClass('danger');
        }
    }

    // タイムの計算
    function calculateTime(formValue) {
        const result = {};
        const minCost = {};

        // 計算
        Object.keys(staminaCost).forEach((course) => {
            calculateByCouse(course, formValue, result, minCost);
        });

        // 表示
        $('._2m_header').prop('colspan', 4);
        $('._4m_header').prop('colspan', 4);
        $('._6m_header').prop('colspan', 4);
        $('._mm_header').prop('colspan', 4);
        Object.keys(staminaCost).forEach((course) => {
            showResultByCouse(course, formValue, result, minCost);
        });
    }

    function save() {
        const datetimeSave = dayjs().format('YYYY/M/D H:mm');

        const saveData = {
            start: $('#start').val(),
            end: $('#end').val(),
            halfway: $('#halfway').val(),
            target: $('#target').val(),
            now: $('#now').val(),
            isNow: $('#isNow').prop('checked'),
            stamina: $('#stamina').val(),
            maxStamina: $('#maxStamina').val(),
            myPoint: $('#myPoint').val(),
            gauge: $('#gauge').val(),
            mission: $('#mission').val(),
            missionStage: $('#missionStage').val(),
            spStage: $('#spStage').val(),
            showCourse: $('[name="showCourse"]:checked')
                .map((i) => {
                    return $('[name="showCourse"]:checked').eq(i).val();
                })
                .get(),
            autoSave: $('#autoSave').prop('checked'),
            datetimeSave: datetimeSave,
        };

        localStorage.setItem(location.href.replace('index.html', ''), JSON.stringify(saveData));

        $('#datetimeSave').text(datetimeSave);
        $('#loadSave').prop('disabled', false);
        $('#clearSave').prop('disabled', false);
    }

    function toggleDisabledButton(formValue) {
        Object.keys(staminaCost).forEach((course) => {
            if (formValue.gauge >= gauges[course]) {
                $(`.beforePlayPromotion[value="${course}"]`).prop('disabled', false);
                $(`.beforePlayEvent[value="${course}"]`).prop('disabled', true);
            } else {
                $(`.beforePlayPromotion[value="${course}"]`).prop('disabled', true);
                $(`.beforePlayEvent[value="${course}"]`).prop('disabled', false);
            }
        });
        if (formValue.gauge >= 100) {
            $('.afterPlayPromotion').prop('disabled', true);
            $('.afterPlayEvent').prop('disabled', false);
        } else {
            $('.afterPlayPromotion').prop('disabled', false);
            $('.afterPlayEvent').prop('disabled', true);
        }
    }

    // 元気の自動回復
    const maxCountDown = 5 * 60;
    let recoveryTimer = null;
    function setRecoveryTimer(formValue) {
        if (!formValue.isNow) {
            $('#staminaTimer').text('');
            clearInterval(recoveryTimer);
            recoveryTimer = null;
        } else if (formValue.stamina >= formValue.maxStamina) {
            $('#staminaTimer').text('MAX');
            clearInterval(recoveryTimer);
            recoveryTimer = null;
        } else if (!recoveryTimer) {
            let count = maxCountDown;
            recoveryTimer = setInterval(() => {
                count--;
                if (count) {
                    $('#staminaTimer').text(`あと ${Math.floor(count / 60)}分${count % 60}秒`);
                } else {
                    count = maxCountDown;
                    $('#staminaTimer').text(`あと ${Math.floor(count / 60)}分${count % 60}秒`);
                    const formValue2 = getFormValue();
                    $('#stamina').val(formValue2.stamina + 1);
                    calculate();
                }
            }, 1000);
        }
    }

    function calculate() {
        const formValue = getFormValue();
        calculateTargetPoint(formValue);
        calculateSpStage(formValue);
        calculateTime(formValue);
        toggleDisabledButton(formValue);
        setRecoveryTimer(formValue);
        if (formValue.isAutoSave) {
            save();
        }
    }

    // input要素の変更時
    $('#start').change(calculate);
    $('#end').change(calculate);
    $('#halfway').change(calculate);
    $('#target').change(calculate);
    $('#now').change(() => {
        $('#isNow').prop('checked', true);
        if ($('#now').val() !== dayjs().format('YYYY-MM-DDTHH:mm')) {
            $('#isNow').prop('checked', false);
        }
        calculate();
    });
    $('#isNow').change(calculate);
    $('#stamina').change(calculate);
    $('#maxStamina').change(calculate);
    $('#myPoint').change(calculate);
    $('#gauge').change(calculate);
    $('#mission').change(calculate);
    $('#missionStage').change(calculate);
    $('#spStage').change(calculate);
    $('[name="showCourse"]').change(() => {
        $('#showCourse-all').prop('checked', true);
        $('[name="showCourse"]').each((i) => {
            if (!$('[name="showCourse"]').eq(i).prop('checked')) {
                $('#showCourse-all').prop('checked', false);
            }
        });
        calculate();
    });
    $('#showCourse-all').change(() => {
        $('[name="showCourse"]').each((i) => {
            $('[name="showCourse"]').eq(i).prop('checked', $('#showCourse-all').prop('checked'));
        });
        calculate();
    });
    $('#update').click(calculate);
    $('#autoSave').change(calculate);

    // 回数増減ボタン
    $('.beforePlayPromotion').click(function () {
        // eslint-disable-next-line no-invalid-this
        const course = $(this).val();
        const formValue = getFormValue();
        const isWork = course.indexOf('work') !== -1;

        $('#stamina').val(formValue.stamina + staminaCost[course]);
        $('#myPoint').val(formValue.myPoint - points[course]);
        $('#gauge').val(formValue.gauge - gauges[course]);
        if (!isWork) {
            $('#mission').val(formValue.mission + 1);
        }

        calculate();
    });
    $('.afterPlayPromotion').click(function () {
        // eslint-disable-next-line no-invalid-this
        const course = $(this).val();
        const formValue = getFormValue();
        const isWork = course.indexOf('work') !== -1;

        $('#stamina').val(formValue.stamina - staminaCost[course]);
        $('#myPoint').val(formValue.myPoint + points[course]);
        $('#gauge').val(formValue.gauge + gauges[course]);
        if (!isWork) {
            $('#mission').val(formValue.mission - 1);
        }

        calculate();
    });
    $('.beforePlayEvent').click(() => {
        // eslint-disable-next-line no-invalid-this
        const formValue = getFormValue();

        $('#stamina').val(formValue.stamina + eventStaminaCost);
        $('#myPoint').val(formValue.myPoint - eventPoints);
        $('#gauge').val(formValue.gauge + 100);
        $('#mission').val(formValue.mission + 1);
        $('#missionStage').val(formValue.missionStage + 1);

        calculate();
    });
    $('.afterPlayEvent').click(() => {
        // eslint-disable-next-line no-invalid-this
        const formValue = getFormValue();

        $('#stamina').val(formValue.stamina - eventStaminaCost);
        $('#myPoint').val(formValue.myPoint + eventPoints);
        $('#gauge').val(formValue.gauge - 100);
        $('#mission').val(formValue.mission - 1);
        $('#missionStage').val(formValue.missionStage - 1);

        calculate();
    });
    $('.beforePlaySpStage').click(() => {
        // eslint-disable-next-line no-invalid-this
        const formValue = getFormValue();

        $('#stamina').val(formValue.stamina + spStaminaCost);
        $('#myPoint').val(formValue.myPoint - spStagePoints);
        $('#mission').val(formValue.mission + 1);
        $('#missionStage').val(formValue.missionStage + 1);
        $('#spStage').val(formValue.spStage + 1);

        calculate();
    });
    $('.afterPlaySpStage').click(() => {
        // eslint-disable-next-line no-invalid-this
        const formValue = getFormValue();

        $('#stamina').val(formValue.stamina - spStaminaCost);
        $('#myPoint').val(formValue.myPoint + spStagePoints);
        $('#mission').val(formValue.mission - 1);
        $('#missionStage').val(formValue.missionStage - 1);
        $('#spStage').val(formValue.spStage - 1);

        calculate();
    });

    // 保存ボタン
    $('#save').click(save);

    // 入力を初期化ボタン
    function defaultInput() {
        $('#start').val(dayjs().subtract(15, 'h').format('YYYY-MM-DDT15:00'));
        $('#end').val(dayjs().subtract(15, 'h').add(1, 'w').format('YYYY-MM-DDT20:59'));
        $('#halfway').val(dayjs().subtract(15, 'h').add(4, 'd').format('YYYY-MM-DDT15:00'));
        $('#target').val(30000);
        $('#now').val(dayjs().format('YYYY-MM-DDTHH:mm'));
        $('#isNow').prop('checked', true);
        $('#stamina').val(0);
        $('#maxStamina').val(120);
        $('#myPoint').val(0);
        $('#gauge').val(0);
        $('#mission').val(30);
        $('#missionStage').val(25);
        $('#spStage').val(1);
        $('[name="showCourse"]').each((i) => {
            if (
                ['_2m_live3', '_2m_work', '_4m_live3', '_4m_work', '_6m_live3', '_6m_work', '_mm_live3', '_mm_work'].indexOf(
                    $('[name="showCourse"]').eq(i).val()
                ) !== -1
            ) {
                $('[name="showCourse"]').eq(i).prop('checked', true);
            } else {
                $('[name="showCourse"]').eq(i).prop('checked', false);
            }
        });
        $('#showCourse-all').prop('checked', false);
        $('#autoSave').prop('checked', false);

        calculate();
    }
    $('#clearInput').click(defaultInput);

    // 保存した値を読込ボタン
    function loadSavedData() {
        const savedString = localStorage.getItem(location.href.replace('index.html', ''));

        if (!savedString) {
            return false;
        }

        const savedData = JSON.parse(savedString);

        $('#start').val(savedData.start);
        $('#end').val(savedData.end);
        $('#halfway').val(savedData.halfway);
        $('#target').val(savedData.target);
        $('#now').val(savedData.now);
        $('#isNow').prop('checked', savedData.isNow);
        $('#stamina').val(savedData.stamina);
        $('#maxStamina').val(savedData.maxStamina);
        $('#myPoint').val(savedData.myPoint);
        $('#gauge').val(savedData.gauge);
        $('#mission').val(savedData.mission);
        $('#missionStage').val(savedData.missionStage);
        $('#spStage').val(savedData.spStage);
        $('#showCourse-all').prop('checked', true);
        $('[name="showCourse"]').each((i) => {
            if (savedData.showCourse.indexOf($('[name="showCourse"]').eq(i).val()) !== -1) {
                $('[name="showCourse"]').eq(i).prop('checked', true);
            } else {
                $('[name="showCourse"]').eq(i).prop('checked', false);
                $('#showCourse-all').prop('checked', false);
            }
        });
        $('#autoSave').prop('checked', savedData.autoSave);

        calculate();

        $('#datetimeSave').text(savedData.datetimeSave);
        $('#loadSave').prop('disabled', false);
        $('#clearSave').prop('disabled', false);

        return true;
    }
    $('#loadSave').click(loadSavedData);

    // 保存した値を削除ボタン
    $('#clearSave').click(() => {
        localStorage.removeItem(location.href.replace('index.html', ''));

        $('#datetimeSave').text('削除済');
        $('#loadSave').prop('disabled', true);
        $('#clearSave').prop('disabled', true);
    });

    // 画面表示時に保存した値を読込、保存した値がなければ入力の初期化
    if (!loadSavedData()) {
        defaultInput();
    }
})();
