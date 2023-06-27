// 递归是把问题分解为一系列相似的小问题，通过函数不断调用自身来解决这一个个小问题，直到满足结束条件，就完成了问题的求解。
// TypeScript 类型系统不支持循环，但支持递归。当处理数量（个数、长度、层数）不固定的类型的时候，可以只处理一个类型，然后递归的调用自身处理下一个类型，直到结束条件也就是所有的类型都处理完了，就完成了不确定数量的类型编程，达到循环的效果。

/**
 * Promise 的递归调用
 */
// 实现一个不确定层数的 Promise 中的 value 类型的高级类型
type ttt = Promise<Promise<Promise<Record<string, any>>>>;
// 这里是 3 层 Promise，value 类型是索引类型。
// 数量不确定，一涉及到这个就要想到用递归来做，每次只处理一层的提取，然后剩下的到下次递归做，直到结束条件。
// 所以高级类型是这样的

// 类型参数 P 是待处理的 Promise，约束为 Promise 类型，value 类型不确定，设为 unknown
// 每次只处理一个类型的提取，通过模式匹配提取出 value 的类型到 infer 声明的局部变量 ValueType 里
// 然后判断如果 ValueType 依然是 Promise 类型，就递归处理
// 结束条件就是 ValueType 不为 Promise 类型，就处理完啦所有的层数，返回此时的 ValueType
// 这样就提取到了最底层的 Promise 的 value 类型，也就是索引类型
type DeepPromiseValueType<P extends Promise<unknown>> = P extends Promise<infer ValueType>
  ? ValueType extends Promise<unknown>
    ? DeepPromiseValueType<ValueType>
    : ValueType
  : never;

type DeepPromiseValueTypeResult = DeepPromiseValueType<ttt>; // any

// 可以进一步简化，不再约束类型参数必须是 Promise，就可以少一层判断
type DeepPromiseValueType2<T> = T extends Promise<infer ValueType> ? DeepPromiseValueType2<ValueType> : T;

/**
 * 数组类型的递归
 */
// 反转元祖
type arr = [1, 2, 3, 4, 5];

type ReverseArr<Arr extends unknown[]> = Arr extends [infer First, ...infer Rest] ? [...ReverseArr<Rest>, First] : Arr;

type ReverseArrResult = ReverseArr<arr>; // [5, 4, 3, 2, 1]

type ReverseArrResult2 = ReverseArr<['a', 'b', 'c', 'd']>; // ["d", "c", "b", "a"]

// 既然递归可以做循环用，那么像查找元素这种自然也就可以实现。
type Includes<Arr extends unknown[], FindItem> = Arr extends [infer First, ...infer Rest]
  ? IsEqual<First, FindItem> extends true
    ? true
    : Includes<Rest, FindItem>
  : false;

type IsEqual<A, B> = (A extends B ? true : false) & (B extends A ? true : false);

type IncludesResult = Includes<[1, 2, 3, 4, 5, 6], 2>; // true

type IncludesResult2 = Includes<[1, 2, 3, 4, 5, 6], 9>; // false

// 可以查找自然就可以删除，只需要改下返回结果，构造一个新的数组返回
// 通过模式匹配提取数组中的一个元素的类型，如果是 Item 类型的话就删除，也就是不放入构造的新数组，直接返回之前的 Result。
type RemoveItem<Arr extends unknown[], Item, Result extends unknown[] = []> = Arr extends [infer First, ...infer Rest]
  ? IsEqual<First, Item> extends true
    ? RemoveItem<Rest, Item, Result>
    : RemoveItem<Rest, Item, [...Result, First]>
  : Result;

type RemoveItemResult = RemoveItem<[1, 2, 3, 4, 5, 6, 7, 8], 5>; // [1, 2, 3, 4, 6, 7, 8]

// 如果构造的数组类型元素个数不确定，也需要递归
type BuildArray<Length extends number, Ele = unknown, Arr extends unknown[] = []> = Arr['length'] extends Length
  ? Arr
  : BuildArray<Length, Ele, [...Arr, Ele]>;

type BuildArrayResult = BuildArray<5>; // [unknown, unknown, unknown, unknown, unknown]

/**
 * 字符串类型的递归
 */
// 替换全部字符
type ReplaceAll<
  Str extends string,
  From extends string,
  To extends string,
> = Str extends `${infer Left}${From}${infer Right}` ? `${Left}${To}${ReplaceAll<Right, From, To>}` : Str;

type ReplaceAllResult = ReplaceAll<'hello hello hello', 'hello', 'world'>; // world world world

// 每个字符都提取出来组成联合类型
type StringToUnion<Str extends string> = Str extends `${infer First}${infer Rest}`
  ? First | StringToUnion<Rest>
  : never;

type StringToUnionResult = StringToUnion<'hello'>; // "h" | "e" | "l" | "o"

// 实现了数组的反转，自然也可以实现字符串类型的反转
type ReverseStr<Str extends string, Result extends string = ''> = Str extends `${infer First}${infer Rest}`
  ? ReverseStr<Rest, `${First}${Result}`>
  : Result;

type ReverseStrResult = ReverseStr<'hello'>; // olleh

/**
 * 对象类型的递归
 * 对象类型的递归，也可以叫做索引类型的递归。
 */
type obj = {
  a: {
    b: {
      c: {
        f: () => 'dong';
        d: {
          e: {
            hello: string;
          };
        };
      };
    };
  };
};

type DeepReadonly<Obj extends Record<string, any>> = {
  readonly [Key in keyof Obj]: Obj[Key] extends object
    ? Obj[Key] extends Function
      ? Obj[Key]
      : DeepReadonly<Obj[Key]>
    : Obj[Key];
};

/* 但是这里没有计算下一层，因为 ts 的类型只有在被用到的时候才会进行计算
 {
    readonly a: DeepReadonly<{
        b: {
            c: {
                f: () => 'dong';
                d: {
                    e: {
                        hello: string;
                    };
                };
            };
        };
    }>;
} */
type DeepReadonlyResult = DeepReadonly<obj>;

// 如果需要计算 可以在前面加上一段 Obj extends any 等
/**
 * type DeepReadonlyResult2 = {
    readonly a: {
        readonly b: {
            readonly c: {
                readonly f: () => 'dong';
                readonly d: {
                    readonly e: {
                        readonly hello: string;
                    };
                };
            };
        };
    };
}
 */
type DeepReadonly2<Obj extends Record<string, any>> = Obj extends any
  ? {
      readonly [Key in keyof Obj]: Obj[Key] extends object
        ? Obj[Key] extends Function
          ? Obj[Key]
          : DeepReadonly<Obj[Key]>
        : Obj[Key];
    }
  : never;

type DeepReadonlyResult2 = DeepReadonly2<obj>;
