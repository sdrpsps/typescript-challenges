/**
 * 模式匹配
 * Typescript 类型的模式匹配是通过 extends 对类型参数做匹配，
 * 结果保存到通过 infer 声明的局部类型变量里，如果匹配就能从该局部变量里拿到提取出的类型。
 */
type PromiseType = Promise<"hello">;

// 通过 extends 对传入类型参数 P 做模式匹配。通过 infer 声明一个局部变量 Value 保存，如果匹配就返回匹配到的 Value。
type GetValueType<P> = P extends Promise<infer Value> ? Value : never;

type GetValueResult = GetValueType<PromiseType>; // hello

/**
 * 数组类型模式匹配
 */
type Arr = [1, 2, 3];

// 参数类型 Arr 通过 extends 约束为只能是数组类型，数组元素是 unknown 也就是可以任意值
type GetFirst<Arr extends unknown[]> = Arr extends [infer First, ...unknown[]]
  ? First
  : never;

type GetFirstResult = GetFirst<Arr>; // 1

type GetFirstResult2 = GetFirst<[]>; // never

// 可以提取第一个元素，也就可以提取最后一个元素
type GetLast<Arr extends unknown[]> = Arr extends [...unknown[], infer Last]
  ? Last
  : never;

type GetLastResult = GetLast<Arr>; // 3

type GetLastResult2 = GetLast<[]>; // never

// 分别取了首尾元素，当然也可以取剩余的数组，比如取去掉了最后一个元素的数组
type PopArr<Arr extends unknown[]> = Arr extends []
  ? []
  : Arr extends [...infer Rest, unknown]
  ? Rest
  : never;

type PopArrResult = PopArr<Arr>; // [1, 2]

type PopArrResult2 = PopArr<[]>; // []

// 同理可得 ShiftArr 的实现
type ShiftArr<Arr extends unknown[]> = Arr extends []
  ? []
  : Arr extends [unknown, ...infer Rest]
  ? Rest
  : never;

type ShiftArrResult = ShiftArr<Arr>; // [2, 3]

type ShiftArrResult2 = ShiftArr<[]>; // []

/**
 * 字符串类型模式匹配
 */

// 判断字符串是否以某个前缀开头
// 需要声明字符串 Str 和 匹配的前缀 Prefix 两个类型参数，都为 string
// 用 Str 去匹配一个模式类似，模式前缀是 Prefix，后面是任意的 string。如果匹配返回 true 否则返回 false
type StartWith<
  Str extends string,
  Prefix extends string
> = Str extends `${Prefix}${string}` ? true : false;

type StartWithResult = StartWith<"hello world", "hello">; // true

type StartWithResult2 = StartWith<"hello world", "bye">; // false

// 字符串替换
// 模式串由 From 和之前之后的字符串构成，把之前之后的字符串放到局部变量 Prefix 和 Suffix。
// 用 Prefix 和 Suffix 加上替换到字符串 To 构成新的字符串类型返回。
type ReplaceStr<
  Str extends string,
  From extends string,
  To extends string
> = Str extends `${infer Prefix}${From}${infer Suffix}`
  ? `${Prefix}${To}${Suffix}`
  : Str;

type ReplaceStrResult = ReplaceStr<"hello everyone", "hello", "bye">; // bye everyone

type ReplaceStrResult2 = ReplaceStr<"hello everyone", "world", "bye">; // hello everyone

// 能够匹配和替换字符串，那也就能实现去掉空白字符的 Trim
// 不过因为不知道有多少个空白字符，所以只能一个个递归匹配去掉。
// 如果 Str 匹配字符串 + 空白字符（空格、换行、制表符），那就把字符串放到局部变量 Rest 里。
type TrimRight<Str extends string> = Str extends `${infer Rest}${
  | " "
  | "\n"
  | "\t"}`
  ? TrimRight<Rest>
  : Str;

type TrimRightResult = TrimRight<"hello     ">; // hello

// 同理可得 TrimLeft
type TrimLeft<Str extends string> = Str extends `${
  | " "
  | "\n"
  | "\t"}${infer Rest}`
  ? TrimLeft<Rest>
  : Str;

type TrimLeftResult = TrimLeft<"    hello">; // hello

// TrimRight 结合 TrimLeft 就是 Trim
type TrimStr<Str extends string> = TrimRight<TrimLeft<Str>>;

type TrimStrResult = TrimStr<"    oh, yes    ">; // oh, yes

/**
 * 函数模式匹配
 */
// 函数类型可以通过模式匹配来提取参数的类型
// 类型参数 Func 是要匹配的函数类型，通过 extends 约束为 Function。
// Func 与模式类型做匹配，参数类型放到用 infer 声明的局部变量 Args 里，返回可以是任何类型，用 unknown。
type GetParameters<Func extends Function> = Func extends (
  ...args: infer Args
) => unknown
  ? Args
  : never;

type GetParametersResult = GetParameters<(name: string, age: number) => string>; // [name: string, age: number]

// 能提取参数类型，同样也可以提取返回值类型
type GetReturnType<Func extends Function> = Func extends (
  ...args: any[]
) => infer ReturnType
  ? ReturnType
  : never;

type GetReturnTypeResult = GetReturnType<() => "welcome">; // welcome

// 类
class Kun {
  name: string;

  constructor() {
    this.name = "iKun";
  }

  // 指定 this 的类型，检查 this 指向是否正确
  say(this: Kun) {
    return "Hello, I'm " + this.name;
  }
}

const kun = new Kun();

// 用对象.方法名的方式调用的时候，this 就指向那个对象。
kun.say();

// 这里的 this 类型同样也可以通过模式匹配提取出来
// T 是待处理的类型，用 T 匹配一个模式类型，提取 this 到局部变量
type GetThisParameterType<T> = T extends (
  this: infer ThisType,
  ...args: any[]
) => any
  ? ThisType
  : unknown;

type GetThisParameterTypeResult = GetThisParameterType<typeof kun.say>; // Kun

/**
 * 构造器
 */
// 构造器和函数的区别是，构造器是用于创建对象的，所以可以被 new。
// 同样，我们也可以通过模式匹配提取构造器的参数和返回值的类型
interface Person {
  name: string;
}

// 构造器类型可以用 interface 声明，使用 new(): xx 的语法。

interface PersonConstructor {
  new (name: string): Person;
}

type GetInstanceType<ConstructorType extends new (...arg: any[]) => any> =
  ConstructorType extends new (...arg: any) => infer InstanceType
    ? InstanceType
    : any;

type GetInstanceTypeResult = GetInstanceType<PersonConstructor>; // Person

// 那同样也可以提取构造器的参数类型
type GetInstanceParameters<ConstructorType extends new (...args: any) => any> =
  ConstructorType extends new (...args: infer ParametersType) => any
    ? ParametersType
    : never;

type GetInstanceParametersResult = GetInstanceParameters<PersonConstructor>; // [name: string]

/**
 * 索引类型
 */
// 提取 Props 里 ref 的类型
// 类型 Props 为待处理的类型
// 通过 keyof Props 取出 Props 的所有索引构成的联合类型，判断下 ref 是否在其中，也就是 'ref' extends keyof Props
// 如果有 ref 这个索引的话，就通过 infer 提取 Value 的类型返回，否则返回 never
type GetProps<Props> = "ref" extends keyof Props
  ? Props extends { ref?: infer Value | undefined }
    ? Value
    : never
  : never;

type GetPropsResult = GetProps<{ ref?: 1; name: "hello" }>;

type GetPropsResult2 = GetProps<{ name: "hello" }>;
