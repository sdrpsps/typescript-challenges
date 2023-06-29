// 类型的判断要根据它的特性来，比如判断联合类型就要根据它的 distributive 的特性。
// 如何判断一个类型是 any 类型呢
// any 类型与任何类型交叉都是 any
type IsAny<T> = 'hello' extends 'world' & T ? true : false;

type IsAnyResult = IsAny<any>; // true

type IsAnyResult2 = IsAny<'hello'>; // false

// 之前实现的 IsEqual 是这样写的
type IsEqual<A, B> = (A extends B ? true : false) & (B extends A ? true : false);

// 因为 any 可以是任何类型，任何类型也都是 any，所以这样写判断不出 any 的类型
type IsEqualResult = IsEqual<'a', any>; // true

// 所以会这样写
type IsEqual2<A, B> = (<T>() => T extends A ? 1 : 2) extends <T>() => T extends B ? 1 : 2 ? true : false;

// 这是因为 TS 对这种形式的类型做了特殊处理，是一种 hack 的写法
type IsEqual2Result = IsEqual2<'a', any>; // false

// 判断是否联合类型
// 这里的 A 是单个类型，B 是整个联合类型，所以根据 [B] extends [A] 是否成立来判断是否是联合类型。（详见上节）
type IsUnion<A, B = A> = A extends A ? ([B] extends [A] ? false : true) : never;

type IsUnionResult = IsUnion<1 | 2>; // true

type IsUnionResult2 = IsUnion<1>; // false

// never 在条件类型中也比较特殊，如果条件类型左边是类型参数，并且传入的是 never，那么直接返回 never
type TestNever<T> = T extends number ? 1 : 2;

type TestNeverResult = TestNever<never>; // never

// 判断是否 never，就不能直接 T extends number
type IsNever<T> = [T] extends [never] ? true : false;

type IsNeverResult = IsNever<never>; // true

type IsNeverResult2 = IsNever<1>; // false

// 除此之外，any 在条件类型中也比较特殊。如果类型参数为 any，会直接返回 trueType 和 falseType 的合并
type TestAny<T> = T extends number ? 1 : 2;

type TestAnyResult = TestAny<any>; // 1 | 2

// 联合类型、never、any 在作为条件类型的类型参数时的这些特殊情况，也会在后面的原理篇来解释原因。

// 元组类型怎么判断？它与数组有什么区别？
// 元组类型的 length 是数字字面量，而数组的 length 是 number
type len = [1, 2, 3]['length']; // 3

type len2 = number[]['length']; // number

// 元组和数组的 length 是有区别的，就可以根据这两个特性来判断元组类型
// A 是 B 类型，并且 B 也是 A 类型，那么就是同一个类型，返回 false，否则返回 true
type NotEqual<A, B> = (<T>() => T extends A ? 1 : 2) extends <T>() => T extends B ? 1 : 2 ? false : true;

type IsTuple<T> = T extends [...params: infer Eles] ? NotEqual<Eles['length'], number> : false;

// 传入元组时
type IsTupleResult = IsTuple<[1, 2, 3]>; // true

// 传入数组时
type IsTupleResult2 = IsTuple<number[]>; // false

// 类型之间是有父子关系的，更具体的那个是子类型
// 比如 A 和 B 的交叉类型 A & B 就是联合类型 A ｜ B 的子类型，因为更具体
// 如果允许父类型赋值给子类型，就叫做逆变
// 如果允许子类型赋值给父类型，就叫做协变
// （关于逆变、协变等概念的详细解释可以看原理篇）
// 在 TS 中有函数参数是有逆变的性质的，也就是如果参数可能是多个类型，参数类型就会变成它们的交叉类型
// 所以联合转交叉可以这样实现
// 类型 U 是要转换的联合类型
// U extends U 是为了触发让每个类型单独传入计算，最后合并
// 利用 U 作为参数构造个函数，通过模式匹配取函数的类型
// 结果就是交叉类型
type UnionToIntersection<U> = (U extends U ? (x: U) => unknown : never) extends (x: infer R) => unknown ? R : never;

// 函数参数的逆变性质一般就联合类型转交叉类型会用，记住就行
/* {
    hello: 1;
} & {
    world: 2;
} */
type UnionToIntersectionResult = UnionToIntersection<{ hello: 1 } | { world: 2 }>;

// 如何提取索引类型中的可选索引呢
// 这就要利用可选索引的特性：可选索引的值为 undefined 和值类型的联合类型
type obj = {
  name: string;
  age?: number;
};

// 过滤可选索引，就要构造一个新的索引类型，过程中做过滤
// 类型参数 Obj 为待处理的索引类型，类型约束为索引为 string、值为任意类型的索引类型 Record<string, any>
// 用映射的语法重新构造索引类型，索引是之前的索引，也就是 Key in keyof Obj，但要做一些过滤，也就是 as 之后的部分
// 过滤的方式就是单独取出该索引之后，判断空对象是否是其子类型
// 这里的 Pick 是 TS 提供的内置高级类型，就是取出某个 Key 构造新的索引类型
// 比如单独取出 age 构造的新的索引类型是这样的
/* {
    age?: number | undefined;
} */
type res = Pick<obj, 'age'>;
// 可选的意思是这个索引可能没有，没有的时候，那 Pick<Obj, Key> 就是空的
// 所以 {} extends Pick<Obj, Key> 就能过滤出可选索引
// 值的类型依然是之前的，也就是 Obj[Key]
// 这样，就能过滤出所有可选索引，构成新的索引类型
type GetOptional<Obj extends Record<string, any>> = {
  [Key in keyof Obj as {} extends Pick<Obj, Key> ? Key : never]: Obj[Key];
};

// 可选的意思是指有没有这个索引，而不是索引值是不是可能 undefined
/* {
    age?: number | undefined;
} */
type GetOptionalResult = GetOptional<obj>;

// 过滤非可选索引
type IsRequired<Key extends keyof Obj, Obj> = {} extends Pick<Obj, Key> ? never : Key;

type GetRequired<Obj extends Record<string, any>> = {
  [Key in keyof Obj as IsRequired<Key, Obj>]: Obj[Key];
};

/* {
    name: string;
} */
type GetRequiredResult = GetRequired<obj>;

// 索引类型可能有索引，也可能有可索引签名
// 这里的 sleep 是具体的索引，[key: string]: any 就是可以索引签名，代表可以添加任意个 string 类型的索引
type Hello = {
  [key: string]: any;
  sleep(): void;
};

// 如果想删除索引类型中的可索引签名呢
// 同样根据它的性质，索引签名不能构成字符串字面量类型，因为它没有名字，而其他索引可以
// 通过映射类型语法构造新的索引类型，索引是之前的索引 Key in keyof Obj，但是要做一些过滤，也就是 as 之后的部分
// 如果索引是字符串字面量类型，那么就保留，否则返回 never，代表过滤掉。值保持不变，也就是 Obj[Key]
type RemoveIndexSignature<Obj extends Record<string, any>> = {
  [Key in keyof Obj as Key extends `${infer Str}` ? Str : never]: Obj[Key];
};

/* {
    sleep: () => void;
} */
type RemoveIndexSignatureResult = RemoveIndexSignature<Hello>;

// 如何过滤出 class 的 public 属性呢？
// 也是同样根据特性：keyof 只能拿到 class 的 public 索引，private 和 protected 的索引会被忽略
class Person {
  public name: string;
  protected age: number;
  private hobbies: string[];

  constructor() {
    this.name = 'hello';
    this.age = 20;
    this.hobbies = ['sleep', 'eat'];
  }
}

// keyof 只能拿到 name
type publicKey = keyof Person; // name

// 所以可以根据这个特性实现 public 索引的过滤
type ClassPublicProps<Obj extends Record<string, any>> = {
  [Key in keyof Obj]: Obj[Key];
};

/* {
    name: string;
} */
type ClassPublicPropsResult = ClassPublicProps<Person>;

// TS 默认推导出来的类型并不是字面量类型
// 比如对象
const obj = {
  a: 1,
  b: 2,
};

/* {
    a: number;
    b: number;
} */
type objType = typeof obj;

// 数组
const arr = [1, 2, 3];

type arrType = typeof arr; // number[]

// 但是类型编程很多时候是需要推导出字面量类型的，这时候就需要用 as const
const obj2 = {
  a: 1,
  b: 2,
} as const;

/* {
    readonly a: 1;
    readonly b: 2;
} */
type objType2 = typeof obj2;

const arr2 = [1, 2, 3] as const;

type arrType2 = typeof arr2; // readonly [1, 2, 3]

// 但是加上 as const 之后推到的类型是带有 readonly 的，所以通过模式匹配的时候也需要加上 readonly 的修饰才行
// 例如反转数组
type ReverseArr<Arr> = Arr extends [infer A, infer B, infer C] ? [C, B, A] : never;

type ReverseArrResult = ReverseArr<arrType2>; // never

// 加上 readonly 就可以正常匹配了
type ReverseArr2<Arr> = Arr extends readonly [infer A, infer B, infer C] ? [C, B, A] : never;

type ReverseArr2Result = ReverseArr2<arrType2>; // [3, 2, 1]
