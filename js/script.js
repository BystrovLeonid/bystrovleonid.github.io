'use strict';

// Распознаваемые образы.
// const C = Array(10).fill(0).map((_, i) => i);
const C = ['&#9723;', '&#9711;', '&#9651;'];

// Однослойный перцептрон:
// 1 входной слой,
// 0 скрытых слоёв,
// 1 выходной слой.
let olp = new Worker("js/olp.js");

// Обработка сообщений от перцетрона.
olp.onmessage = e => {

  switch (e.data.Command) {
    case Commands.TESTRESULT: {

      // Индекс распознанного образа.
      let imageIndex =
        e.data.result.data.indexOf(
          Math.max(...e.data.result.data)
        );

      if (imageIndex > -1) {
        // Показать распознанный образ.
        result.innerHTML = C[imageIndex];

        let max = Math.max(...e.data.result.data);
        let min = Math.min(...e.data.result.data);

        let m = Math.max(Math.abs(max), Math.abs(min));

        for (let i = 0; i < C.length; i++) {
          let v = e.data.result.data[i] / m;

          if (v > 0) {
            positiveBar[i].style.height = `${(v) * 100}%`;
            negativeBar[i].style.height = '';
          } else {
            positiveBar[i].style.height = '';
            negativeBar[i].style.height = `${(-v) * 100}%`;
          }

          neuronResponseNormalized[i].innerHTML = (v).toFixed(2);
        }

        imageButton[imageIndex].style.color = 'blue';

        setTimeout((i) => {
          imageButton[i].style.color = '';
        }, 1000, imageIndex);

      } else {

        result.innerHTML = '?';
      }
      break;
    }
    case Commands.TRAINCYCLE: {

      log.innerHTML = `[${e.data.cycle}] Ошибка: ${e.data.globalError}`;
      break;
    }
    case Commands.TRAINRESULT: {
      log.innerHTML =
        e.data.result ?
          `[${e.data.cyclesCount}] Обучен, примеры: ${e.data.samplesCount}` :
          'Ошибка';
      break;
    }
    case Commands.LOG: {

      log.innerHTML = e.data.logText;
      break;
    }
  }
};


let negativeBar = [];
let neuronResponseNormalized = [];
let positiveBar = [];
let imageButton = [];

// Кнопки, нажатие на кнопку обучает перцептрон
// конкретному образу.
let teach = document.getElementById('button-box');

// Область для рисования.
let draw = document.getElementById('draw');
// Контекст рисования.
let ctx = draw.getContext('2d');

// Маленькая область в которую помещается уменьшенное изображение образа
// перед распознаванием/обучением, масштаб на всю область.
let preview = document.createElement('canvas').getContext('2d');

// Здесь отображаются события.
let log = document.getElementById('log');

// Результат распознавания.
let result = document.getElementById('result');


// Ширина и высота области рисования.
const W = 300;
const H = 300;

// Ширина и высота образа для отправки в перцептрон.
const mW = 30;
const mH = 30;

// Переменные для прямоугольника выделения.
let l = W; // Left
let r = 0; // Right
let t = H; // Top
let b = 0; // Bottom

// Ширина линии рисования.
const lw = 20;

// Получить бинарное чёрно-белое изображение образа, 1 бит на пиксел.
function blackAndWhite1bit() {

  // Вырезать образ по прямоугольнику выделения и
  // скопировать уменьшенную копию в preview.
  // Растянув при этом образ на весь preview.
  preview.drawImage(
    draw,
    l - lw / 2,
    t - lw / 2,
    r - l + lw,
    b - t + lw,
    0, 0, mW, mH
  );

  // Данные изображения из preview.
  let image = preview.getImageData(0, 0, mW, mH).data;

  // Массив данных чёрно-белое изображения.
  // Содержит только нули и еденицы.
  let bw = [];

  // Берётся каждый 4 байт из изображения
  // RGBA - Red Green Blue Alpha
  // Поскольку изначально изображение чёрно-белое,
  // то чёрный пиксел - RGBA(0,   0,   0,   255)
  //     белый пиксел - RGBA(255, 255, 255, 255)
  // В этом цикле берётся Red.
  // 255, ?, ?, ? -> 1
  // 200, ?, ?, ? -> 1
  // 0  , ?, ?, ? -> 0
  // Т.е. сеть видит только красный.
  // Здесь же происходит нормализация входных данных,
  // 0 - нет сигнала, 1 - есть сигнал.
  for (let i = 0; i < mW * mH * 4; i += 4) {
    bw.push(image[i] == 0 ? 0 : 1);
  }

  // Проверка, нарисован ли образ.
  // Если все биты равны нулям то ничего не нарисовано.
  // Если что-то нарисовано, тогда вернуть данные.
  if (bw.some(e => e > 0)) {
    return new Matrix({
      rows: 1,
      cols: mW * mH,
      data: bw
    });
  }
}

// Рисует прямоугольник выделения.
function selectionRect(lineColor) {

  ctx.lineWidth = 1;
  ctx.strokeStyle = lineColor;

  ctx.strokeRect(
    l - lw / 2,
    t - lw / 2,
    r - l + lw,
    b - t + lw
  );
}

//
document.addEventListener('DOMContentLoaded', () => {
  // Настройка.

  // Инициализировать перцетрон.
  olp.postMessage({
    Command: Commands.INITIALIZE,
    Inputs: mW * mH,
    Outputs: C.length
  });


  // Контейнеры для столбцов диаграммы
  // и нормализованного ответа сети.
  let pd = document.getElementById('p');
  let sd = document.getElementById('s');
  let nd = document.getElementById('n');

  // Добавить кнопки с символьными представлениями образов.
  for (let i = 0; i < C.length; i++) {
    teach.innerHTML +=
      `<button data-image-index="${i}" class="button-image">${C[i]}</button>`;
    pd.innerHTML += `<span class="bar positiveBar"></span>`;
    sd.innerHTML += `<span class="neuronResponseNormalized"></span>`;
    nd.innerHTML += `<span class="bar negativeBar"></span>`;
  }

  positiveBar = document.querySelectorAll('.positiveBar');
  neuronResponseNormalized = document.querySelectorAll('.neuronResponseNormalized');
  negativeBar = document.querySelectorAll('.negativeBar');
  imageButton = document.querySelectorAll('.button-image');


  // Задать ширину и высоту окна рисования.
  draw.width = W;
  draw.height = H;

  // Задать ширину и высоту preview.
  preview.width = mW;
  preview.height = mH;

  // Закрасить окно рисования.
  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, W, H);

  // Настройка стилей рисования линии.
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = lw;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';


  // Нажатие кнопки мыши и касания, начать рисование линии.  
  function startDraw() {
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = lw;

    ctx.beginPath();
  }
  draw.addEventListener('mousedown', startDraw);
  draw.addEventListener('touchstart', startDraw);

  draw.addEventListener('touchstart', () => {
    document.body.style.position = 'fixed';
  });
  draw.addEventListener('touchend', () => {
    document.body.style.position = '';
  });

  // Рисует линию в точку (x, y).
  function drawLine(x, y) {

    // Линия.
    ctx.lineTo(x, y);
    ctx.stroke();

    // Вычисляет границы прямоугольника выделения.
    l = Math.min(l, x);
    r = Math.max(r, x);

    t = Math.min(t, y);
    b = Math.max(b, y);
  }
  draw.addEventListener('mousemove', e => {
    if (e.buttons > 0) {
      drawLine(
        e.layerX,
        e.layerY
      );
    }
  });
  draw.addEventListener('touchmove', e => {
    if (e.touches.length > 0) {
      drawLine(
        e.touches[0].clientX - draw.getBoundingClientRect().left,
        e.touches[0].clientY - draw.getBoundingClientRect().top
      );
    }
  });

  // draw.onmouseup = draw.ontouchend = () => {
  //   selectionRect('#00eeee');
  // };


  function clear() {
    ctx.fillRect(0, 0, W, H);

    l = W;
    r = 0;
    t = H;
    b = 0;

    positiveBar.forEach(e => {
      e.style.height = '';
      e.innerHTML = '';
    });
    neuronResponseNormalized.forEach(e => {
      e.innerHTML = '';
    });
    negativeBar.forEach(e => {
      e.style.height = '';
      e.innerHTML = '';
    });
    result.innerHTML = '&nbsp;';
    log.innerHTML = '&nbsp;';
  }

  // Кнопка очистить.
  document.getElementById('clear').addEventListener('click', clear);

  // Кнопка распознать.
  document.getElementById('recognize').addEventListener('click', () => {

    // Показать прямоугольник выделения.
    // Синего цвета.
    selectionRect('#0000ee');

    // Получить чёрно-белое изображение образа 1 бит.
    let x = blackAndWhite1bit();

    if (x === undefined) {
      log.textContent = 'Нарисуйте.';
      return;
    }

    // Отправить изображение в перцептрон.
    olp.postMessage({
      Command: Commands.TEST,
      X: x
    });

  }); // Кнопка распознать.


  // Обучение.
  teach.addEventListener('click', e => {

    //
    let imageIndex;

    // Индекс образа с кнопки.
    if (e.target.dataset.imageIndex === undefined) {
      if (e.target.parentElement.dataset.imageIndex === undefined) {
        return;
      } else {
        imageIndex = +e.target.parentElement.dataset.imageIndex;
      }
    } else {
      imageIndex = +e.target.dataset.imageIndex;
    }

    // Показать прямоугольник выделения.
    // Зелёным цветом.
    selectionRect('#00ee00');

    // Получить чёрно-белое изображение образа 1 бит.
    let x = blackAndWhite1bit();

    // 
    if (x === undefined) {
      log.textContent = 'Нарисуйте.';
      return;
    }

    // Матрица правильных ответов.
    let y = new Matrix({
      rows: 1,
      cols: C.length
    });

    // Задать еденицу на правильный ответ, остальные нули.
    y.data[imageIndex] = 1;

    // Обучить перцептрон новому образу.
    olp.postMessage({
      Command: Commands.TRAIN,
      X: x,
      Y: y
    });

    // Очистить поле рисования.
    clear();

  }); // Обучение.

}); // DOMContentLoaded
