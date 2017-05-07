﻿"use strict";
wf.define('meetingCard', [], function () {

    var meeting = wf.require('meeting');
    var meetingTime = wf.require('meetingTime');
    var meetingCheck = wf.require('meetingCheck');

    return function ($trigger, $scope, date) {

        var $saveBtn = $scope.find('.meeting-save');
        var $deleteBtn = $scope.find('.meeting-delete');
        var $startTime = $scope.find('.meeting-startTime');
        var $endTime = $scope.find('.meeting-endTime');
        var $meetDate = $('.meeting-date');
        var SAVED_CLS = 'meeting-saved';
        var EDIT_CLS = 'meeting-edit';
        var EDITING_CLS = 'meeting-editing';
        var MEETING_LIST = '.meeting-list-wrapper';
        var ERROR_CLS = 'meeting-error';

        var findByName = (name) => {
            return $scope.find('[name="{0}"]'.format(name));
        };
        var format = function (str) {
            if (str.substring(0, 1) > 1) {
                str = '0' + str;
            }
            return str;
        }
        var prevData = function () {
            var fields = ['tableRoom', 'startTime', 'endTime'];
            var model = { date: date };
            var prevDataArr = [];
            $saveBtn.parents('.meeting-card').siblings('.meeting-saved').each(function () {
                var cardData = [];
                $(this).find('.wf-select-input').each(function () {
                    var $this = $(this);
                    cardData.push($this.val());
                });
                for (var i = 0; i < cardData.length; i++) {
                    model[fields[i]] = cardData[i];
                }
                prevDataArr.push(model);
            });
            return prevDataArr;
        }

        var prapareData = function () {
            var model = {};
            var result = { date: date };
            var fields = ['id', 'title', 'userName', 'tableRoom', 'startTime', 'endTime'];
            fields.forEach(field=> {
                model[field] = findByName(field);
            });
            if (!model.title.val()) { model.title.focus(); return null; }
            if (!model.userName.val()) { model.userName.focus(); return null; }
            for (var key in model) {
                result[key] = model[key].val();
            }
            var check = meetingCheck();
            var prevDataArr = prevData();
            var flag = true;
            result.startTime = format(result.startTime);
            result.endTime = format(result.endTime);
            if (result.endTime <= result.startTime) {
                flag = false;
                var $selection = $saveBtn.parent().prev().find('.wf-select-selection').addClass(ERROR_CLS);
                setTimeout(function () {
                    $selection.removeClass(ERROR_CLS);
                }, 2000);
                return;
            }
            for (var i = 0; i < prevDataArr.length; i++) {
                if (!check.check(result, prevDataArr[i])) {
                    flag = false;
                    $saveBtn.parent().parent().addClass(ERROR_CLS);
                    setTimeout(function () {
                        $saveBtn.parent().parent().removeClass(ERROR_CLS);
                    }, 2000);
                }
            }
            if (flag) { return result; }
        };

        $startTime.find('.time-option')
            .html(meetingTime.render(date, findByName('startTime').val()));
        $endTime.find('.time-option')
            .html(meetingTime.render(date, findByName('endTime').val()));

        $saveBtn.click(function () {
            var data = prapareData();
            if (data) {
                meeting.save(data, rsp=> {
                    if (rsp.success) {
                        //成功
                        if (!data.id) {
                            findByName('id').val(rsp.id);
                        }
                        $saveBtn.parent().parent().addClass(SAVED_CLS);
                        $scope.closest(MEETING_LIST).removeClass(EDITING_CLS);
                    } else {
                        //失败
                        $('#message-trigger').click();
                    }
                });
            }
        });
        $deleteBtn.click(function () {
            var id = findByName('id').val();
            var uiRemove = function () {
                $scope.closest(MEETING_LIST).removeClass(EDITING_CLS);
                $scope.remove();
            }
            //删除已有
            if (id) {
                meeting.remove(id, rsp=> {
                    if (rsp.success) {
                        //成功
                        uiRemove();
                    } else {
                        //失败
                    }
                });
            } else {
                uiRemove();
            }
        });

        $scope.hover(function () {
            if ($(this).hasClass(SAVED_CLS)) {
                $(this).find('.' + EDIT_CLS).show();
            }
        }, function () {
            $(this).find('.' + EDIT_CLS).hide();
        });
        $scope.find('.' + EDIT_CLS + ' .wf-btn').click(function () {
            $scope.removeClass(SAVED_CLS).closest(MEETING_LIST).addClass(EDITING_CLS);;
            $(this).parent().hide();
        });
        return {
            addTo: function ($container) {
                $container.append($scope);
                $scope.closest(MEETING_LIST).addClass(EDITING_CLS);
            }
        };
    };
})