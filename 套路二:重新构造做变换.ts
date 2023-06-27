// 类型编程主要的目的就是对类型做各种转换，那么如何对类型做修改呢？
// TypeScript 的 type、infer、类型参数声明的变量都不能修改，想对类型做各种变换产生新的类型就需要重新构造。

/**
 * 数组类型的重新构造
 */
// 有这样一个元祖类型
type tuple = [1, 2, 3];
// 给这个元组类型再添加一些类型，可以构造一个新的元组类型：
// 参数 Arr 是要修改的数组/元祖类型，类型参数 Ele 是添加的元素类型
type Push<Arr extends unknown[], Ele> = [...Arr, Ele];

type PushResult = Push<tuple, 9>; // [1, 2, 3, 9]

// 可以在后面添加，也就可以在前面添加
type Unshift<Arr extends unknown[], Ele> = [Ele, ...Arr];

type UnshiftResult = Unshift<tuple, 8>; // [8, 1, 2, 3]

// 有这两个元祖，进行合并
type tuple1 = [1, 2];

type tuple2 = ['hello', 'world'];

type Zip<First extends [unknown, unknown], Second extends [unknown, unknown]> = First extends [
  infer FirstOne,
  infer FirstTwo,
]
  ? Second extends [infer SecondOne, infer SecondTwo]
    ? [[FirstOne, FirstTwo], [SecondOne, SecondTwo]]
    : []
  : [];

type ZipResult = Zip<tuple1, tuple2>; // [[1, 2], ["hello", "world"]]

// 但是这样只能合并两个元素的元祖，如果需要任意数量就需要递归
type Zip2<First extends unknown[], Second extends unknown[]> = First extends [infer FirstOne, ...infer FirstRest]
  ? Second extends [infer SecondOne, ...infer SecondRest]
    ? [[FirstOne, SecondOne], ...Zip2<FirstRest, SecondRest>]
    : []
  : [];

type Zip2Result = Zip2<[1, 2, 3, 4], ['hello', 'world', 'every', 'one']>; // [[1, "hello"], [2, "world"], [3, "every"], [4, "one"]]

/**
 * 字符串类型的重新构造
 */
// 想把一个字符串字面量类型的转为首字母大写
// Uppercase 是 TypeScript 的内置高级类型
type CapitalizeStr<Str extends string> = Str extends `${infer First}${infer Rest}` ? `${Uppercase<First>}${Rest}` : Str;

type CapitalizeStrResult = CapitalizeStr<'hello'>; // Hello

// 下划线到驼峰形式的转换
type CamelCase<Str extends string> = Str extends `${infer Left}_${infer Right}${infer Rest}`
  ? `${Left}${Uppercase<Right>}${CamelCase<Rest>}`
  : Str;

type CamelCaseResult = CamelCase<'hello_world_every_one'>; // helloWorldEveryOne

// 可以修改自然也可以删除，我们再来做一个删除一段字符串的案例：删除字符串中的某个子串
type DropSubStr<Str extends string, SubStr extends string> = Str extends `${infer Prefix}${SubStr}${infer Suffix}`
  ? DropSubStr<`${Prefix}${Suffix}`, SubStr>
  : Str;

type DropSubStrResult = DropSubStr<'!!!HELLO!!!!!', '!'>; // HELLO

/**
 * 函数类型的重新构造
 */
// 在已有的函数类型上添加一个参数
type AppendArgument<Func extends Function, Arg> = Func extends (...args: infer Args) => infer ReturnType
  ? (...args: [...Args, Arg]) => ReturnType
  : never;

type AppendArgumentResult = AppendArgument<(name: string) => boolean, number>; // (args_0: string, args_1: number) => boolean

/**
 * 索引类型的重新构造
 * 索引类型是聚合多个元素的类型，class、对象等都是索引类型
 */
type obj = {
  readonly name: string;
  age?: number;
  gender: boolean;
};

type Mapping<Obj extends object> = {
  [Key in keyof Obj]: [Obj[Key], Obj[Key], Obj[Key]];
};

/* {
  a: [1, 1, 1];
  b: [2, 2, 2];
} */
type MappingResult = Mapping<{ a: 1; b: 2 }>;

// 除了可以对 Value 做修改，也可以对 Key 做修改，使用 as，这叫做重映射
// 因为索引可能为 string、number、symbol 类型，而这里只能接受 string 类型，所以要 & string
type UppercaseKey<Obj extends object> = {
  [Key in keyof Obj as Uppercase<Key & string>]: Obj[Key];
};

/* {
    HELLO: 1;
    WORLD: 2;
} */
type UppercaseKeyResult = UppercaseKey<{ hello: 1; world: 2 }>;

// TypeScript 提供了内置的高级类型 Record 来创建索引类型
// 指定索引和值的类型分别为 K 和 T，就可以创建一个对应的索引类型。
type Record1<K extends string | number | symbol, T> = { [P in K]: T };

// 也就是约束类型参数 Obj 为 key 为 string，值为任意类型的索引类型。
type UppercaseKey2<Obj extends Record1<string, any>> = {
  [Key in keyof Obj as Uppercase<Key & string>]: Obj[Key];
};

type UppercaseKey2Result = UppercaseKey2<{ a: 1; b: 2 }>;

// 给索引类型添加 readonly 修饰的高级类型
type ToReadonly<T> = {
  readonly [Key in keyof T]: T[Key];
};

/* {
    readonly name: string;
    readonly age: number;
} */
type ToReadonlyResult = ToReadonly<{ name: string; age: number }>;

// 同理，索引类型还可以添加可选修饰符
type ToPartial<T> = {
  [Key in keyof T]?: T[Key];
};

/* {
    name?: string | undefined;
    gender?: boolean | undefined;
} */
type ToPartialResult = ToPartial<{ name: string; gender: boolean }>;

// 可以添加 readonly 修饰，当然也可以去掉
type ToMutable<T> = {
  -readonly [Key in keyof T]: T[Key];
};

/* {
    name: string;
    age: number;
} */
type ToMutableResult = ToMutable<{ readonly name: string; age: number }>;

// 同理，也可以去掉可选修饰符
type ToRequest<T> = {
  [Key in keyof T]-?: T[Key];
};

/* {
    name: string;
    age: number;
} */
type ToRequestResult = ToRequest<{ name?: string; age: number }>;

// 可以在构造新索引类型的时候根据值的类型做下过滤
// 类型参数 Obj 为要处理的索引类型，通过 extends 约束索引为 string，值为任意类型的索引类型 Record<string, any>
// 类型参数 ValueType 为要过滤出的值的类型
type FilterByValueType<Obj extends Record<string, any>, ValueType> = {
  // 如果原来的索引值 Obj[Key] 是 ValueType 类型，索引依然为之前的索引 Key，否则设置为 never
  // never 的索引在生成新的索引类型时会被去掉。
  // 值保持不变，依然为原来索引的值
  [Key in keyof Obj as Obj[Key] extends ValueType ? Key : never]: Obj[Key];
};

interface Person {
  name: string;
  age: number;
  hobby: string[];
}

/* {
    name: string;
    age: number;
} */
type FilterByValueTypeResult = FilterByValueType<Person, string | number>;
