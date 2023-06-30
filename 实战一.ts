/**
 * 常用的变量命名规范有两种，一种是 KebabCase，也就是 aaa-bbb-ccc 这种中划线分割的风格，另一种是 CamelCase， 也就是 aaaBbbCcc 这种除第一个单词外首字母大写的风格。
 * 如果想实现 KebabCase 到 CamelCase 的转换，该怎么做呢？
 * 比如从 hello-and-hi 转换成 helloAndHi。
 */
type KebabCaseToCamelCase<Str extends string> = Str extends `${infer Item}-${infer Rest}`
  ? `${Item}${KebabCaseToCamelCase<Capitalize<Rest>>}`
  : Str;

type KebabCaseToCamelCaseRes = KebabCaseToCamelCase<'hello-and-hi'>;

/* 反过来 */
type CamelCaseToKebabCase<Str extends string> = Str extends `${infer First}${infer Rest}`
  ? First extends Lowercase<First> // 匹配第一个字符是否是小写
    ? `${First}${CamelCaseToKebabCase<Rest>}` // 如果是小写，则进行递归剩余字符串
    : `-${Lowercase<First>}${CamelCaseToKebabCase<Rest>}` // 如果不是小写，则在前方加上 -，转为小写，递归剩余字符串
  : Str;

type CamelCaseToKebabCaseRes = CamelCaseToKebabCase<'helloAndHi'>;

/**
 * 希望实现这样一个类型：
 * 对数组做分组，比如 1、2、3、4、5 的数组，每两个为 1 组，那就可以分为 1、2 和 3、4 以及 5 这三个 Chunk。
 */
type Chunk<
  Arr extends unknown[],
  ItemLen extends number,
  CurrentItem extends unknown[] = [],
  Res extends unknown[] = [],
> = Arr extends [infer First, ...infer Rest]
  ? CurrentItem['length'] extends ItemLen
    ? Chunk<Rest, ItemLen, [First], [...Res, CurrentItem]>
    : Chunk<Rest, ItemLen, [...CurrentItem, First], Res>
  : [...Res, CurrentItem];

type ChunkRes = Chunk<[1, 2, 3, 4, 5, 6, 7], 2>; //  [[1, 2], [3, 4], [5, 6], [7]]

/**
 * 我们希望实现这样一个功能：
 * 根据数组类型，比如 [‘a’, ‘b’, ‘c’] 的元组类型，再加上值的类型 'xxx'，构造出这样的索引类型：
 * {
    a: {
        b: {
            c: 'xxx'
        }
    }
} */
type TupleToNestedObject<Tuple extends unknown[], Value> = Tuple extends [infer First, ...infer Rest]
  ? {
      // 为什么还要 Key extends key of any ?
      // 因为 null, undefined 不能作为索引类型的 key，就需要过滤
      [Key in First as Key extends keyof any ? Key : never]: Rest extends unknown[]
        ? TupleToNestedObject<Rest, Value>
        : Value;
    }
  : Value;

/* {
    hello: {
        world: {
            1: {
                3: "done";
            };
        };
    };
} */
type TupleToNestedObjectRes = TupleToNestedObject<['hello', 'world', 1, 3], 'done'>;

/* {
    hello: {
        world: {};
    };
} */
type TupleToNestedObjectRes2 = TupleToNestedObject<['hello', 'world', undefined, 3], 'done'>;

/**
 * 我们想实现这样一个功能：
 * 把一个索引类型的某些 Key 转为 可选的，其余的 Key 不变，
 * interface Hello {
 *  name: string
 *  age: number
 *  address: string
 * }
 * 把 name 和 age 变为可选之后就是这样的：
 * interface Hello2 {
 *  name?: string
 *  age?: number
 *  address: string
 * }
 */
interface Hello {
  name: string;
  age: number;
  address: string;
}

// 调用 TS 计算
type Copy<Obj extends Record<string, any>> = {
  [Key in keyof Obj]: Obj[Key];
};

type PartialObjectPropByKeys<Obj extends Record<string, any>, Key extends keyof any> = Copy<
  Partial<Pick<Obj, Extract<keyof Obj, Key>>> & Omit<Obj, Key>
>;

/* {
    name?: string | undefined;
    age?: number | undefined;
    address: string;
} */
type PartialObjectPropByKeysRes = PartialObjectPropByKeys<Hello, 'name' | 'age'>;
