**Однослойный перцептрон. (моя реализация на JavaScript)**


1. Описание.
2. Распознавание.
3. Обучение.
4. (demo)[https://bystrovleonid.github.io/]


1. Однослойный перцептрон - самая простая искуственная нейронная сеть.
Состоит из 1 слоя нейронов.
Количество нейронов по количеству распознаваемых классов образов.
На 1 вход подаётся либо 0 либо 1, входов может быть любое количество.
Каждый нейрон имеет набор весов, по размеру равный количеству входов.
Каждый вес - это число, до обучения это случайное вещественное число от 0 до 1.
Каждый нейрон после обучения реагирует только на тот класс образов которому был обучен и не реагирует на любой другой из выборки.
Количество выходов равно количеству распознаваемых классов образов.

Пример:
Нейронная сеть которая должна распознавать цифры от 0 до 9.
На вход сети поступает чёрно-белое изображение 30x30 точек (массив из 900 точек в 1 изображении), на котором цифра от 0 до 9.
Такая сеть должна содержать 10 нейронов, по одному нейрону на цифру.
Каждый нейрон должен иметь 30x30 весов, т.е. массив из 900 весов.
У сети 10 выходов, соответственно от 0 до 9.


2. Распознавание.
На вход сети поступают бинарные данные: нули и единицы.
Эти данные поэлементно умножаются на веса нейрона и суммируются, это называется отклик нейрона.
И так с каждым нейроном в сети.
Ответ сети: выбирается тот класс образов на который был получен максимальныый отклик соответствующего нейрона.

Пример:
На вход сети поступает массив из 900 значений (нулей и единиц) назовём его I.
Веса соответсвующих нейронов назовём W0 - W9.
Для каждого нейрона соответсвующий вес нейрона умножается на значение массива и суммируется.
Для нейрона 0 это S[0] = W0[1] * I[1] + ... + W0[900] * I[900],
где W0[1] - первый элемент массива весов нейрона 0, а I[1] - первый элемент входного массива, W0[900] и I[900] соответсвенно последние элементы массивов.
для нейрона 1 это S[1] = W1[1] * I[1] + ... + W1[900] * I[900],
...
для нейрона 9 это S[9] = W9[1] * I[1] + ... + W9[900] * I[900],
Далее из массива сумм S[0] ... S[9] выбирается максимальная.
Например максимальная сумма это S[0] - отклик нейрона 0, значит с большой долей вероятности если сеть была обучена правильно на входном изображении изображён 0.


3. Обучение.
На вход сети поступают бинарные данные: нули и единицы.
Эти данные поэлементно умножаются на веса нейрона и суммируются, после суммирования применяется функция активации нейрона.
Которая в однослойном перцептроне выглядит следующим образом:
если сумма больше порога активации нейрона, то на выходе этого нейрона будет 1 иначе 0.
Порог активации обычно 0.5
Далее если нейрон дал неправильный ответ, его веса надо корректировать.
Из правильного ответа вычитается ответ этого нейрона, это называется локальная ошибка сети (это будет -1 или 1, 0 - нет ошибки).
Далее к каждому весовому коэффиценту нейрона прибавляется соответствующий элемент входных данных умноженный на локальную ошибку сети и умноженный на скорость обучения,
где скорость обучения это число подбираемое вручную или иным образом.
Веса корректируются для всех нейронов давших неправильные ответы.
На каждой итерации обучения вычисляются локальные ошибки для каждого обучающего примера.
Вычисляется глобальная ошибка сети, которая равна сумме абсолютных значений локальных ошибок сети, на одной итерации обучения.
Обучение идёт пока глобальная ошибка больше нуля и прекращается когда глобальная ошибка равна нулю.

Пример:
На вход сети поступает массив из 900 значений (нулей и единиц) назовём его I.
Веса соответсвующих нейронов назовём W0 - W9.
Для каждого нейрона соответсвующий вес нейрона умножается на значение массива и суммируется.
Для нейрона 0 это S[0] = W0[1] * I[1] + ... + W0[900] * I[900],
где W0[1] - первый элемент массива весов нейрона 0, а I[1] - первый элемент входного массива, W0[900] и I[900] соответсвенно последние элементы массивов.
далее применяется функция активации если S[0] > 0.5 то S[0] = 1 иначе S[0] = 0
После вычисления ответа сети получается массив заполненный нулями и единицами длиной 10.
Пусть на вход была подана картинка с изображением нуля.
Тогда правильный ответ сети такой: S = [1, 0, 0, 0, 0, 0, 0, 0, 0, 0]
тогда пусть в качестве примера сеть выдала такой ответ: S = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
Ни один из нейронов не активировался а, должен был активироваться нейрон с индексом 0.
Далее локальная ошибка сети будет 1 - 0 = 1. Для нейрона 0, для остальных нейронов ошибка равна нулю.
Для нейрона 0, корректируем веса, пусть скорость обучения равна 0.01 тогда:
W0[1] = W0[1] + I[1] * 1 * 0.01 - для весового коэффицента 1
W0[2] = W0[2] + I[2] * 1 * 0.01 - для весового коэффицента 2
...
W0[900] = W0[900] + I[900] * 1 * 0.01 - для весового коэффицента 900
Затем подаётся следующий пример из выборки, вычисляется ответ сети, вычисляются локальные ошибки, корректируются веса нейронов...
Цикл продолжается до тех пор пока сеть не будет ошибаться на обучающей выборке, т.е. будет правильно распознавать все цифры из обучающей выборки.


(demo)[https://bystrovleonid.github.io/]