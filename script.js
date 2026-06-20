document.addEventListener('DOMContentLoaded', function () {

  /* ===================== 主分頁切換 ===================== */
  var mainTabs = document.querySelectorAll('.main-tab');
  var mainPanes = document.querySelectorAll('.main-pane');

  mainTabs.forEach(function (tab) {
    tab.addEventListener('click', function () {
      var target = tab.getAttribute('data-main');
      mainTabs.forEach(function (t) { t.classList.remove('active'); });
      mainPanes.forEach(function (p) { p.classList.remove('active'); });
      tab.classList.add('active');
      document.getElementById(target).classList.add('active');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  });

  /* ===================== 每日行程分頁切換 ===================== */
  var pills = document.querySelectorAll('.day-pill');
  var panes = document.querySelectorAll('.day-pane');

  function activateDay(dayId) {
    pills.forEach(function (p) { p.classList.remove('active'); });
    panes.forEach(function (p) { p.classList.remove('active'); });
    var pill = document.querySelector('.day-pill[data-day="' + dayId + '"]');
    var pane = document.getElementById(dayId);
    if (pill) pill.classList.add('active');
    if (pane) pane.classList.add('active');
  }

  pills.forEach(function (pill) {
    pill.addEventListener('click', function () {
      var target = pill.getAttribute('data-day');
      activateDay(target);
      pill.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
      var daynav = document.getElementById('daynav');
      if (daynav) window.scrollTo({ top: daynav.offsetTop, behavior: 'smooth' });
    });
  });

  /* ===================== 今天自動定位 ===================== */
  (function jumpToToday() {
    var dayDates = {
      d1: '2026-08-13', d2: '2026-08-14', d3: '2026-08-15', d4: '2026-08-16',
      d5: '2026-08-17', d6: '2026-08-18', d7: '2026-08-19', d8: '2026-08-20'
    };
    var todayStr = new Date().toISOString().slice(0, 10);
    var todayDayId = null;

    Object.keys(dayDates).forEach(function (id) {
      if (dayDates[id] === todayStr) todayDayId = id;
    });

    if (todayDayId) {
      var pill = document.querySelector('.day-pill[data-day="' + todayDayId + '"]');
      if (pill) pill.classList.add('is-today');
      activateDay(todayDayId);
      // 預設停在「每日行程」分頁，並切到今天卡片
      var itineraryTab = document.querySelector('.main-tab[data-main="itinerary"]');
      if (itineraryTab) {
        document.querySelectorAll('.main-tab').forEach(function (t) { t.classList.remove('active'); });
        document.querySelectorAll('.main-pane').forEach(function (p) { p.classList.remove('active'); });
        itineraryTab.classList.add('active');
        document.getElementById('itinerary').classList.add('active');
      }
    }
  })();

  /* ===================== 認識釜山 子分頁切換 ===================== */
  var subTabs = document.querySelectorAll('.sub-tab');
  var subPanes = document.querySelectorAll('.sub-pane');

  subTabs.forEach(function (tab) {
    tab.addEventListener('click', function () {
      var target = tab.getAttribute('data-sub');
      subTabs.forEach(function (t) { t.classList.remove('active'); });
      subPanes.forEach(function (p) { p.classList.remove('active'); });
      tab.classList.add('active');
      document.getElementById(target).classList.add('active');
    });
  });

  /* ===================== 天氣資訊（Open-Meteo，免金鑰） ===================== */
  // 釜山座標
  var BUSAN_LAT = 35.1796;
  var BUSAN_LON = 129.0756;

  function weatherCodeToText(code) {
    var map = {
      0: ['☀️', '晴朗'], 1: ['🌤️', '晴時多雲'], 2: ['⛅', '多雲'], 3: ['☁️', '陰天'],
      45: ['🌫️', '有霧'], 48: ['🌫️', '有霧'],
      51: ['🌦️', '小毛雨'], 53: ['🌦️', '毛雨'], 55: ['🌧️', '大毛雨'],
      61: ['🌦️', '小雨'], 63: ['🌧️', '中雨'], 65: ['🌧️', '大雨'],
      80: ['🌦️', '陣雨'], 81: ['🌧️', '強陣雨'], 82: ['⛈️', '暴雨'],
      95: ['⛈️', '雷雨'], 96: ['⛈️', '雷雨冰雹'], 99: ['⛈️', '強烈雷雨']
    };
    return map[code] || ['🌤️', '天氣多變'];
  }

  function loadWeather() {
    var boxes = document.querySelectorAll('.weather-box');
    if (boxes.length === 0) return;

    var url = 'https://api.open-meteo.com/v1/forecast?latitude=' + BUSAN_LAT +
      '&longitude=' + BUSAN_LON +
      '&daily=weathercode,temperature_2m_max,temperature_2m_min&timezone=Asia%2FSeoul' +
      '&start_date=2026-08-13&end_date=2026-08-20';

    fetch(url)
      .then(function (res) {
        if (!res.ok) throw new Error('weather fetch failed');
        return res.json();
      })
      .then(function (data) {
        var dates = data.daily.time;
        var codes = data.daily.weathercode;
        var max = data.daily.temperature_2m_max;
        var min = data.daily.temperature_2m_min;

        boxes.forEach(function (box) {
          var d = box.getAttribute('data-date');
          var idx = dates.indexOf(d);
          if (idx === -1) {
            box.innerHTML = '<span class="weather-icon">🌤️</span><span>釜山 8 月平均 25–33°C，天氣預報要再接近出發日才查得到喔</span>';
            return;
          }
          var wc = weatherCodeToText(codes[idx]);
          box.innerHTML = '<span class="weather-icon">' + wc[0] + '</span><span>' + wc[1] +
            '　最高 ' + Math.round(max[idx]) + '°C／最低 ' + Math.round(min[idx]) + '°C</span>';
        });
      })
      .catch(function () {
        boxes.forEach(function (box) {
          box.innerHTML = '<span class="weather-icon">🌤️</span><span>釜山 8 月平均氣溫約 25–33°C，記得帶防曬與雨具（天氣預報暫時讀取不到，可能要連網才查得到）</span>';
        });
      });
  }
  loadWeather();

  /* ===================== 匯率換算小工具（浮動） ===================== */
  (function setupRateWidget() {
    var toggleBtn = document.getElementById('rateWidgetToggle');
    var widget = document.getElementById('rateWidget');
    var closeBtn = document.getElementById('rateWidgetClose');
    var quickKRW = document.getElementById('quickKRW');
    var quickTWD = document.getElementById('quickTWD');
    if (!toggleBtn || !widget) return;

    var RATE_KEY = 'busanTripRate';

    function getRate() {
      var saved = localStorage.getItem(RATE_KEY);
      return saved ? parseFloat(saved) : 0.0238;
    }

    function updateQuickResult() {
      var krw = Number(quickKRW.value) || 0;
      var twd = Math.round(krw * getRate());
      quickTWD.textContent = 'NT$' + twd.toLocaleString('zh-Hant-TW');
    }

    toggleBtn.addEventListener('click', function () {
      widget.classList.toggle('hidden');
      if (!widget.classList.contains('hidden')) quickKRW.focus();
    });
    closeBtn.addEventListener('click', function () {
      widget.classList.add('hidden');
    });
    quickKRW.addEventListener('input', updateQuickResult);
    updateQuickResult();
  })();

  /* ===================== 回到頂端 ===================== */
  (function setupBackToTop() {
    var btn = document.getElementById('backToTop');
    if (!btn) return;
    window.addEventListener('scroll', function () {
      if (window.scrollY > 500) {
        btn.classList.remove('hidden');
      } else {
        btn.classList.add('hidden');
      }
    });
    btn.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  })();

  /* ===================== 記帳本 ===================== */
  var STORAGE_KEY = 'busanTripExpenses';
  var RATE_KEY = 'busanTripRate';

  var rateInput = document.getElementById('exchangeRate');
  var form = document.getElementById('expenseForm');
  var dateInput = document.getElementById('expDate');
  var itemInput = document.getElementById('expItem');
  var categoryInput = document.getElementById('expCategory');
  var amountInput = document.getElementById('expAmount');
  var methodInput = document.getElementById('expMethod');
  var payerInput = document.getElementById('expPayer');
  var listEl = document.getElementById('expenseList');
  var totalKRWEl = document.getElementById('totalKRW');
  var totalTWDEl = document.getElementById('totalTWD');
  var payerSummaryEl = document.getElementById('payerSummary');
  var categorySummaryEl = document.getElementById('categorySummary');
  var clearBtn = document.getElementById('clearAllBtn');
  var exportBtn = document.getElementById('exportBtn');
  var exportStatus = document.getElementById('exportStatus');

  var CATEGORY_EMOJI = {
    '餐飲': '🍽️', '購物': '🛍️', '交通': '🚕', '門票': '🎫', '住宿': '🏨', '其他': '📦'
  };

  if (form) {
    // 還原匯率
    var savedRate = localStorage.getItem(RATE_KEY);
    if (savedRate) rateInput.value = savedRate;

    rateInput.addEventListener('input', function () {
      localStorage.setItem(RATE_KEY, rateInput.value);
      renderExpenses();
    });

    // 預設日期為今天，若超出旅程範圍則設為出發日
    var todayStr = new Date().toISOString().slice(0, 10);
    dateInput.value = (todayStr >= '2026-08-13' && todayStr <= '2026-08-20') ? todayStr : '2026-08-13';

    function getExpenses() {
      try {
        var raw = localStorage.getItem(STORAGE_KEY);
        return raw ? JSON.parse(raw) : [];
      } catch (e) {
        return [];
      }
    }

    function saveExpenses(list) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    }

    function formatNumber(n) {
      return n.toLocaleString('zh-Hant-TW');
    }

    function renderExpenses() {
      var expenses = getExpenses();
      var rate = parseFloat(rateInput.value) || 0;

      if (expenses.length === 0) {
        listEl.innerHTML = '<p class="empty-state">還沒有任何花費紀錄，新增第一筆吧！</p>';
      } else {
        var sorted = expenses.slice().sort(function (a, b) {
          return (b.date || '').localeCompare(a.date || '') || (b.id - a.id);
        });

        listEl.innerHTML = sorted.map(function (exp) {
          var dateLabel = exp.date ? exp.date.slice(5).replace('-', '/') : '';
          var catEmoji = CATEGORY_EMOJI[exp.category] || '📦';
          return '<div class="expense-item">' +
            '<div class="expense-info">' +
              '<p class="expense-item-name">' + catEmoji + ' ' + escapeHtml(exp.item) + '</p>' +
              '<p class="expense-item-meta">' + dateLabel + '　' + escapeHtml(exp.category || '其他') + '　' + escapeHtml(exp.method) + '　' + escapeHtml(exp.payer) + ' 付款</p>' +
            '</div>' +
            '<div style="display:flex;align-items:center;gap:6px;">' +
              '<span class="expense-item-amount">₩' + formatNumber(exp.amount) + '</span>' +
              '<button class="delete-btn" data-id="' + exp.id + '" aria-label="刪除這筆">🗑️</button>' +
            '</div>' +
          '</div>';
        }).join('');
      }

      var totalKRW = expenses.reduce(function (sum, e) { return sum + (Number(e.amount) || 0); }, 0);
      var totalTWD = totalKRW * rate;

      totalKRWEl.textContent = '₩' + formatNumber(totalKRW);
      totalTWDEl.textContent = 'NT$' + formatNumber(Math.round(totalTWD));

      var payerTotals = {};
      expenses.forEach(function (e) {
        var p = e.payer || '未指定';
        payerTotals[p] = (payerTotals[p] || 0) + (Number(e.amount) || 0);
      });

      var payerKeys = Object.keys(payerTotals);
      if (payerKeys.length === 0) {
        payerSummaryEl.innerHTML = '';
      } else {
        payerSummaryEl.innerHTML = payerKeys.map(function (p) {
          var krw = payerTotals[p];
          var twd = Math.round(krw * rate);
          return '<div class="payer-row"><span><strong>' + escapeHtml(p) + '</strong> 付了多少</span>' +
            '<span>₩' + formatNumber(krw) + '（約 NT$' + formatNumber(twd) + '）</span></div>';
        }).join('');
      }

      var categoryTotals = {};
      expenses.forEach(function (e) {
        var c = e.category || '其他';
        categoryTotals[c] = (categoryTotals[c] || 0) + (Number(e.amount) || 0);
      });

      var categoryKeys = Object.keys(categoryTotals);
      if (categoryKeys.length === 0) {
        categorySummaryEl.innerHTML = '';
      } else {
        // 依金額由大到小排序，花最多的分類排前面
        categoryKeys.sort(function (a, b) { return categoryTotals[b] - categoryTotals[a]; });
        categorySummaryEl.innerHTML = categoryKeys.map(function (c) {
          var krw = categoryTotals[c];
          var twd = Math.round(krw * rate);
          var emoji = CATEGORY_EMOJI[c] || '📦';
          return '<div class="payer-row"><span>' + emoji + ' <strong>' + escapeHtml(c) + '</strong></span>' +
            '<span>₩' + formatNumber(krw) + '（約 NT$' + formatNumber(twd) + '）</span></div>';
        }).join('');
      }

      // 重新綁定刪除按鈕
      listEl.querySelectorAll('.delete-btn').forEach(function (btn) {
        btn.addEventListener('click', function () {
          var id = Number(btn.getAttribute('data-id'));
          var updated = getExpenses().filter(function (e) { return e.id !== id; });
          saveExpenses(updated);
          renderExpenses();
        });
      });
    }

    function escapeHtml(str) {
      var div = document.createElement('div');
      div.textContent = str == null ? '' : str;
      return div.innerHTML;
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var expenses = getExpenses();
      expenses.push({
        id: Date.now(),
        date: dateInput.value,
        item: itemInput.value.trim(),
        category: categoryInput.value,
        amount: Number(amountInput.value) || 0,
        method: methodInput.value,
        payer: payerInput.value
      });
      saveExpenses(expenses);
      itemInput.value = '';
      amountInput.value = '';
      itemInput.focus();
      renderExpenses();
    });

    if (clearBtn) {
      clearBtn.addEventListener('click', function () {
        if (confirm('確定要清空所有記帳資料嗎？這個動作沒辦法復原喔。')) {
          localStorage.removeItem(STORAGE_KEY);
          renderExpenses();
        }
      });
    }

    if (exportBtn) {
      exportBtn.addEventListener('click', function () {
        var expenses = getExpenses();
        if (expenses.length === 0) {
          exportStatus.textContent = '目前還沒有任何花費紀錄喔';
          setTimeout(function () { exportStatus.textContent = ''; }, 2500);
          return;
        }
        var rate = parseFloat(rateInput.value) || 0;
        var sorted = expenses.slice().sort(function (a, b) {
          return (a.date || '').localeCompare(b.date || '') || (a.id - b.id);
        });

        var lines = ['🌊 釜山旅行記帳明細', ''];
        sorted.forEach(function (exp) {
          var dateLabel = exp.date ? exp.date.slice(5).replace('-', '/') : '';
          lines.push(dateLabel + '｜' + (exp.category || '其他') + '｜' + exp.item +
            '｜₩' + Number(exp.amount).toLocaleString('zh-Hant-TW') +
            '｜' + exp.method + '｜' + exp.payer + '付');
        });

        var totalKRW = expenses.reduce(function (sum, e) { return sum + (Number(e.amount) || 0); }, 0);
        lines.push('');
        lines.push('總計：₩' + totalKRW.toLocaleString('zh-Hant-TW') + '（約 NT$' + Math.round(totalKRW * rate).toLocaleString('zh-Hant-TW') + '）');

        var text = lines.join('\n');

        function showCopiedMessage() {
          exportStatus.textContent = '✅ 已複製，可以直接貼到 LINE 傳出去了';
          setTimeout(function () { exportStatus.textContent = ''; }, 3000);
        }

        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(text).then(showCopiedMessage).catch(function () {
            fallbackCopy(text, showCopiedMessage);
          });
        } else {
          fallbackCopy(text, showCopiedMessage);
        }
      });
    }

    function fallbackCopy(text, onSuccess) {
      var textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      try {
        document.execCommand('copy');
        onSuccess();
      } catch (e) {
        exportStatus.textContent = '複製失敗，請手動截圖明細';
        setTimeout(function () { exportStatus.textContent = ''; }, 3000);
      }
      document.body.removeChild(textarea);
    }

    renderExpenses();
  }
});
