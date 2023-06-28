// TypeScript 类型系统没有加减乘除运算符，怎么做数值运算呢？
// TypeScript 类型系统中没有加减乘除运算符，但是可以通过构造不同的数组然后取 length 的方式来完成数值计算，把数值的加减乘除转化为对数组的提取和构造。
type num1 = [unknown]['length']; // 1
type num2 = [unknown, unknown]['length']; // 2
type num3 = [unknown, unknown, unknown]['length']; // 3

// 数组长度实现加减乘除
// 构造数组
type BuildArray<Length extends number, Ele = unknown, Arr extends unknown[] = []> = Arr['length'] extends Length
  ? Arr
  : BuildArray<Length, Ele, [...Arr, Ele]>;

// 加法
type Add<Num1 extends number, Num2 extends number> = [...BuildArray<Num1>, ...BuildArray<Num2>]['length'];

type AddResult = Add<123, 456>; // 579

// 减法
// 构造 Num1 长度的数组，通过模式匹配提取出 Num2 长度个元素，剩下的放到 infer 声明的局部变量 Rest 里
// 取 Rest 的长度返回，就是减法的结果
type Subtract<Num1 extends number, Num2 extends number> = BuildArray<Num1> extends [
  ...arr1: BuildArray<Num2>,
  ...arr2: infer Rest,
]
  ? Rest['length']
  : never;

type SubtractResult = Subtract<321, 100>; // 221

// 乘法
// 乘法是多个加法的累加，所以添加类型参数 ResultArr 保存累加的结果，默认值是 [] === 0
// 每加一次就把 Num2 - 1，直到 Num2 为 0，就代表加完了
// 加的过程就是往 ResultArr 中放一个 Num1 个元素
// 这样递归进行累加，也就是递归的往 ResultArr 中放元素
type Multiply<Num1 extends number, Num2 extends number, ResultArr extends unknown[] = []> = Num2 extends 0
  ? ResultArr['length']
  : Multiply<Num1, Subtract<Num2, 1>, [...BuildArray<Num1>, ...ResultArr]>;

type MultiplyResult = Multiply<11, 6>; // 66 === 11 + 11 + 11 + 11 + 11 + 11

// 除法
// 乘法是递归的累加，那除法就是递归的累减
// 所以除法的实现就是被减数不断减去减数，直到减为 0，记录减了几次就是结果
type Divide<Num1 extends number, Num2 extends number, CountArr extends unknown[] = []> = Num1 extends 0
  ? CountArr['length']
  : Divide<Subtract<Num1, Num2>, Num2, [unknown, ...CountArr]>;

type DivideResult = Divide<100, 5>; // 20

// 数组长度实现计数
// 求字符串长度
type StrLen<Str extends string, CountArr extends unknown[] = []> = Str extends `${string}${infer Rest}`
  ? StrLen<Rest, [...CountArr, unknown]>
  : CountArr['length'];

type SteLenResult = StrLen<'hello '>; // 6

// 两个数值的比较
// 往一个数组类型中不断放入元素取长度，如果先到了 A，那就是 B 大，否则就是 A 大。
// Num1 和 Num2 是待比较的两个数，CountArr 是计数用的，会不断累加，默认值是 [] === 0
// 如果 Num1 extends Num2，代表相等，直接返回 false
// 否则判断计数数组的长度，如果先到了 Num2，说明 Num1 大，返回 true
// 反之，如果先到了 Num1，说明 Num2 大，返回 false
// 如果都没到就往 CountArr 放入一个元素，继续递归
type GreaterThan<Num1 extends number, Num2 extends number, CountArr extends unknown[] = []> = Num1 extends Num2
  ? false
  : Num2 extends CountArr['length']
  ? true
  : Num1 extends CountArr['length']
  ? false
  : GreaterThan<Num1, Num2, [...CountArr, unknown]>;

type GreaterThanResult = GreaterThan<3, 4>; // false

type GreaterThanResult2 = GreaterThan<10, 4>; // true

// 斐波那契数列
// 斐波那契数列当前数是前两个数的和 F(0) = 1，F(1) = 1, F(n) = F(n - 1) + F(n - 2)（n ≥ 2，n ∈ N*）
// 也就是递归的加法
// PrevArr 是代表之前累加值的数组，CurrentArr 是代表当前数值的数组
// IndexArr 用于记录 index，每次递归 + 1，默认值 [] === 0
// Num 代表求解数列的第几个数
// 判断当前 index 是否到了 Num，到了就返回当前的数值 CurrentArr['length']
// 否则求出当前 index 对应的数值，用之前的数加上当前的数 [...PrevArr, ...CurrentArr]
// index + 1，也就是 [...IndexArr, unknown]，然后继续递归
type FibonacciLoop<
  PrevArr extends unknown[],
  CurrentArr extends unknown[],
  IndexArr extends unknown[] = [],
  Num extends number = 1,
> = IndexArr['length'] extends Num
  ? CurrentArr['length']
  : FibonacciLoop<CurrentArr, [...PrevArr, ...CurrentArr], [...IndexArr, unknown], Num>;

type Fibonacci<Num extends number> = FibonacciLoop<[1], [], [], Num>;

// 计算出第 20 个数是 6765
type FibonacciResult = Fibonacci<20>; // 6765

// 评论区：优化了一下斐波那契函数，可以少传一个参数
type Fib<
  Num extends number,
  PreArr1 extends unknown[] = [unknown],
  PreArr2 extends unknown[] = [unknown],
> = Num extends 1 | 2 ? PreArr2['length'] : Fib<Subtract<Num, 1>, PreArr2, [...PreArr1, ...PreArr2]>;

type FibonacciResult2 = Fibonacci<20>; // 6765
